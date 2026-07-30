
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Filter, CheckSquare, Archive, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NotificationModule, NotificationType } from '../types';
import { NOTIFICATION_TYPE_CONFIG } from '../utils/notificationConfig';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
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
    refresh
  } = useNotifications();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-text">Notifications</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-sm text-brand-blue hover:bg-gray-100 px-3 py-1.5 rounded-lg"
                >
                  <CheckSquare size={16} />
                  Tout marquer comme lu
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une notification..."
              value={filters.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter({ onlyUnread: !filters.onlyUnread, onlyArchived: false })}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                filters.onlyUnread
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Non lus
            </button>
            <button
              onClick={() => setFilter({ onlyArchived: !filters.onlyArchived, onlyUnread: false })}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                filters.onlyArchived
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Archive size={14} />
              Archivés
            </button>

            {/* Module filter */}
            <select
              value={filters.module || ''}
              onChange={(e) => setFilter({ module: e.target.value as NotificationModule | undefined })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green bg-white"
            >
              <option value="">Tous les modules</option>
              {Object.values(NotificationModule).map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={filters.type || ''}
              onChange={(e) => setFilter({ type: e.target.value as NotificationType | undefined })}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green bg-white"
            >
              <option value="">Tous les types</option>
              {Object.values(NotificationType).map(type => (
                <option key={type} value={type}>
                  {NOTIFICATION_TYPE_CONFIG[type].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-gray-500">Chargement...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell size={48} className="mb-4 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onArchive={archive}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            {total} notification{total > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
