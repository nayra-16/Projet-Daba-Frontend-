
import React from 'react';
import { CalendarEvent } from '../types';

interface CalendarCardProps {
  events: CalendarEvent[];
}

const CalendarCard: React.FC<CalendarCardProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-brand-text mb-6">Calendrier des activités</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-brand-green transition-all">
            <div className={`w-12 h-12 rounded-xl ${event.color} text-white flex flex-col items-center justify-center text-sm`}>
              <span className="font-bold">{new Date(event.date).getDate()}</span>
              <span className="text-xs">{new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-brand-text">{event.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">⏰ {event.time}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{event.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarCard;

