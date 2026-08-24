
/**
 * ProductDistributionChart — Barres fines DABA premium ERP
 * Remplace l'ancien design par des barres fines alignées (label + valeur + barre).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { ProductDistributionData } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductDistributionChartProps {
  data: ProductDistributionData[];
}

const ProductDistributionChart: React.FC<ProductDistributionChartProps> = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        isDark ? 'text-slate-500' : 'text-slate-400',
      )}>
        <p className="text-sm">Aucun article enregistré en stock</p>
      </div>
    );
  }

  // Palette DABA — utilisée avec modération, max 6 entrées
  const palette = ['#42B649', '#244A9B', '#E11D2E', '#F59E0B', '#3CAF50', '#036EB1'];

  return (
    <div className="w-full space-y-3">
      {data.map((item, index) => {
        const value = Number(item.value) || 0;
        const color = item.color || palette[index % palette.length];
        return (
          <div key={`${item.name}-${index}`}>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className={cn(
                'font-medium truncate pr-2',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )} title={item.name}>
                {item.name}
              </span>
              <span className={cn(
                'font-bold tabular-nums whitespace-nowrap',
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
                whileInView={{ width: `${Math.min(100, Math.max(0, value))}%` }}
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
  );
};

export default ProductDistributionChart;
