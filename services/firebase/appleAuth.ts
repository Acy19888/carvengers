import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import type { AppUser } from "../../types/models";

/**
 * Apple Sign-In requires:
 * - Apple Developer Account ($99/year)
 * - expo-apple-authentication (iOS only)
 * - Configuration in Firebase Console
 *
 * For now this is a placeholder. To activate:
 * 1. npx expo install expo-apple-authentication
 * 2. Configure Apple Sign-In in Firebase Auth
 * 3. Uncomment and implement below
 */

export async function signInWithApple(
  identityToken: string,
  nonce: string,
): Promise<AppUser> {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const result = await signInWithCredential(auth, credential);
  const uid = result.user.uid;
  const email = result.user.email ?? "";

  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data() as AppUser;
  }

  const newUser: AppUser = {
    id: uid,
    email,
    role: "customer",
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "users", uid), newUser);
  return newUser;
}
