import React from 'react';

interface StockStatusBadgeProps {
  quantityAvailable: number;
  quantityMinimum: number;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({
  quantityAvailable,
  quantityMinimum,
}) => {
  if (quantityAvailable === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
        Épuisé
      </span>
    );
  }
  if (quantityAvailable <= quantityMinimum) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Stock bas
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Normal
    </span>
  );
};
