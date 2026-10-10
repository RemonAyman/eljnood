import { create } from 'zustand';
import { ChatMessage, Role } from '../types';

export interface ChatRoomOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category?: string;
  badgeCount?: number;
}

export const SECTOR_ICONS: Record<string, string> = {
  'براعم': '🌱',
  'أشبال': '🦁',
  'زهرات': '🌸',
  'كشاف': '⛺',
  'مرشدات': '🎗️',
  'متقدم': '🔥',
  'رائدات': '⭐',
  'جوالة': '🦅',
  'قادة': '⚜️',
};

export function getAvailableChatRoomsForUser(user: {
  role?: Role;
  sectionName?: string;
} | null): ChatRoomOption[] {
  const rooms: ChatRoomOption[] = [];

  // 1️⃣ General Chat Room (Accessible by ALL users automatically)
  rooms.push({
    id: 'GENERAL',
    title: 'الغرفة العامة (الجميع)',
    subtitle: 'إعلانات وأنشطة المجموعة ككل - جميع الأعضاء والقادة',
    icon: '📢',
  });

  const userRole = user?.role || 'CHILD';
  const userSector = user?.sectionName || 'كشاف';

  // If ADMIN or GROUP_MANAGER -> full access to all sector rooms
  if (userRole === 'ADMIN' || userRole === 'GROUP_MANAGER') {
    const allSectors = ['براعم', 'أشبال', 'زهرات', 'كشاف', 'مرشدات', 'متقدم', 'رائدات', 'جوالة'];
    allSectors.forEach((sec) => {
      rooms.push({
        id: `SECTOR_${sec}`,
        title: `غرفة قطاع (${sec})`,
        subtitle: `المحادثة الخاصة بأعضاء وقادة قطاع ${sec}`,
        icon: SECTOR_ICONS[sec] || '⛺',
      });
    });

    rooms.push({
      id: `LEADERS_${userSector}`,
      title: `غرفة قادة قطاع (${userSector})`,
      subtitle: `التنسيق والتحضير الداخلي لخدام قطاع ${userSector}`,
      icon: '⚜️',
    });

    rooms.push({
      id: 'MANAGERS_ROOM',
      title: 'رؤساء القطاعات والإدارة 🛡️',
      subtitle: 'الاجتماعات والقرارات المركزية لأمناء ورؤساء القطاعات والخدمة',
      icon: '🛡️',
    });

    return rooms;
  }

  // 2️⃣ User's Specific Sector Chat Room
  rooms.push({
    id: `SECTOR_${userSector}`,
    title: `غرفة قطاع (${userSector})`,
    subtitle: `المحادثة المباشرة الخاصة بأعضاء وقادة قطاع ${userSector}`,
    icon: SECTOR_ICONS[userSector] || '⛺',
  });

  // 3️⃣ Sector Leaders Chat Room (for Leaders, Section Leaders, Jowalah)
  const isLeaderOrHigher = ['LEADER', 'SECTION_LEADER', 'JOWALAH'].includes(userRole);
  if (isLeaderOrHigher) {
    rooms.push({
      id: `LEADERS_${userSector}`,
      title: `غرفة قادة قطاع (${userSector}) ⚜️`,
      subtitle: `التنسيق والتحضير الداخلي لخدام وقادة قطاع ${userSector}`,
      icon: '⚜️',
    });
  }

  // 4️⃣ Sector Heads & Presidents Chat Room (for Section Leaders)
  if (userRole === 'SECTION_LEADER') {
    rooms.push({
      id: 'MANAGERS_ROOM',
      title: 'رؤساء القطاعات والإدارة 🛡️',
      subtitle: 'الاجتماعات والقرارات المركزية لأمناء ورؤساء القطاعات والخدمة',
      icon: '🛡️',
    });
  }

  return rooms;
}

interface ChatState {
  currentRoomId: string;
  messages: ChatMessage[];
  setRoom: (roomId: string) => void;
  sendMessage: (messageData: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
}

export const useChatStore = create<ChatState>((set) => ({
  currentRoomId: 'GENERAL',
  messages: [],
  setRoom: (roomId: string) => {
    set({ currentRoomId: roomId });
  },
  sendMessage: (messageData) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return newMessage;
  },
}));
