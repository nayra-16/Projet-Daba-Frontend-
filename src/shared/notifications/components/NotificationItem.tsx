
import React from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '../types';
import { NOTIFICATION_TYPE_CONFIG, PRIORITY_LABELS } from '../utils/notificationConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, Archive, Trash2, ExternalLink } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete
}) => {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'p-4 border-b border-gray-100 transition-colors',
        !notification.estLue && 'bg-gray-50',
        'hover:bg-gray-100'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', config.bgColor, config.color)}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className={cn('font-semibold text-sm', !notification.estLue ? 'text-brand-text' : 'text-gray-600')}>
                  {notification.titre}
                </h4>
                {!notification.estLue && (
                  <div className="w-2 h-2 bg-brand-red rounded-full" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {notification.module} • {PRIORITY_LABELS[notification.priorite]}
              </p>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {notification.date} • {notification.heure}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{notification.description}</p>
          <div className="flex items-center gap-2 mt-3">
            {notification.action && (
              <Link
                to={notification.action.link}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-brand-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {notification.action.label}
                <ExternalLink size={12} />
              </Link>
            )}
            <div className="flex gap-1 ml-auto">
              {!notification.estLue && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded-lg"
                  title="Marquer comme lu"
                >
                  <Check size={16} />
                </button>
              )}
              {!notification.estArchivee && (
                <button
                  onClick={() => onArchive(notification.id)}
                  className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-gray-100 rounded-lg"
                  title="Archiver"
                >
                  <Archive size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1.5 text-gray-500 hover:text-brand-red hover:bg-gray-100 rounded-lg"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
