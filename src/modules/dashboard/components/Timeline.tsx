
import React from 'react';
import { TimelineItem } from '../types';

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const IconComponent = (icon: string) => {
    switch (icon) {
      case 'user':
        return '👤';
      case 'shopping-cart':
        return '🛒';
      case 'factory':
        return '🏭';
      case 'scissors':
        return '✂️';
      case 'truck':
        return '🚚';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">Timeline</h3>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center text-lg`}>
                {IconComponent(item.icon)}
              </div>
              {index < items.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-text">{item.type}</span>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

