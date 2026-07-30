
import React from 'react';
import { AlertItem } from '../types';

interface AlertCardProps {
  alert: AlertItem;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getPriorityColor = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'Haute':
        return 'bg-red-100 text-brand-red border-brand-red';
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      case 'Basse':
        return 'bg-blue-100 text-brand-blue border-brand-blue';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-500';
    }
  };

  const IconComponent = (icon: string) => {
    switch (icon) {
      case 'alert-triangle':
        return '⚠️';
      case 'syringe':
        return '💉';
      case 'clock':
        return '⏰';
      case 'wrench':
        return '🔧';
      default:
        return '📋';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border-l-4 p-4 ${getPriorityColor(alert.priority)}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{IconComponent(alert.icon)}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">{alert.type}</h4>
            <span className="text-xs opacity-70">{alert.date}</span>
          </div>
          <p className="text-sm mt-1">{alert.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

