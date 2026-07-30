
import React from 'react';
import { RecentActivity } from '../types';

interface ActivityCardProps {
  activity: RecentActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const IconComponent = (icon: string) => {
    switch (icon) {
      case 'user':
        return '👤';
      case 'shopping-cart':
        return '🛒';
      case 'package':
        return '📦';
      case 'check-circle':
        return '✅';
      case 'edit':
        return '✏️';
      default:
        return '📋';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-green transition-all">
      <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-lg">
        {IconComponent(activity.icon)}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold text-brand-text">{activity.user}</span>
          <span className="text-gray-600 ml-1">{activity.description}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
};

export default ActivityCard;

