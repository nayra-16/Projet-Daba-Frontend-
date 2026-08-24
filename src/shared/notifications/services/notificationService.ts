
import { Notification, NotificationModule, NotificationType, NotificationPriority } from '../types';

// Mutable copy for in-memory operations (until backend API is ready)
let notifications: Notification[] = [];

export const notificationService = {
  async getNotifications(options?: {
    onlyUnread?: boolean;
    onlyArchived?: boolean;
    search?: string;
    module?: NotificationModule;
    type?: NotificationType;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...notifications];

    if (options?.onlyUnread) {
      filtered = filtered.filter(n => !n.estLue);
    }

    if (options?.onlyArchived) {
      filtered = filtered.filter(n => n.estArchivee);
    } else {
      filtered = filtered.filter(n => !n.estArchivee);
    }

    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      filtered = filtered.filter(
        n =>
          n.titre.toLowerCase().includes(searchTerm) ||
          n.description.toLowerCase().includes(searchTerm)
      );
    }

    if (options?.module) {
      filtered = filtered.filter(n => n.module === options.module);
    }

    if (options?.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }

    // Sort by date & priority (descending)
    filtered.sort((a, b) => {
      if (b.priorite !== a.priorite) {
        return b.priorite - a.priorite;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = filtered.length;

    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      filtered = filtered.slice(start, end);
    }

    const unreadCount = notifications.filter(n => !n.estLue && !n.estArchivee).length;

    return { notifications: filtered, total, unreadCount };
  },

  async getUnread(): Promise<Notification[]> {
    const result = await this.getNotifications({ onlyUnread: true });
    return result.notifications;
  },

  async getUnreadCount(): Promise<number> {
    const result = await this.getNotifications();
    return result.unreadCount;
  },

  async markAsRead(id: string): Promise<Notification | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], estLue: true };
      return notifications[index];
    }
    return undefined;
  },

  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    notifications = notifications.map(n => ({ ...n, estLue: true }));
  },

  async archive(id: string): Promise<Notification | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], estArchivee: true };
      return notifications[index];
    }
    return undefined;
  },

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const initialLength = notifications.length;
    notifications = notifications.filter(n => n.id !== id);
    return notifications.length < initialLength;
  }
};
