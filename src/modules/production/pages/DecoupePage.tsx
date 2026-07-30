import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Scissors, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, CuttingDetails, CuttingPieces } from '../types';

const INITIAL_PIECES: CuttingPieces = {
  pouletEntier: { quantity: 0, weight: 0 },
  cuisses: { quantity: 0, weight: 0 },
  pilons: { quantity: 0, weight: 0 },
  ailes: { quantity: 0, weight: 0 },
  blancs: { quantity: 0, weight: 0 },
  foies: { quantity: 0, weight: 0 },
  gesiers: { quantity: 0, weight: 0 },
  autres: { quantity: 0, weight: 0 }
};

export const DecoupePage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsCut, setLotsCut] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise'>('attente');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pieces, setPieces] = useState<CuttingPieces>(INITIAL_PIECES);

  const loadLots = async () => {
    setLoading(true);
    const waiting = await productionService.getLotsByStep(ProductionStep.ABATTAGE_TERMINE);
    const finished = await productionService.getLotsByStep(ProductionStep.DECOUPE_TERMINEE);
    setLotsWaiting(waiting);
    setLotsCut(finished);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);
    
    if (editMode && lot.cuttingDetails) {
      setPieces({ ...lot.cuttingDetails.pieces });
      setResponsible(lot.cuttingDetails.responsible);
      setDate(lot.cuttingDetails.date);
    } else {
      setPieces(INITIAL_PIECES);
      setResponsible(lot.responsible || 'Amadou Koné');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handlePieceChange = (pieceKey: keyof CuttingPieces, field: 'quantity' | 'weight', value: string) => {
    const numVal = parseFloat(value) || 0;
    setPieces(prev => ({
      ...prev,
      [pieceKey]: {
        ...prev[pieceKey],
        [field]: numVal
      }
    }));
  };

  // Calculate dynamic totals
  const totalWeight = Object.values(pieces).reduce((sum, p) => sum + p.weight, 0);
  const totalQuantity = Object.values(pieces).reduce((sum, p) => sum + p.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    setLoading(true);
    const details: CuttingDetails = {
      date,
      responsible,
      pieces
    };
    
    const res = await productionService.saveCutting(selectedLot.id, details);
    
    if (res) {
      setIsFormOpen(false);
      setSelectedLot(null);
      await loadLots();
      setActiveTab('realise');
    } else {
      setLoading(false);
    }
  };

  const pieceFields: { key: keyof CuttingPieces; label: string }[] = [
    { key: 'pouletEntier', label: 'Poulets Entiers' },
    { key: 'cuisses', label: 'Cuisses' },
    { key: 'pilons', label: 'Pilons' },
    { key: 'ailes', label: 'Ailes' },
    { key: 'blancs', label: 'Blancs de poulet' },
    { key: 'foies', label: 'Foies' },
    { key: 'gesiers', label: 'Gésiers' },
    { key: 'autres', label: 'Autres morceaux' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des informations de découpe...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Atelier de Découpe</h2>
        <p className="text-gray-500 text-sm mt-1">Saisie quantitative et pondérale des découpes par catégorie de produits</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attente')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'attente' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          À découper ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Découpes Réalisées ({lotsCut.length})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lot</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nom du lot</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Volailles Abattues</th>
                  {activeTab === 'realise' && (
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Poids Découpé</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Aucun lot en attente de découpe.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{lot.quantity} carcasses</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleOpenForm(lot, false)}
                            className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                          >
                            Démarrer la découpe
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsCut.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Aucun historique de découpe enregistré.</td>
                    </tr>
                  ) : (
                    lotsCut.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{lot.slaughterDetails?.quantitySlaughtered || lot.quantity} carcasses</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-green">{lot.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.cuttingDetails?.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenForm(lot, true)}
                              className="text-brand-blue hover:text-brand-green p-1 transition-all"
                              title="Modifier"
                            >
                              <Edit3 size={16} />
                            </button>
                            <Link
                              to={`/admin/production/lots/${lot.id}`}
                              className="text-gray-500 hover:text-brand-green p-1 transition-all"
                              title="Voir fiche traçabilité"
                            >
                              <Eye size={16} />
                            </Link>
                            <button
                              onClick={() => setSelectedLot(lot)}
                              className="text-green-600 hover:text-green-800 p-1 font-bold text-xs"
                            >
                              Consulter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Saisie / Consultation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex justify-between items-center">
                <span>{isEditing ? 'Modifier Découpe' : 'Saisie Découpe'}</span>
                <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Responsable</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pieceFields.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-3 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-700 col-span-1">{label}</span>
                    <input
                      type="number"
                      placeholder="Qté"
                      value={pieces[key].quantity || ''}
                      onChange={(e) => handlePieceChange(key, 'quantity', e.target.value)}
                      min={0}
                      className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none text-center"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Poids (kg)"
                      value={pieces[key].weight || ''}
                      onChange={(e) => handlePieceChange(key, 'weight', e.target.value)}
                      min={0}
                      className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none text-center font-bold"
                    />
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-3 flex justify-between items-center text-brand-text">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Pièces</span>
                  <span className="font-extrabold text-md">{totalQuantity} unités</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Poids Total</span>
                  <span className="font-extrabold text-md text-brand-green">{totalWeight.toFixed(2)} kg</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center justify-center gap-1"
                >
                  <Save size={14} />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setSelectedLot(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : selectedLot && selectedLot.cuttingDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex items-center justify-between">
                <span>Détails Découpe</span>
                <span className="text-xs bg-brand-green bg-opacity-10 text-brand-green px-2 py-0.5 rounded-full font-bold">Réalisé</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 font-bold block">Date</span>
                    <span className="font-semibold text-brand-text">{selectedLot.cuttingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">Responsable</span>
                    <span className="font-semibold text-brand-text">{selectedLot.cuttingDetails.responsible}</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <h4 className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-2">Répartition des Morceaux :</h4>
                <div className="space-y-1.5">
                  {pieceFields.map(({ key, label }) => {
                    const item = selectedLot.cuttingDetails!.pieces[key];
                    if (item.quantity === 0) return null;
                    return (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="font-bold text-brand-text">{item.quantity} u ({item.weight.toFixed(1)} kg)</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-3 flex justify-between items-center text-xs mt-4">
                  <span className="font-bold text-brand-text">Poids Total Carcassses Découpées</span>
                  <span className="font-extrabold text-brand-green text-sm">{selectedLot.weight.toFixed(1)} kg</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleOpenForm(selectedLot, true)}
                  className="flex-1 bg-brand-blue text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center justify-center gap-1"
                >
                  <Edit3 size={14} />
                  Modifier la saisie
                </button>
                <button
                  onClick={() => setSelectedLot(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Scissors size={48} className="mx-auto text-gray-300 mb-3 animate-spin duration-1000" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour enregistrer ou consulter la découpe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
