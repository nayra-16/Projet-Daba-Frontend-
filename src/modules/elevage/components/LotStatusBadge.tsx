
import React from 'react';
import { LotStatus } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LotStatusBadgeProps {
  status: LotStatus;
}

export const LotStatusBadge: React.FC<LotStatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<LotStatus, { bg: string; text: string }> = {
    [LotStatus.ARRIVEE]: { bg: 'bg-blue-100', text: 'text-blue-700' },
    [LotStatus.INSTALLE]: { bg: 'bg-purple-100', text: 'text-purple-700' },
    [LotStatus.EN_ELEVAGE]: { bg: 'bg-green-100', text: 'text-brand-green' },
    [LotStatus.SUIVI_ALIMENTAIRE]: { bg: 'bg-amber-100', text: 'text-amber-700' },
    [LotStatus.VACCINATION]: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    [LotStatus.TRAITEMENT]: { bg: 'bg-orange-100', text: 'text-orange-700' },
    [LotStatus.CONTROLE_POIDS]: { bg: 'bg-teal-100', text: 'text-teal-700' },
    [LotStatus.CONTROLE_SANITAIRE]: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    [LotStatus.PRET_ABATTAGE]: { bg: 'bg-brand-green/10', text: 'text-brand-green' },
    [LotStatus.TRANSFERE_PRODUCTION]: { bg: 'bg-brand-blue/10', text: 'text-brand-blue' },
    [LotStatus.TERMINE]: { bg: 'bg-gray-100', text: 'text-gray-600' },
    [LotStatus.ARCHIVE]: { bg: 'bg-gray-200', text: 'text-gray-500' }
  };

  const config = statusConfig[status];

  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-bold', config.bg, config.text)}>
      {status}
    </span>
  );
};
