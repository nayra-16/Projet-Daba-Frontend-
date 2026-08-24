import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DataItem {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DataItem[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  centerLabel, 
  centerSublabel, 
  size = 200, 
  strokeWidth = 35 
}) => {
  const { isDark } = useTheme();
  
  const palette = ['#42B649', '#244A9B', '#E11D2E', '#F59E0B', '#3CAF50', '#036EB1'];
  
  const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  
  const arcs = useMemo(() => {
    if (total === 0) return [];
    
    return data.map((item, index) => {
      const percentage = item.value / total;
      const dashArray = circumference;
      const dashOffset = circumference - (percentage * circumference);
      const rotation = (currentOffset / total) * 360 - 90; // Start at top
      
      currentOffset += item.value;
      
      return {
        ...item,
        color: item.color || palette[index % palette.length],
        dashArray,
        dashOffset,
        rotation
      };
    });
  }, [data, total, circumference]);

  if (total === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center text-center h-full min-h-[200px]", isDark ? "text-slate-500" : "text-slate-400")}>
        <p className="text-sm">Aucune donnée</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 justify-center w-full">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((arc, index) => (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashArray}
              animate={{ strokeDashoffset: arc.dashOffset }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
              style={{
                transformOrigin: '50% 50%',
                transform: `rotate(${arc.rotation}deg)`
              }}
              strokeLinecap="butt"
            />
          ))}
          
          {/* Couche d'espacement (bordures blanches/sombres entre les sections) - Optionnel mais ajoute au design premium */}
          {arcs.map((arc, index) => (
            <circle
              key={`gap-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth={strokeWidth + 2}
              strokeDasharray={`2 ${circumference - 2}`}
              style={{
                transformOrigin: '50% 50%',
                transform: `rotate(${arc.rotation}deg)`
              }}
            />
          ))}
        </svg>
        
        {/* Centre du Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={cn("text-3xl font-black", isDark ? "text-slate-100" : "text-slate-800")}>
            {centerLabel || total}
          </span>
          {(centerSublabel) && (
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
              {centerSublabel}
            </span>
          )}
        </div>
      </div>
      
      {/* Légende */}
      <div className="flex flex-col gap-2">
        {arcs.map((arc, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: arc.color }} />
            <span className={cn("text-[13px] font-medium whitespace-nowrap", isDark ? "text-slate-300" : "text-slate-600")}>
              {arc.label} ({arc.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
