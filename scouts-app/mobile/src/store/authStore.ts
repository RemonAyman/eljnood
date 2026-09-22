import { create } from 'zustand';
import { Role } from '../types';

interface AuthState {
  user: {
    id: string;
    name: string;
    code?: string;
    role: Role;
    phone?: string;
    guardianPhone?: string;
  } | null;
  isAuthenticated: boolean;
  pinUnlocked: boolean;
  setUser: (user: AuthState['user']) => void;
  setPinUnlocked: (unlocked: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  pinUnlocked: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPinUnlocked: (pinUnlocked) => set({ pinUnlocked }),
  logout: () => set({ user: null, isAuthenticated: false, pinUnlocked: false }),
}));
