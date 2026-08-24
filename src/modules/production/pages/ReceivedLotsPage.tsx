import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Eye, Play, ArrowRight, Clipboard, RefreshCw, XCircle, Edit } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { useAuth } from '../../../core/context/AuthContext';

export const ReceivedLotsPage: React.FC = () => {
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION');

  const loadLots = async () => {
    setLoading(true);
    const data = await productionService.getReceivedLots();
    setLots(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleSyncElevage = async () => {
    setSyncing(true);
    try {
      await productionService.syncFromElevage();
      await loadLots();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const filteredLots = lots.filter(lot =>
    lot.elevageLotNumber.toLowerCase().includes(search.toLowerCase()) ||
    lot.name.toLowerCase().includes(search.toLowerCase()) ||
    lot.responsible.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartProcess = async (lotId: string) => {
    setLoading(true);
    const updated = await productionService.updateLotStatus(
      lotId, 
      ProductionStep.ATTENTE_ABATTAGE, 
      'Superviseur Production', 
      'Prise en charge du lot et mise en attente d\'abattage.'
    );
    if (updated) {
      await loadLots();
    } else {
      setLoading(false);
    }
  };

  if (loading && lots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des lots reçus...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Lots Reçus de l'Élevage</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Liste des lots transférés depuis les poulaillers et prêts pour l'abattage</p>
        </div>
        {canEdit && (
          <button 
            onClick={handleSyncElevage}
            disabled={syncing}
            className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Synchronisation..." : "Synchroniser l'élevage"}
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un numéro de lot, nom ou responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-green transition-all"
          />
        </div>
        <div className="text-sm font-semibold text-gray-500 dark:text-slate-400">
          {filteredLots.length} lot(s) en attente de traitement
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot d'Origine</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date & Origine</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Effectif</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Poids Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Poids Moyen</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
                    Aucun lot reçu en attente de prise en charge.
                  </td>
                </tr>
              ) : (
                filteredLots.map(lot => {
                  const avgWeight = lot.quantity > 0 ? (lot.weight / lot.quantity).toFixed(2) : '—';
                  
                  return (
                    <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{lot.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{lot.dateFabrication}</span>
                          <span className="text-xs text-gray-400 dark:text-slate-500">Ferme DABA</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-700 dark:text-slate-200 font-bold">{lot.quantity.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-brand-green font-bold">{lot.weight.toFixed(1)} kg</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-purple-600 font-bold">{avgWeight} kg</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.responsible}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <ProductionStatusBadge status={lot.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            to={`/admin/production/lots/${lot.id}`} 
                            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"
                            title="Voir traçabilité"
                          >
                            <Eye size={18} />
                          </Link>
                          
                          {canEdit && (
                            <>
                              <button
                                onClick={() => alert('Modification non implémentée')}
                                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Edit size={18} />
                              </button>
                              
                              {lot.status === ProductionStep.RECEPTION && (
                                <button
                                  onClick={() => handleStartProcess(lot.id)}
                                  className="flex items-center gap-1 bg-brand-green bg-opacity-10 text-brand-green px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-green hover:text-white transition-all"
                                  title="Valider / Prendre en charge"
                                >
                                  <Play size={12} />
                                  Valider
                                </button>
                              )}
                              
                              {lot.status === ProductionStep.ATTENTE_ABATTAGE && (
                                <button
                                  onClick={() => navigate(`/admin/production/abattage?lotId=${lot.id}`)}
                                  className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-purple-600 hover:text-white transition-all"
                                  title="Envoyer vers abattage"
                                >
                                  <ArrowRight size={12} />
                                  Abattage
                                </button>
                              )}

                              <button
                                onClick={() => alert('Refus non implémenté coté backend')}
                                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Refuser"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
