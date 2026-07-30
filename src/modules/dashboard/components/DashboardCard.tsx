
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardStat } from '../types';

interface DashboardCardProps {
  stat: DashboardStat;
  index: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ stat, index }) => {
  const IconComponent = {
    'package': () => <div className="text-2xl">📦</div>,
    'home': () => <div className="text-2xl">🏠</div>,
    'trending-up': () => <div className="text-2xl">📈</div>,
    'factory': () => <div className="text-2xl">🏭</div>,
    'package-check': () => <div className="text-2xl">✅</div>,
    'clock': () => <div className="text-2xl">⏰</div>,
    'shopping-cart': () => <div className="text-2xl">🛒</div>,
    'trending-down': () => <div className="text-2xl">📉</div>,
    'wallet': () => <div className="text-2xl">💰</div>,
  }[stat.icon] || (() => <div className="text-2xl">📊</div>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:border-brand-green transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${stat.color} text-white`}>
          <IconComponent />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-brand-green' : 'text-brand-red'}`}>
          {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(stat.variation)}%</span>
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
        <h3 className="text-2xl font-bold text-brand-text mt-1">{stat.value}</h3>
      </div>
    </motion.div>
  );
};

export default DashboardCard;

