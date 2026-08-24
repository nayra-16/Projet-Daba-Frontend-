import React from 'react';
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
}

interface ProductionFunnelProps {
  data: DataItem[];
}

export const ProductionFunnel: React.FC<ProductionFunnelProps> = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center text-center h-full min-h-[200px]", isDark ? "text-slate-500" : "text-slate-400")}>
        <p className="text-sm">Aucune donnée de production</p>
      </div>
    );
  }

  // Palette du Funnel (dégradé vert subtil)
  const getLightColor = (index: number) => {
    const opacity = 1 - (index * 0.15);
    return `rgba(66, 182, 73, ${Math.max(opacity, 0.2)})`; // 42B649 (Brand Green)
  };

  const getDarkColor = (index: number) => {
    const opacity = 1 - (index * 0.15);
    return `rgba(66, 182, 73, ${Math.max(opacity, 0.2)})`;
  };

  return (
    <div className="flex flex-col items-center w-full py-4 space-y-1">
      {data.map((item, index) => {
        // La largeur diminue progressivement pour simuler l'entonnoir (funnel)
        const baseWidth = 100 - (index * 12);
        const targetWidth = Math.max(baseWidth, 30); // Ne descend pas sous 30%
        const color = isDark ? getDarkColor(index) : getLightColor(index);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center justify-center"
            style={{ width: `${targetWidth}%` }}
          >
            <div 
              className={cn(
                "w-full py-1.5 md:py-2 text-center relative border flex items-center justify-center",
                "shadow-sm",
                isDark ? "border-slate-800" : "border-black/10"
              )}
              style={{ backgroundColor: color }}
            >
              <div 
                 className={cn(
                   "absolute inset-0 skew-x-[15deg] border-l origin-left z-0 pointer-events-none",
                   index > 0 ? "border-t" : ""
                 )}
                 style={{ borderLeftColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.3)' }}
              />
              <div 
                 className={cn(
                   "absolute inset-0 -skew-x-[15deg] border-r origin-right z-0 pointer-events-none",
                   index > 0 ? "border-t" : ""
                 )}
                 style={{ borderRightColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.3)' }}
              />
              
              <span className={cn(
                "relative z-10 text-[11px] md:text-xs font-bold uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]",
                isDark ? "text-slate-100" : "text-slate-800"
              )}>
                {item.label} ({item.value})
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
