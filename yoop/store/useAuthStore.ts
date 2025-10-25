import { create } from "zustand";

type User = { id: string; name: string; email: string } | null;

interface AuthState {
  isAuthed: boolean;
  user: User;
  loginOpen: boolean;
  signupOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;
  setAuthed: (authed: boolean, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthed: false,
  user: null,
  loginOpen: false,
  signupOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  openSignup: () => set({ signupOpen: true }),
  closeSignup: () => set({ signupOpen: false }),
  setAuthed: (authed, user) => set({ isAuthed: authed, user: user ?? null }),
  logout: () => set({ isAuthed: false, user: null }),
}));
