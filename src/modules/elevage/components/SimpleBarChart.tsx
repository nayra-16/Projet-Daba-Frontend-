
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SimpleBarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  height?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  color = '#42B649',
  height = 'h-64'
}) => {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">{title}</h3>
      <div className={cn('flex items-end gap-2', height)}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden flex-1 flex flex-col justify-end">
              <div
                className="w-full rounded-t-lg transition-all duration-700"
                style={{
                  height: `${(d.value / max) * 100}%`,
                  backgroundColor: color
                }}
              />
            </div>
            <span className="text-xs text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
