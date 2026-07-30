
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
        return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case ProductionStep.ABATTAGE:
        return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
      case ProductionStep.DECOUPE:
        return { bg: 'bg-purple-100', text: 'text-purple-700' };
      case ProductionStep.TRANSFORMATION:
        return { bg: 'bg-amber-100', text: 'text-amber-700' };
      case ProductionStep.CONDITIONNEMENT:
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case ProductionStep.CONTROLE_QUALITE:
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case ProductionStep.STOCK:
        return { bg: 'bg-brand-green/10', text: 'text-brand-green' };
      case QualityStatus.PASSED:
        return { bg: 'bg-green-100', text: 'text-brand-green' };
      case QualityStatus.FAILED:
        return { bg: 'bg-red-100', text: 'text-brand-red' };
      case QualityStatus.PENDING:
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };
  const config = getStatusConfig(status);

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-bold', config.bg, config.text)}>
      {status}
    </span>
  );
};
