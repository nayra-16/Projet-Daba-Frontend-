
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'green'
}) => {
  const colorClasses = {
    green: 'bg-brand-green/10 text-brand-green',
    blue: 'bg-blue-100 text-brand-blue',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-brand-red',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn(
            'text-sm font-bold',
            trend >= 0 ? 'text-brand-green' : 'text-brand-red'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </div>
  );
};
