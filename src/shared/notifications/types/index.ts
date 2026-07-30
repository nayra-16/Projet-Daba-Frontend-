
import { NotificationType } from './notificationTypes';
import { NotificationPriority } from './notificationPriority';

export { NotificationType, NotificationPriority };

export enum NotificationModule {
  ELEVAGE = 'Élevage',
  PRODUCTION = 'Production',
  STOCKS = 'Stocks',
  COMMERCIAL = 'Commercial',
  FINANCES = 'Finances',
  RH = 'RH'
}

export interface NotificationAction {
  label: string;
  link: string;
}

export interface Notification {
  id: string;
  titre: string;
  description: string;
  type: NotificationType;
  priorite: NotificationPriority;
  date: string;
  heure: string;
  module: NotificationModule;
  utilisateur: string;
  lot?: string;
  lien?: string;
  estLue: boolean;
  estArchivee: boolean;
  action?: NotificationAction;
}
