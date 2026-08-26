import React, { useState } from 'react';
import { Snowflake, Plus, AlertTriangle, ThermometerSun, Save, Activity } from 'lucide-react';
import { ChambreFroide, ProductionLot } from '../../../types';
import { productionService } from '../../services/productionService';

interface TabChambresProps {
  chambres: ChambreFroide[];
  lotsPackaged: ProductionLot[];
  canEdit: boolean;
  onRefresh: () => void;
}

export const TabChambres: React.FC<TabChambresProps> = ({ chambres, lotsPackaged, canEdit, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChambre, setEditingChambre] = useState<Partial<ChambreFroide> | null>(null);

  const getLotsInChambre = (id: string) => lotsPackaged.filter(l => l.chambreFroideId === id);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChambre || !editingChambre.name) return;

    const chambreToSave: ChambreFroide = {
      id: editingChambre.id || `cf-${Date.now()}`,
      name: editingChambre.name,
      capacity: Number(editingChambre.capacity || 1000),
      capacityUnit: editingChambre.capacityUnit || 'kg',
      minTemp: Number(editingChambre.minTemp || -20),
      maxTemp: Number(editingChambre.maxTemp || -18),
      currentTemp: Number(editingChambre.currentTemp || -19),
      status: editingChambre.status || 'Disponible',
      currentLoad: editingChambre.currentLoad || 0,
      description: editingChambre.description,
      location: editingChambre.location,
    };

    await productionService.saveChambreFroide(chambreToSave);
    setIsFormOpen(false);
    setEditingChambre(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Snowflake className="text-blue-500" />
          Gestion des Chambres Froides
        </h3>
        {canEdit && (
          <button
            onClick={() => {
              setEditingChambre({ status: 'Disponible', capacityUnit: 'kg', minTemp: -20, maxTemp: -18, currentTemp: -19 });
              setIsFormOpen(true);
            }}
            className="bg-brand-blue text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90"
          >
            <Plus size={16} /> Nouvelle Chambre
          </button>
        )}
      </div>

      {isFormOpen && editingChambre && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-2">
            {editingChambre.id ? 'Modifier la chambre froide' : 'Nouvelle chambre froide'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nom</label>
              <input
                type="text"
                required
                value={editingChambre.name || ''}
                onChange={e => setEditingChambre({ ...editingChambre, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Statut</label>
              <select
                value={editingChambre.status}
                onChange={e => setEditingChambre({ ...editingChambre, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="Disponible">Disponible</option>
                <option value="Occupée">Occupée</option>
                <option value="En maintenance">En maintenance</option>
                <option value="En panne">En panne</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Capacité Max</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  value={editingChambre.capacity || ''}
                  onChange={e => setEditingChambre({ ...editingChambre, capacity: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <select
                  value={editingChambre.capacityUnit}
                  onChange={e => setEditingChambre({ ...editingChambre, capacityUnit: e.target.value as any })}
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="kg">kg</option>
                  <option value="unités">unités</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Min Temp</label>
                <input
                  type="number"
                  required
                  value={editingChambre.minTemp || ''}
                  onChange={e => setEditingChambre({ ...editingChambre, minTemp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Max Temp</label>
                <input
                  type="number"
                  required
                  value={editingChambre.maxTemp || ''}
                  onChange={e => setEditingChambre({ ...editingChambre, maxTemp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-blue mb-1">Temp. Actuelle</label>
                <input
                  type="number"
                  required
                  value={editingChambre.currentTemp || ''}
                  onChange={e => setEditingChambre({ ...editingChambre, currentTemp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-brand-blue rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
            <button type="submit" className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Save size={16} /> Enregistrer</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chambres.map(c => {
          const loadPercent = Math.min(100, Math.max(0, (c.currentLoad / c.capacity) * 100));
          const lots = getLotsInChambre(c.id);
          const isTempAlert = c.currentTemp > c.maxTemp || c.currentTemp < c.minTemp;

          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-xl p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-brand-text dark:text-white flex items-center gap-2">
                  <Snowflake size={16} className={c.status === 'En panne' ? 'text-red-500' : 'text-brand-blue'} />
                  {c.name}
                </h4>
                <div className="flex gap-1">
                  {canEdit && (
                    <button onClick={() => { setEditingChambre(c); setIsFormOpen(true); }} className="text-gray-400 hover:text-brand-blue p-1">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                  c.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                  c.status === 'Occupée' ? 'bg-blue-100 text-blue-800' :
                  c.status === 'En maintenance' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {c.status}
                </span>
              </div>

              <div className="space-y-3 mb-4 flex-1">
                <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-lg flex items-center justify-between border border-gray-100 dark:border-slate-700">
                  <span className="text-xs text-gray-500 font-bold uppercase">Capacité</span>
                  <div className="text-right">
                    <span className="font-extrabold text-sm">{c.currentLoad.toFixed(1)}</span>
                    <span className="text-xs text-gray-400"> / {c.capacity} {c.capacityUnit}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${loadPercent > 90 ? 'bg-red-500' : loadPercent > 70 ? 'bg-amber-500' : 'bg-brand-green'}`} style={{ width: `${loadPercent}%` }}></div>
                </div>

                <div className={`p-2 rounded-lg flex items-center justify-between border ${isTempAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                   <div className="flex items-center gap-1">
                     <ThermometerSun size={14} className={isTempAlert ? 'text-red-500' : 'text-gray-500'} />
                     <span className={`text-xs font-bold uppercase ${isTempAlert ? 'text-red-600' : 'text-gray-500'}`}>Température</span>
                   </div>
                   <div className="text-right">
                     <span className={`font-extrabold text-sm ${isTempAlert ? 'text-red-600' : 'text-brand-text dark:text-white'}`}>{c.currentTemp}°C</span>
                     <span className="text-[10px] text-gray-400 block mt-[-4px]">Min: {c.minTemp}°C / Max: {c.maxTemp}°C</span>
                   </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                 <span className="text-xs text-gray-500 flex items-center gap-1">
                   <Activity size={12} /> {lots.length} lot(s)
                 </span>
                 {isTempAlert && <AlertTriangle size={16} className="text-red-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
