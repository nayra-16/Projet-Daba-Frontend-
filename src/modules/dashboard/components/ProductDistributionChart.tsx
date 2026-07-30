
import React from 'react';
import { ProductDistributionData } from '../types';

interface ProductDistributionChartProps {
  data: ProductDistributionData[];
}

const ProductDistributionChart: React.FC<ProductDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">Répartition des produits vendus</h3>
      <div className="flex flex-wrap gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 min-w-[120px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{item.name}</span>
              <span className="text-sm font-bold text-brand-text">{item.value}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDistributionChart;

