
import React, { useEffect, useState } from 'react';
import { Calendar, Activity, User, Clock } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { Link } from 'react-router-dom';

export const ProductionHistoriquePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await productionService.getTimelineEvents();
      setEvents(data);
      setLoading(false);
    };
    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement de l'historique...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Historique de Production</h2>
          <p className="text-gray-500 text-sm mt-1">Suivi de toutes les activités de production</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green border-2 border-white shadow-sm">
                  <Activity size={18} />
                </div>
                {idx < events.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-brand-text flex items-center gap-2">
                      {event.step}
                      <ProductionStatusBadge status={event.step} />
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">{event.comment}</p>
                  </div>
                  <Link 
                    to={`/admin/production/lots/${event.lotId}`}
                    className="text-xs text-brand-blue hover:underline font-semibold"
                  >
                    Voir lot
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} /> {event.responsible}
                  </span>
                  <span className="bg-gray-200 px-2 py-0.5 rounded-full">{event.elevageLotNumber}</span>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun événement historique disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
