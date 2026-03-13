import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import type { AppUser } from "../../types/models";

// Required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  "468241466347-4rb5dejebeqp36te0uinet991pks324p.apps.googleusercontent.com";

const GOOGLE_ANDROID_CLIENT_ID =
  "468241466347-9d56dff406j2f125784okc9rr1k50t9f.apps.googleusercontent.com";

/** Hook: call useGoogleAuth() in your component to get request/promptAsync */
export function useGoogleAuthRequest() {
  return Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    // iosClientId: "YOUR_IOS_CLIENT_ID", // add when Apple Developer Account is ready
  });
}

/** Sign in to Firebase with a Google id_token */
export async function signInWithGoogle(idToken: string): Promise<AppUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const uid = result.user.uid;
  const email = result.user.email ?? "";

  // Check if user doc already exists
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data() as AppUser;
  }

  // Create new user doc
  const newUser: AppUser = {
    id: uid,
    email,
    role: "customer",
    firstName: result.user.displayName?.split(" ")[0] ?? "",
    lastName: result.user.displayName?.split(" ").slice(1).join(" ") ?? "",
    photoUrl: result.user.photoURL ?? undefined,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "users", uid), newUser);
  return newUser;
}
