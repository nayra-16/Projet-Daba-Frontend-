
import React from 'react';
import { RevenueExpenseData } from '../types';

interface RevenueExpenseChartProps {
  data: RevenueExpenseData;
}

const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.revenue, ...data.expenses);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">Dépenses vs Revenus</h3>
      <div className="grid grid-cols-6 gap-4">
        {data.labels.map((label, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-full flex flex-col gap-1 h-48 justify-end">
              <div
                className="w-full bg-brand-green rounded-t transition-all duration-700"
                style={{
                  height: `${(data.revenue[index] / maxValue) * 100}%`,
                }}
              />
              <div
                className="w-full bg-brand-red rounded-t transition-all duration-700"
                style={{
                  height: `${(data.expenses[index] / maxValue) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-green rounded" />
          <span className="text-sm text-gray-600">Revenus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-red rounded" />
          <span className="text-sm text-gray-600">Dépenses</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueExpenseChart;

