
import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationModule, NotificationType } from '../types';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    onlyUnread: false,
    onlyArchived: false,
    search: '',
    module: undefined as NotificationModule | undefined,
    type: undefined as NotificationType | undefined,
    page: 1,
    limit: 20
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(filters);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    if (unreadCount > 0) setUnreadCount(prev => prev - 1);
    fetchNotifications();
  }, [fetchNotifications, unreadCount]);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
    fetchNotifications();
  }, [fetchNotifications]);

  const archive = useCallback(async (id: string) => {
    await notificationService.archive(id);
    fetchNotifications();
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    await notificationService.delete(id);
    fetchNotifications();
  }, [fetchNotifications]);

  const setFilter = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    total,
    filters,
    setFilter,
    markAsRead,
    markAllAsRead,
    archive,
    deleteNotification,
    refresh: fetchNotifications
  };
}
