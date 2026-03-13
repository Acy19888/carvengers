import { doc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./config";
import type { AppUser } from "../../types/models";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  language?: "de" | "en";
}

/** Update user profile fields in Firestore */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<void> {
  await updateDoc(doc(db, "users", userId), { ...data });
}

/** Upload profile photo and update Firestore */
export async function uploadProfilePhoto(
  userId: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profilePhotos/${userId}.jpg`);
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);
  await updateDoc(doc(db, "users", userId), { photoUrl: downloadUrl });
  return downloadUrl;
}

/** Change password (requires re-authentication) */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Nicht angemeldet");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
