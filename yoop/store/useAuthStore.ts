// store/useAuthStore.ts
import { create } from "zustand";

type User = {
  id: string;
  login: string;
  name?: string;
};

type State = {
  isAuthed: boolean;
  user: User | null;
  loginOpen: boolean;
  signupOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;

  setAuthed: (a: boolean, user?: User | null) => void;
};

export const useAuthStore = create<State>((set) => ({
  isAuthed: false,
  user: null,
  loginOpen: false,
  signupOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  openSignup: () => set({ signupOpen: true }),
  closeSignup: () => set({ signupOpen: false }),

  setAuthed: (a, user) => set({ isAuthed: a, user: user ?? null }),
}));
