
import React, { useEffect, useState } from 'react';
import { elevageService } from '../services/elevageService';
import { HealthEvent, HealthEventType } from '../types';

export const SantePage: React.FC = () => {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await elevageService.getHealthEvents();
      setEvents(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const getTypeColor = (type: HealthEventType) => {
    switch (type) {
      case HealthEventType.VACCINATION: return 'bg-blue-100 text-brand-blue';
      case HealthEventType.TRAITEMENT: return 'bg-purple-100 text-purple-700';
      case HealthEventType.MALADIE: return 'bg-yellow-100 text-yellow-700';
      case HealthEventType.DECES: return 'bg-red-100 text-brand-red';
      case HealthEventType.CONTROLE_VETERINAIRE: return 'bg-green-100 text-brand-green';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-text">Suivi sanitaire</h2>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {events.map(event => (
            <div key={event.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <h3 className="font-bold">{event.product || event.type}</h3>
                </div>
                <span className="text-sm text-gray-500">{event.date}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Lot: {event.lotId}</p>
              {event.comment && <p className="text-sm text-gray-500 mb-2">{event.comment}</p>}
              {event.mortalityCount && (
                <p className="text-sm font-medium text-brand-red">
                  Décès: {event.mortalityCount}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Par {event.responsible}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
