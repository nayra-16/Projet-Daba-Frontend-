
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StockItem } from '../types';

interface StockCardProps {
  item: StockItem;
}

const StockCard: React.FC<StockCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-brand-text">{item.name}</h4>
        {item.alert && (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-bold">
            <AlertTriangle size={16} />
            <span>Alerte</span>
          </div>
        )}
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-brand-text">{item.level}</span>
        <span className="text-gray-500 ml-2">unités</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${item.color}`}
          style={{
            width: `${item.percentage}%`,
          }}
        />
      </div>
      <div className="mt-2 text-right">
        <span className={`text-sm font-bold ${item.alert ? 'text-yellow-600' : 'text-gray-600'}`}>
          {item.percentage}%
        </span>
      </div>
    </div>
  );
};

export default StockCard;

