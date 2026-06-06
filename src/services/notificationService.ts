import { db, Notification } from "../db/schema";
import { generateId } from "../utils/generateId";

class NotificationService {
  async getNotifications(companyId: string, userId: string, limit = 50): Promise<Notification[]> {
    return await db.notifications
      .where({ companyId, userId })
      .reverse()
      .limit(limit)
      .sortBy("createdAt");
  }

  async createNotification(data: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.notifications.add(notification);
    return notification;
  }

  async markRead(id: string): Promise<void> {
    await db.notifications.update(id, { read: true });
  }

  async markAllRead(companyId: string, userId: string): Promise<void> {
    const unread = await db.notifications
      .where({ companyId, userId })
      .filter((n) => !n.read)
      .toArray();

    await Promise.all(unread.map((n) => db.notifications.update(n.id, { read: true })));
  }

  async getUnreadCount(companyId: string, userId: string): Promise<number> {
    return await db.notifications
      .where({ companyId, userId })
      .filter((n) => !n.read)
      .count();
  }
}

export const notificationService = new NotificationService();