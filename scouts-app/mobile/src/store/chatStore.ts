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
  messages: [
    {
      id: 'msg_gen_1',
      roomId: 'GENERAL',
      senderId: 'l1',
      senderName: 'الخادم مينا نبيل',
      senderRole: 'SECTION_LEADER' as Role,
      content: 'سلام ونعمة يا أبطال، متنسوش ميعاد طابور الصباح الجمعة القادمة الساعة 8:30 صباحاً بالزي الكشفي الرسمي ⚜️',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg_gen_2',
      roomId: 'GENERAL',
      senderId: 'u1',
      senderName: 'بيتر يوسف',
      senderRole: 'CHILD' as Role,
      content: 'حاضر يا قائد، هل محتاجين نجيب كشكول العقد والكتاب المقدس معانا؟',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'msg_sec_1',
      roomId: 'SECTOR_أشبال',
      senderId: 'l3',
      senderName: 'القائد كيرلس',
      senderRole: 'LEADER' as Role,
      content: 'يا أبطال قطاع الأشبال، تم تجهيز مسابقة حفظ الألحان وشارات الهواية لهذا الأسبوع 🦁',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'msg_sec_2',
      roomId: 'SECTOR_كشاف',
      senderId: 'l2',
      senderName: 'القائد جورج سامي',
      senderRole: 'SECTION_LEADER' as Role,
      content: 'يا فتيان قطاع الكشاف، اجتماع النيران والخيام الكشفية يوم السبت الساعة 5 مساءً ⛺',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 'msg_ldr_1',
      roomId: 'LEADERS_كشاف',
      senderId: 'l2',
      senderName: 'القائد جورج سامي (رئيس القطاع)',
      senderRole: 'SECTION_LEADER' as Role,
      content: 'اجتماع تحضير خخدام قطاع الكشاف يوم الخميس الساعة 8 مساءً بقاعة الكنيسة ⚜️',
      createdAt: new Date(Date.now() - 9000000).toISOString(),
    },
    {
      id: 'msg_mgr_1',
      roomId: 'MANAGERS_ROOM',
      senderId: 'admin_1',
      senderName: 'القائد العام / مسؤول الكشافة',
      senderRole: 'ADMIN' as Role,
      content: 'اجتماع رؤساء القطاعات وأمناء الخدمة لمناقشة ميزانية المعسكر الصيفي القادم 🛡️',
      createdAt: new Date(Date.now() - 12000000).toISOString(),
    },
  ],
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
