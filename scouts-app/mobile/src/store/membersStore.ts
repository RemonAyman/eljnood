import { create } from 'zustand';
import { Member } from '../types';

interface MembersState {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Member;
  updateMember: (id: string, updated: Partial<Member>) => void;
  getMemberByCode: (code: string) => Member | undefined;
}

const initialMembers: Member[] = [
  {
    id: 'm1',
    code: 'JS-2026-448',
    name: 'بيتر يوسف فايز',
    gender: 'MALE',
    scarfStatus: 'RECEIVED', // استلم المنديل
    birthDate: '2012-09-15',
    gradeLevel: 'PREP_1',
    squadName: 'كشاف',
    phone: '01012345678',
    guardianPhone: '01229876543',
    region: 'أسيوط - حي الجمهورية',
    buildingNo: 'عمارة الأمل 3',
    street: 'شارع الكنيسة',
    addressDescription: 'متفرع من شارع الجمهورية، الدور الثالث',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    code: 'JS-2026-449',
    name: 'كيرلس مينا شحاتة',
    gender: 'MALE',
    scarfStatus: 'NOT_RECEIVED', // لم يستلم المنديل
    birthDate: '2015-04-10',
    gradeLevel: 'GRADE_4',
    squadName: 'أشبال',
    guardianPhone: '01223344556',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm3',
    code: 'JS-2026-450',
    name: 'مارينا يوسف',
    gender: 'FEMALE',
    scarfStatus: 'WITHDRAWN', // مسحوب المنديل
    birthDate: '2011-01-20',
    gradeLevel: 'PREP_2',
    squadName: 'مرشدات',
    guardianPhone: '01099887766',
    createdAt: new Date().toISOString()
  }
];

export const useMembersStore = create<MembersState>((set, get) => ({
  members: initialMembers,
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
  }
}));
