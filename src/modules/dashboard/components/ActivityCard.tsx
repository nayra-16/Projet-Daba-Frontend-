
/**
 * ActivityCard — Carte d'activité récente premium ERP DABA
 *
 * Design :
 * - Fond blanc, slate-900 en mode sombre
 * - Icône DABA dans container subtil (pas de block massif)
 * - User bold + description en gris, date en petit
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingCart, Package, CheckCircle2, Edit3, FileText, Factory } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { RecentActivity } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActivityCardProps {
  activity: RecentActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const { isDark } = useTheme();

  const ICONS: Record<string, React.ElementType> = {
    'user': User,
    'shopping-cart': ShoppingCart,
    'package': Package,
    'check-circle': CheckCircle2,
    'edit': Edit3,
    'factory': Factory,
  };
  const Icon = ICONS[activity.icon] || FileText;

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-2 border-b last:border-b-0',
        isDark ? 'border-slate-800' : 'border-surface-border'
      )}
    >
      <div className={cn(
        'w-6 h-6 mt-0.5 rounded flex items-center justify-center flex-shrink-0',
        isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-slate-500',
      )}>
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] leading-snug',
          isDark ? 'text-slate-300' : 'text-slate-700',
        )}>
          <span className={cn('font-bold mr-1', isDark ? 'text-slate-100' : 'text-slate-900')}>
            {activity.user}
          </span>
          {activity.description}
        </p>
        <p className={cn(
          'text-[10px] mt-0.5 font-medium',
          isDark ? 'text-slate-500' : 'text-slate-400',
        )}>
          {/* Formatage basique pour simuler "Aujourd'hui, HH:MM" si on n'a pas de date structurée */}
          {activity.time.includes('il y a') ? `Aujourd'hui, ${activity.time}` : activity.time}
        </p>
      </div>
    </div>
  );
};

export default ActivityCard;
