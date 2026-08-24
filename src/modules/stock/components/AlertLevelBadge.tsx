import React from 'react';
import { StockAlertLevel } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface AlertLevelBadgeProps {
  level: StockAlertLevel | string;
}

const ALERT_CONFIG: Record<string, { label: string; className: string; Icon: React.FC<any> }> = {
  CRITIQUE: {
    label: 'Critique',
    className: 'bg-red-100 text-red-700',
    Icon: AlertCircle,
  },
  FAIBLE: {
    label: 'Faible',
    className: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle,
  },
  NORMAL: {
    label: 'Normal',
    className: 'bg-green-100 text-green-700',
    Icon: CheckCircle,
  },
  ELEVE: {
    label: 'Élevé',
    className: 'bg-blue-100 text-blue-700',
    Icon: TrendingUp,
  },
};

export const AlertLevelBadge: React.FC<AlertLevelBadgeProps> = ({ level }) => {
  const config = ALERT_CONFIG[level] ?? {
    label: level,
    className: 'bg-gray-100 text-gray-600',
    Icon: AlertTriangle,
  };
  const { label, className, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};
