import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Notification } from "../db/schema";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (n: Notification[]) => void;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (n) =>
      set((state) => {
        state.notifications = n;
        state.unreadCount = n.filter((x) => !x.read).length;
      }),

    addNotification: (n) =>
      set((state) => {
        state.notifications.unshift(n);
        if (!n.read) state.unreadCount += 1;
      }),

    markRead: (id) =>
      set((state) => {
        const idx = state.notifications.findIndex((n) => n.id === id);
        if (idx !== -1 && !state.notifications[idx].read) {
          state.notifications[idx].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }),

    markAllRead: () =>
      set((state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      }),

    setUnreadCount: (count) =>
      set((state) => {
        state.unreadCount = count;
      }),
  }))
);