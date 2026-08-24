import React from 'react';
import { StockMovementType } from '../types';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface MovementTypeBadgeProps {
  type: StockMovementType | string;
}

const MOVEMENT_CONFIG: Record<string, { label: string; className: string; Icon: React.FC<any> }> = {
  ENTREE: {
    label: 'Entrée',
    className: 'bg-green-100 text-green-700',
    Icon: ArrowDownToLine,
  },
  SORTIE: {
    label: 'Sortie',
    className: 'bg-red-100 text-red-700',
    Icon: ArrowUpFromLine,
  },
  AJUSTEMENT: {
    label: 'Ajustement',
    className: 'bg-amber-100 text-amber-700',
    Icon: RefreshCw,
  },
  TRANSFERT: {
    label: 'Transfert',
    className: 'bg-blue-100 text-blue-700',
    Icon: ArrowLeftRight,
  },
};

export const MovementTypeBadge: React.FC<MovementTypeBadgeProps> = ({ type }) => {
  const config = MOVEMENT_CONFIG[type] ?? {
    label: type,
    className: 'bg-gray-100 text-gray-600',
    Icon: RefreshCw,
  };
  const { label, className, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};
