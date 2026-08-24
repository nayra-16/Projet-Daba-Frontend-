
import React from 'react';
import { ProductionStep, QualityStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductionStatusBadgeProps {
  status: ProductionStep | QualityStatus;
}

export const ProductionStatusBadge: React.FC<ProductionStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (s: ProductionStep | QualityStatus) => {
    switch (s) {
      case ProductionStep.RECEPTION:
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' };
      case ProductionStep.ABATTAGE_TERMINE:
        return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' };
      case ProductionStep.DECOUPE_TERMINEE:
        return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' };
      case ProductionStep.TRANSFORMATION:
        return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
      case ProductionStep.CONDITIONNEMENT:
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' };
      case ProductionStep.CONTROLE_QUALITE:
        return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' };
      case ProductionStep.STOCK:
      case QualityStatus.PASSED:
      case ProductionStep.PRODUIT_TERMINE:
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' };
      case QualityStatus.FAILED:
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
      case QualityStatus.PENDING:
      case ProductionStep.ATTENTE_ABATTAGE:
        return { bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-700 dark:text-gray-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-700 dark:text-gray-300' };
    }
  };
  const config = getStatusConfig(status);

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-bold', config.bg, config.text)}>
      {status}
    </span>
  );
};
