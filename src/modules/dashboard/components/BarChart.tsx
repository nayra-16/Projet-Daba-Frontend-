
import React from 'react';
import { ChartDataPoint } from '../types';

interface BarChartProps {
  data: ChartDataPoint[];
  color?: string;
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, color = '#42B649', title }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">{item.label}</span>
              <span className="text-brand-text font-bold">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;

