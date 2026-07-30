
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { Lot, WorkflowStep } from '../types';
import { LotStatusBadge } from '../components/LotStatusBadge';

export const LotsPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [lotsData, workflowData] = await Promise.all([
        elevageService.getLots(),
        elevageService.getWorkflow()
      ]);
      setLots(lotsData);
      setWorkflowSteps(workflowData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getLotProgress = (lot: Lot) => {
    const currentIndex = workflowSteps.findIndex(step => step.id === lot.status);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / workflowSteps.length) * 100);
  };

  const filteredLots = lots.filter(lot =>
    lot.name.toLowerCase().includes(search.toLowerCase()) ||
    lot.lotNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-text">Gestion des lots</h2>
        <button className="bg-brand-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
          <Plus size={18} />
          Nouveau lot
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
          <Filter size={18} />
          Filtrer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Race</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Âge (j)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Effectif</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLots.map(lot => {
                const progress = getLotProgress(lot);
                return (
                  <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-text">{lot.lotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{lot.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.breed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.chickCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LotStatusBadge status={lot.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-48">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-green rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-bold">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link to={`/admin/elevage/lots/${lot.id}`} className="text-brand-blue hover:text-brand-green">
                          <Eye size={16} />
                        </Link>
                        <button className="text-brand-blue hover:text-brand-green">
                          <Edit size={16} />
                        </button>
                        <button className="text-brand-red hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
