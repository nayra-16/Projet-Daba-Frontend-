
import { NotificationType } from '../types/notificationTypes';
import { NotificationPriority } from '../types/notificationPriority';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

export interface NotificationConfig {
  color: string;
  bgColor: string;
  icon: typeof Bell;
  label: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationConfig> = {
  [NotificationType.INFO]: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Bell,
    label: 'Information'
  },
  [NotificationType.SUCCESS]: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: 'Succès'
  },
  [NotificationType.WARNING]: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: AlertTriangle,
    label: 'Attention'
  },
  [NotificationType.ERROR]: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: AlertCircle,
    label: 'Erreur'
  },
  [NotificationType.CRITICAL]: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertOctagon,
    label: 'Critique'
  }
};

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'Basse',
  [NotificationPriority.MEDIUM]: 'Moyenne',
  [NotificationPriority.HIGH]: 'Haute',
  [NotificationPriority.URGENT]: 'Urgente',
  [NotificationPriority.CRITICAL]: 'Critique'
};
