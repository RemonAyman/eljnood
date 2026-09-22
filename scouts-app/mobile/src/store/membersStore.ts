import { create } from 'zustand';
import { Member } from '../types';
import { fetchMembersFromFirestore } from '../services/firebaseService';

interface MembersState {
  members: Member[];
  loading: boolean;
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Member;
  updateMember: (id: string, updated: Partial<Member>) => void;
  getMemberByCode: (code: string) => Member | undefined;
  loadMembersFromFirestore: () => Promise<void>;
}

const initialMembers: Member[] = [];

export const useMembersStore = create<MembersState>((set, get) => ({
  members: initialMembers,
  loading: false,
  addMember: (newMemberData) => {
    const newMember: Member = {
      ...newMemberData,
      id: `m_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set((state) => ({ members: [newMember, ...state.members] }));
    return newMember;
  },
  updateMember: (id, updated) => {
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updated } : m))
    }));
  },
  getMemberByCode: (code) => {
    return get().members.find((m) => m.code.toLowerCase() === code.toLowerCase());
  },
  loadMembersFromFirestore: async () => {
    set({ loading: true });
    try {
      const firestoreMembers = await fetchMembersFromFirestore();
      if (firestoreMembers.length > 0) {
        // Merge: Firestore members override local ones (by code), keep local-only ones
        const existingCodes = new Set(firestoreMembers.map((m) => m.code));
        const localOnly = get().members.filter((m) => !existingCodes.has(m.code));
        set({ members: [...firestoreMembers, ...localOnly], loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
}));

