
import React, { useEffect, useState } from 'react';
import { elevageService } from '../services/elevageService';
import { Poulailer, PoulailerStatus } from '../types';
import { Home } from 'lucide-react';

export const PoulailersPage: React.FC = () => {
  const [poulailers, setPoulailers] = useState<Poulailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoulailers = async () => {
      const data = await elevageService.getPoulailers();
      setPoulailers(data);
      setLoading(false);
    };
    loadPoulailers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const getStatusColor = (status: PoulailerStatus) => {
    switch (status) {
      case PoulailerStatus.ACTIF: return 'text-brand-green bg-green-100';
      case PoulailerStatus.EN_MAINTENANCE: return 'text-yellow-700 bg-yellow-100';
      case PoulailerStatus.INACTIF: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-text">Gestion des poulaillers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poulailers.map(poulailer => {
          const capacityPercent = Math.round((poulailer.currentCount / poulailer.capacity) * 100);
          return (
            <div key={poulailer.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                    <Home size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text">{poulailer.name}</h3>
                    <p className="text-sm text-gray-500">{poulailer.location}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(poulailer.status)}`}>
                  {poulailer.status}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Taux d'occupation</span>
                    <span className="font-medium">{capacityPercent}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-green rounded-full transition-all duration-700"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500">Capacité</p>
                    <p className="font-bold">{poulailer.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Actuellement</p>
                    <p className="font-bold">{poulailer.currentCount}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Responsable</p>
                  <p className="text-sm font-medium">{poulailer.responsible}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
