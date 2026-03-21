import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";
import type { AppUser } from "../../types/models";

export async function signUp(email: string, password: string): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user: AppUser = {
    id: cred.user.uid,
    email,
    role: "customer",
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "users", user.id), user);
  return user;
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function fetchUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export function subscribeAuthState(
  callback: (user: FirebaseUser | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}
