
import React from 'react';
import { TimelineEvent, TimelineEventType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Calendar, Users, Activity, Package, Droplets } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ElevageTimelineProps {
  events: TimelineEvent[];
}

const iconMap: Record<TimelineEventType, React.ReactNode> = {
  [TimelineEventType.CREATION_LOT]: <Package size={18} />,
  [TimelineEventType.VACCINATION]: <Activity size={18} />,
  [TimelineEventType.TRAITEMENT]: <Activity size={18} />,
  [TimelineEventType.PESEE]: <Droplets size={18} />,
  [TimelineEventType.MORTALITE]: <Activity size={18} />,
  [TimelineEventType.DISTRIBUTION_ALIMENT]: <Package size={18} />,
  [TimelineEventType.TRANSFERT]: <Package size={18} />,
  [TimelineEventType.ABATTAGE]: <Package size={18} />,
  [TimelineEventType.CHANGEMENT_STATUT]: <Activity size={18} />,
};

const colorMap: Record<TimelineEventType, string> = {
  [TimelineEventType.CREATION_LOT]: 'bg-brand-green',
  [TimelineEventType.VACCINATION]: 'bg-blue-500',
  [TimelineEventType.TRAITEMENT]: 'bg-purple-500',
  [TimelineEventType.PESEE]: 'bg-orange-500',
  [TimelineEventType.MORTALITE]: 'bg-brand-red',
  [TimelineEventType.DISTRIBUTION_ALIMENT]: 'bg-brand-green',
  [TimelineEventType.TRANSFERT]: 'bg-blue-500',
  [TimelineEventType.ABATTAGE]: 'bg-purple-500',
  [TimelineEventType.CHANGEMENT_STATUT]: 'bg-brand-green',
};

export const ElevageTimeline: React.FC<ElevageTimelineProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', colorMap[event.type])}>
              {iconMap[event.type]}
            </div>
            {index < events.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-text">{event.type}</span>
              <span className="text-xs text-gray-500">{event.date}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            <p className="text-xs text-gray-500 mt-1">Par {event.responsible}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
