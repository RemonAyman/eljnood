import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role } from '../types';

export interface UserProfile {
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
  avatarBase64?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  pinUnlocked: boolean;
  isHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  setPinUnlocked: (unlocked: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      pinUnlocked: false,
      isHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setPinUnlocked: (pinUnlocked) => set({ pinUnlocked }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      logout: () => set({ user: null, isAuthenticated: false, pinUnlocked: false }),
    }),
    {
      name: 'jnood-scouts-auth-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
