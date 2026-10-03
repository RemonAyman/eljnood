import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'CHAT' | 'MEMORY' | 'SCOUTING_PLAN' | 'CURRICULUM' | 'SYSTEM';
  senderName?: string;
  roomId?: string;
  createdAt: string;
}

interface NotificationState {
  activeNotification: AppNotification | null;
  notificationsList: AppNotification[];
  unreadCount: number;
  showBanner: (notification: Omit<AppNotification, 'id' | 'createdAt'> & { id?: string }) => void;
  hideBanner: () => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  activeNotification: null,
  notificationsList: [],
  unreadCount: 0,

  showBanner: (notifData) => {
    const notif: AppNotification = {
      ...notifData,
      id: notifData.id || `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      activeNotification: notif,
      notificationsList: [notif, ...state.notificationsList],
      unreadCount: state.unreadCount + 1,
    }));
  },

  hideBanner: () => {
    set({ activeNotification: null });
  },

  markAllAsRead: () => {
    set({ unreadCount: 0 });
  },
}));
