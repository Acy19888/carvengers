import { create } from "zustand";
import type { AppUser } from "../types/models";
import {
  signIn,
  signUp,
  logOut,
  fetchUserDoc,
  subscribeAuthState,
} from "../services/firebase/auth";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  init: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  init: () => {
    const unsubscribe = subscribeAuthState(async (fbUser) => {
      if (fbUser) {
        const appUser = await fetchUserDoc(fbUser.uid);
        set({ user: appUser, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signIn(email, password);
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signUp(email, password);
      set({ user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  logout: async () => {
    await logOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
