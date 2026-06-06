"use client";
import { useEffect } from "react";
import { useNotificationStore } from "../store/notificationStore";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";

export function useNotifications() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const data = await notificationService.getNotifications(user.companyId, user.id);
      setNotifications(data);
    };

    load();
  }, [user, setNotifications]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markRead(id);
    markRead(id);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllRead(user.companyId, user.id);
    markAllRead();
  };

  return {
    notifications,
    unreadCount,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
  };
}