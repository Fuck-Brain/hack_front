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
  // auth
  isAuthed: boolean;
  user: User | null;
  token: string | null;

  // modals
  loginOpen: boolean;
  signupOpen: boolean;

  // actions
  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;

  // auth actions
  loginSuccess: (user: User, token: string) => void;
  setAuthed: (a: boolean, user?: User | null) => void; // для совместимости со старым кодом
  logout: () => void;
};

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      // initial
      isAuthed: false,
      user: null,
      token: null,

      // modals
      loginOpen: false,
      signupOpen: false,
      openLogin: () => set({ loginOpen: true }),
      closeLogin: () => set({ loginOpen: false }),
      openSignup: () => set({ signupOpen: true }),
      closeSignup: () => set({ signupOpen: false }),

      // mark authorized
      loginSuccess: (user, token) => {
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("userId", user.id);
        } catch {}
        set({ isAuthed: true, user, token });
      },

      // backward-compat helper (без токена)
      setAuthed: (a, user) => {
        if (!a) {
          get().logout();
          return;
        }
        set({ isAuthed: true, user: user ?? null });
      },

      // logout
      logout: () => {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        } catch {}
        set({ isAuthed: false, user: null, token: null });
      },
    }),
    {
      name: "auth", // ключ в localStorage
      storage: createJSONStorage(() => localStorage),
      // что именно сохраняем
      partialize: (s) => ({
        isAuthed: s.isAuthed,
        user: s.user,
        token: s.token,
      }),
    }
  )
);
