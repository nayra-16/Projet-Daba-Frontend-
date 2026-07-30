
import React, { useEffect, useState } from 'react';
import { elevageService } from '../services/elevageService';
import { TimelineEvent } from '../types';
import { ElevageTimeline } from '../components/ElevageTimeline';

export const HistoriquePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await elevageService.getTimelineEvents();
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-text">Historique complet</h2>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <ElevageTimeline events={events} />
      </div>
    </div>
  );
};
