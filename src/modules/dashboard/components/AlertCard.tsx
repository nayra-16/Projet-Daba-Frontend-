
/**
 * AlertCard — Carte d'alerte premium ERP DABA
 *
 * Design :
 * - Fond blanc, slate-900 en mode sombre
 * - Accent latéral DABA selon priorité (rouge haute, ambre moyenne, bleue basse)
 * - Icône dans container subtil
 * - Bordures fines, ombres discrètes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Syringe, Clock, Wrench, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { AlertItem } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AlertCardProps {
  alert: AlertItem;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { isDark } = useTheme();

  // Couleur DABA selon priorité
  const tone = alert.priority === 'Haute' ? 'red' : alert.priority === 'Moyenne' ? 'amber' : 'blue';
  const TONE = {
    red: { accent: 'bg-brand-red', iconBg: 'bg-brand-red/10', iconText: 'text-brand-red', badgeBg: 'bg-brand-red/10', badgeText: 'text-brand-red' },
    amber: { accent: 'bg-amber-500', iconBg: 'bg-amber-500/10', iconText: 'text-amber-600', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-600' },
    blue: { accent: 'bg-brand-blue', iconBg: 'bg-brand-blue/10', iconText: 'text-brand-blue', badgeBg: 'bg-brand-blue/10', badgeText: 'text-brand-blue' },
  }[tone];

  const ICONS: Record<string, React.ElementType> = {
    'alert-triangle': AlertTriangle,
    'syringe': Syringe,
    'clock': Clock,
    'wrench': Wrench,
  };
  const Icon = ICONS[alert.icon] || FileText;

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 border-b last:border-b-0',
        isDark ? 'border-slate-800' : 'border-surface-border'
      )}
    >
      <div className={cn(
        'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
        TONE.accent
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4 className={cn(
            'text-[13px] font-bold truncate',
            isDark ? 'text-slate-100' : 'text-slate-800',
          )}>
            {alert.type}
          </h4>
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            TONE.badgeText,
          )}>
            {alert.priority}
          </span>
        </div>
        <p className={cn(
          'text-[13px] leading-tight mb-1 truncate',
          isDark ? 'text-slate-400' : 'text-slate-600',
        )}>
          {alert.description}
        </p>
        <p className={cn(
          'text-[10px] font-medium',
          isDark ? 'text-slate-500' : 'text-slate-400',
        )}>
          {alert.date}
        </p>
      </div>
    </div>
  );
};

export default AlertCard;
