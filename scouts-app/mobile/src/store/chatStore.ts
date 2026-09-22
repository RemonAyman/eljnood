import { create } from 'zustand';
import { ChatMessage, Role } from '../types';

interface ChatRoom {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  badgeCount?: number;
}

interface ChatState {
  currentRoomId: string;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  setRoom: (roomId: string) => void;
  sendMessage: (messageData: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentRoomId: 'GENERAL',
  rooms: [
    {
      id: 'GENERAL',
      name: 'الغرفة العامة',
      subtitle: 'إعلانات وأنشطة المجموعة الكشفية',
      icon: '📢',
      badgeCount: 3,
    },
    {
      id: 'LEADERS',
      name: 'غرفة القادة',
      subtitle: 'الاجتماعات والتنسيق الداخلي للخدام',
      icon: '⚜️',
      badgeCount: 1,
    },
    {
      id: 'SQUAD',
      name: 'غرفة الفرقة',
      subtitle: 'أنشطة الطليعة والفرقة الكشفية',
      icon: '⛺',
    },
    {
      id: 'PARENTS',
      name: 'أولياء الأمور',
      subtitle: 'التواصل والاستفسارات الأسرية',
      icon: '👨‍👩‍👧',
    },
  ],
  messages: [
    {
      id: 'msg_1',
      roomId: 'GENERAL',
      senderId: 'l1',
      senderName: 'الخادم مينا نبيل',
      senderRole: 'SECTION_LEADER' as Role,
      content: 'سلام ونعمة يا أبطال، متنسوش ميعاد طابور الصباح الجمعة القادمة الساعة 8:30 صباحاً بالزي الكشفي الرسمي ⚜️',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg_2',
      roomId: 'GENERAL',
      senderId: 'u1',
      senderName: 'بيتر يوسف',
      senderRole: 'CHILD' as Role,
      content: 'حاضر يا قائد، هل محتاجين نجيب كشكول العقد والكتاب المقدس معانا؟',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'msg_3',
      roomId: 'LEADERS',
      senderId: 'l2',
      senderName: 'القائد جورج سامي',
      senderRole: 'LEADER' as Role,
      content: 'تم تجهيز خيام المعسكر الصيفي وحقائب الإسعافات الأولية وجاهزة للتوزيع.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  setRoom: (roomId: string) => {
    set({ currentRoomId: roomId });
  },
  sendMessage: (messageData) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return newMessage;
  },
}));
