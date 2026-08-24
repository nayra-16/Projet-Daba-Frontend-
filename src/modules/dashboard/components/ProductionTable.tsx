
/**
 * ProductionTable — Tableau premium ERP DABA
 *
 * Design :
 * - Carte blanche, slate-900 en mode sombre
 * - Header gris très clair, body blanc
 * - Badges subtils (pas de block massif)
 * - Hover row discret
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { ProductionItem } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductionTableProps {
  items: ProductionItem[];
}

const ProductionTable: React.FC<ProductionTableProps> = ({ items }) => {
  const { isDark } = useTheme();

  const getStatusClasses = (status: ProductionItem['status']) => {
    switch (status) {
      case 'Terminé':
        return { bg: 'bg-brand-green/10', text: 'text-brand-green' };
      case 'En cours':
        return { bg: 'bg-brand-blue/10', text: 'text-brand-blue' };
      case 'À venir':
      default:
        return { bg: isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600', text: '' };
    }
  };

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden',
      isDark
        ? 'bg-slate-900 border-slate-800'
        : 'bg-white border-surface-border shadow-card',
    )}>
      <div className={cn(
        'px-6 py-4 border-b',
        isDark ? 'border-slate-800' : 'border-surface-border',
      )}>
        <h3 className={cn(
          'text-base font-bold',
          isDark ? 'text-slate-100' : 'text-brand-text',
        )}>
          Production du jour
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(
            isDark ? 'bg-slate-950/50' : 'bg-surface-subtle',
          )}>
            <tr>
              {['Heure', 'Produit', 'Lot', 'Quantité', 'Responsable', 'Statut'].map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider',
                    isDark ? 'text-slate-400' : 'text-slate-500',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(
            'divide-y',
            isDark ? 'divide-slate-800' : 'divide-gray-100',
          )}>
            {items.map((item) => {
              const status = getStatusClasses(item.status);
              return (
                <tr
                  key={item.id}
                  className={cn(
                    'transition-colors',
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-surface-hover',
                  )}
                >
                  <td className={cn(
                    'px-6 py-3.5 whitespace-nowrap text-sm tabular-nums font-medium',
                    isDark ? 'text-slate-300' : 'text-slate-700',
                  )}>
                    {item.time}
                  </td>
                  <td className={cn(
                    'px-6 py-3.5 whitespace-nowrap text-sm font-bold',
                    isDark ? 'text-slate-100' : 'text-brand-text',
                  )}>
                    {item.product}
                  </td>
                  <td className={cn(
                    'px-6 py-3.5 whitespace-nowrap text-sm font-mono',
                    isDark ? 'text-slate-400' : 'text-slate-500',
                  )}>
                    {item.lot}
                  </td>
                  <td className={cn(
                    'px-6 py-3.5 whitespace-nowrap text-sm font-bold tabular-nums',
                    isDark ? 'text-slate-100' : 'text-brand-text',
                  )}>
                    {item.quantity}
                  </td>
                  <td className={cn(
                    'px-6 py-3.5 whitespace-nowrap text-sm',
                    isDark ? 'text-slate-300' : 'text-slate-700',
                  )}>
                    {item.responsible}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md',
                      status.bg,
                      status.text,
                    )}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;
