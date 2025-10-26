// store/useAuthStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: string;
  login: string;
  name?: string;
};

type State = {
  isAuthed: boolean;
  user: User | null;
  token: string | null;

  loginOpen: boolean;
  signupOpen: boolean;

  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;

  loginSuccess: (user: User, token: string) => void;
  setAuthed: (a: boolean, user?: User | null) => void;
  logout: () => void;

  hydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      isAuthed: false,
      user: null,
      token: null,

      loginOpen: false,
      signupOpen: false,
      openLogin: () => set({ loginOpen: true }),
      closeLogin: () => set({ loginOpen: false }),
      openSignup: () => set({ signupOpen: true }),
      closeSignup: () => set({ signupOpen: false }),

      loginSuccess: (user, token) => {
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("userId", user.id);
        } catch {}
        set({ isAuthed: true, user, token });
      },

      setAuthed: (a, user) => {
        if (!a) {
          get().logout();
          return;
        }
        set({ isAuthed: true, user: user ?? null });
      },

      logout: () => {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        } catch {}
        set({ isAuthed: false, user: null, token: null });
      },

      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isAuthed: s.isAuthed,
        user: s.user,
        token: s.token,
      }),
      onRehydrateStorage: () => (state) => {
        // колбэк вызывается, когда Zustand достаёт данные из localStorage
        state?.setHydrated(true);
      },
    }
  )
);
