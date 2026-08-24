
/**
 * BarChart — Barres horizontales fines premium ERP DABA
 *
 * Design :
 * - Fond de barre gris très clair (mode clair) / slate-800 (mode sombre)
 * - Barre colorée DABA fine (8px) avec animation
 * - Libellé à gauche, chiffre à droite (alignement propre)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { ChartDataPoint } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BarChartProps {
  data: ChartDataPoint[];
  color?: string;          // couleur CSS (ex: '#42B649' ou 'bg-brand-green')
  title?: string;
  /** Affichage d'un état vide élégant si pas de données */
  emptyLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, color = '#42B649', title, emptyLabel = 'Aucune donnée à afficher' }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        isDark ? 'text-slate-500' : 'text-slate-400',
      )}>
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  // Max sécurisé (évite division par 0)
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="w-full">
      {title && (
        <h3 className={cn(
          'text-lg font-bold mb-6',
          isDark ? 'text-slate-100' : 'text-brand-text',
        )}>
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {data.map((item, index) => {
          const value = Number(item.value) || 0;
          const pct = (value / maxValue) * 100;
          return (
            <div key={`${item.label}-${index}`}>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className={cn(
                  'font-medium',
                  isDark ? 'text-slate-300' : 'text-slate-600',
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  'font-bold tabular-nums',
                  isDark ? 'text-slate-100' : 'text-brand-text',
                )}>
                  {value.toLocaleString('fr-FR')}
                </span>
              </div>
              <div className={cn(
                'h-2 rounded-full overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-gray-100',
              )}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 1, delay: index * 0.08, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
