import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Eye, Play, ArrowRight, Clipboard } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';

export const ReceivedLotsPage: React.FC = () => {
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadLots = async () => {
      const data = await productionService.getReceivedLots();
      setLots(data);
      setLoading(false);
    };
    loadLots();
  }, []);

  const filteredLots = lots.filter(lot =>
    lot.elevageLotNumber.toLowerCase().includes(search.toLowerCase()) ||
    lot.name.toLowerCase().includes(search.toLowerCase()) ||
    lot.responsible.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartProcess = async (lotId: string) => {
    setLoading(true);
    // Transition status to ATTENTE_ABATTAGE
    const updated = await productionService.updateLotStatus(
      lotId, 
      ProductionStep.ATTENTE_ABATTAGE, 
      'Superviseur Production', 
      'Prise en charge du lot et mise en attente d\'abattage.'
    );
    if (updated) {
      const data = await productionService.getReceivedLots();
      setLots(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des lots reçus...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Lots Reçus de l'Élevage</h2>
        <p className="text-gray-500 text-sm mt-1">Liste des lots transférés depuis les poulaillers et prêts pour l'abattage</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un numéro de lot, nom ou responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green transition-all"
          />
        </div>
        <div className="text-sm font-semibold text-gray-500">
          {filteredLots.length} lot(s) en attente de traitement
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot d'Origine</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom du Lot</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date de Transfert</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Effectif Volatiles</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Poids Initial (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Aucun lot reçu en attente de prise en charge.
                  </td>
                </tr>
              ) : (
                filteredLots.map(lot => (
                  <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-text">{lot.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.dateFabrication}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-bold">{lot.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-bold">{lot.weight.toFixed(1)} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ProductionStatusBadge status={lot.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-3">
                        <Link 
                          to={`/admin/production/lots/${lot.id}`} 
                          className="text-brand-blue hover:text-brand-green flex items-center gap-1 transition-all"
                          title="Fiche traçabilité"
                        >
                          <Eye size={16} />
                          Fiche
                        </Link>
                        {lot.status === ProductionStep.RECEPTION ? (
                          <button
                            onClick={() => handleStartProcess(lot.id)}
                            className="bg-brand-green bg-opacity-10 text-brand-green px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-green hover:text-white flex items-center gap-1 transition-all"
                          >
                            <Play size={12} />
                            Prendre en charge
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/admin/production/abattage?lotId=${lot.id}`)}
                            className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-purple-600 hover:text-white flex items-center gap-1 transition-all"
                          >
                            <ArrowRight size={12} />
                            Lancer l'abattage
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
