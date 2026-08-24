import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'red' | 'orange';
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  green: { bg: 'bg-green-500/20', text: 'text-green-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-800"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${c.bg} ${c.text} p-3 rounded-xl`}>
          <Icon size={26} />
        </div>
        {trend && (
          <span
            className={`text-xs font-bold ${
              trend.positive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
    </motion.div>
  );
};

export default StatsCard;
