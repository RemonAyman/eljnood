import { create } from 'zustand';
import { Role } from '../types';

interface AuthState {
  user: {
    id: string;
    name: string;
    email?: string;
    code?: string;
    role: Role;
    phone?: string;
    guardianPhone?: string;
    sonCode?: string;
    sonName?: string;
    sectionName?: string;
    sectionLeaderName?: string;
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
