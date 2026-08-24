
/**
 * StockCard — Carte blanche premium pour les niveaux de stock réels
 *
 * Design :
 * - Fond blanc (slate-900 en mode sombre)
 * - Accent latéral DABA (rouge si alerte, bleu sinon)
 * - Barre fine (h-2) avec animation
 * - Pourcentage + état à droite
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { StockItem } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StockCardProps {
  item: StockItem;
}

const StockCard: React.FC<StockCardProps> = ({ item }) => {
  const { isDark } = useTheme();
  const isAlert = Boolean(item.alert);
  const level = Number(item.level) || 0;
  const percentage = Math.min(100, Math.max(0, Number(item.percentage) || 0));

  // Couleur DABA pour barre / accent
  const accent = isAlert ? 'bg-brand-red' : 'bg-brand-blue';
  const barColor = isAlert ? '#E11D2E' : '#244A9B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-xl border',
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-surface-border shadow-card hover:shadow-card-hover transition-shadow duration-200',
      )}
    >
      {/* Accent latéral */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', accent)} aria-hidden="true" />

      <div className="p-5 pl-6">
        {/* En-tête : nom + badge alerte */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isAlert
                ? (isDark ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-red/10 text-brand-red')
                : (isDark ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-blue/10 text-brand-blue'),
            )}>
              {isAlert ? <AlertTriangle size={16} /> : <Package size={16} />}
            </div>
            <h4 className={cn(
              'text-sm font-bold truncate',
              isDark ? 'text-slate-100' : 'text-brand-text',
            )} title={item.name}>
              {item.name}
            </h4>
          </div>
          {isAlert && (
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md whitespace-nowrap',
              isDark ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-red/10 text-brand-red',
            )}>
              Alerte
            </span>
          )}
        </div>

        {/* Niveau + unités */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className={cn(
            'text-2xl font-black tracking-tight tabular-nums',
            isDark ? 'text-slate-100' : 'text-brand-text',
          )}>
            {level.toLocaleString('fr-FR')}
          </span>
          <span className={cn(
            'text-xs font-medium',
            isDark ? 'text-slate-500' : 'text-slate-400',
          )}>
            unités
          </span>
        </div>

        {/* Barre de progression fine */}
        <div className={cn(
          'h-2 rounded-full overflow-hidden',
          isDark ? 'bg-slate-800' : 'bg-gray-100',
        )}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${percentage}%` }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
          />
        </div>

        {/* Pourcentage */}
        <div className="flex justify-end mt-1.5">
          <span className={cn(
            'text-xs font-bold tabular-nums',
            isAlert
              ? 'text-brand-red'
              : (isDark ? 'text-slate-400' : 'text-slate-500'),
          )}>
            {percentage}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default StockCard;
