import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1QVOru6jDgv7UGgbXjM8dgDap2gYYHII",
  authDomain: "carvengers-f5376.firebaseapp.com",
  projectId: "carvengers-f5376",
  storageBucket: "carvengers-f5376.firebasestorage.app",
  messagingSenderId: "468241466347",
  appId: "1:468241466347:web:780821180ac3abc6c94fae",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
