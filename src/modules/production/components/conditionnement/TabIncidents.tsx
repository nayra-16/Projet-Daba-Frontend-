import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Save } from 'lucide-react';
import { Incident, IncidentType, ChambreFroide } from '../../../types';
import { productionService } from '../../services/productionService';

interface TabIncidentsProps {
  chambres: ChambreFroide[];
  canEdit: boolean;
  onRefresh: () => void;
}

const INCIDENT_TYPES: IncidentType[] = [
  'Panne de chambre froide',
  'Température anormale',
  'Coupure électrique',
  'Porte restée ouverte',
  'Problème technique',
  'Maintenance',
  'Autre'
];

export const TabIncidents: React.FC<TabIncidentsProps> = ({ chambres, canEdit, onRefresh }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [type, setType] = useState<IncidentType>(INCIDENT_TYPES[0]);
  const [chambreFroideId, setChambreFroideId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [observedTemp, setObservedTemp] = useState<number | ''>('');

  const loadIncidents = async () => {
    const data = await productionService.getIncidents();
    setIncidents(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chambreFroideId) return;

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      type,
      chambreFroideId,
      date,
      time,
      description,
      observedTemp: observedTemp !== '' ? Number(observedTemp) : undefined,
      responsible: 'Fatou Diop', // Mocked user
      status: 'Ouvert',
    };

    await productionService.saveIncident(newIncident);
    
    // Also update the chambre froide status to "En panne" if it's a breakdown
    if (type === 'Panne de chambre froide' || type === 'Température anormale') {
      const chambre = chambres.find(c => c.id === chambreFroideId);
      if (chambre) {
        await productionService.saveChambreFroide({ ...chambre, status: 'En panne' });
      }
    }

    setIsFormOpen(false);
    onRefresh();
    loadIncidents();
  };

  const getChambreName = (id: string) => {
    const c = chambres.find(x => x.id === id);
    return c ? c.name : id;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Incidents & Surveillances
        </h3>
        {canEdit && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-brand-red text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90"
          >
            <Plus size={16} /> Déclarer un incident
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-4 shadow-sm space-y-4">
          <h4 className="font-bold text-brand-red border-b border-red-100 pb-2">Nouvel incident</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Type d'incident</label>
              <select value={type} onChange={e => setType(e.target.value as IncidentType)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Chambre concernée</label>
              <select value={chambreFroideId} onChange={e => setChambreFroideId(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">-- Choisir --</option>
                {chambres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-2 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Heure</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-2 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Description détaillée</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: Variation subite de température..." className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Température relevée (°C)</label>
              <input type="number" step="0.1" value={observedTemp} onChange={e => setObservedTemp(e.target.value ? Number(e.target.value) : '')} placeholder="Ex: 5" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
            <button type="submit" className="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Save size={16} /> Enregistrer</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date / Heure</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Chambre</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Temp. Relevée</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {incidents.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun incident enregistré.</td></tr>
            ) : incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 text-sm whitespace-nowrap"><span className="font-bold">{new Date(inc.date).toLocaleDateString()}</span> <span className="text-gray-500">{inc.time}</span></td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{inc.type}</td>
                <td className="px-4 py-3 text-sm font-medium">{getChambreName(inc.chambreFroideId)}</td>
                <td className="px-4 py-3 text-sm">{inc.observedTemp !== undefined ? `${inc.observedTemp} °C` : '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{inc.description}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inc.status === 'Ouvert' ? 'bg-red-100 text-red-800' : inc.status === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
