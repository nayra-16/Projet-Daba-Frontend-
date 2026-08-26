import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Scissors, Save, AlertCircle, RefreshCw, ArrowRight, Activity, AlertTriangle, Scale } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, CuttingDetails, CuttingPieces } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { useAuth } from '../../../core/context/AuthContext';

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
  const [formError, setFormError] = useState<string | null>(null);

  const { hasRole } = useAuth();
  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION');

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
    setFormError(null);
    
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
  const totalWeight = Object.values(pieces).reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalQuantity = Object.values(pieces).reduce((sum, p) => sum + (p.quantity || 0), 0);
  const availableWeight = selectedLot?.weight || 0;
  const missingWeight = Math.max(0, availableWeight - totalWeight);
  const exceedsWeight = totalWeight > availableWeight;
  const computedYield = availableWeight > 0 ? ((totalWeight / availableWeight) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    if (exceedsWeight) {
      setFormError("Le poids total découpé ne peut pas dépasser le poids initial du lot !");
      return;
    }
    setFormError(null);

    setLoading(true);
    const details: CuttingDetails = {
      date,
      responsible,
      pieces
    };
    
    const res = await productionService.saveCutting(selectedLot.id, details);
    
    // Save to unified loss system if there are losses
    if (res && missingWeight > 0) {
      await productionService.saveLoss({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productionLotId: selectedLot.id,
        productionLotNumber: selectedLot.elevageLotNumber,
        step: ProductionStep.DECOUPE_TERMINEE,
        quantity: missingWeight,
        unit: 'kg',
        reason: 'Perte de découpe',
        responsible: responsible || 'Inconnu',
      });
    }

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
    { key: 'blancs', label: 'Blancs de poulet' },
    { key: 'cuisses', label: 'Cuisses' },
    { key: 'pilons', label: 'Pilons' },
    { key: 'ailes', label: 'Ailes' },
    { key: 'foies', label: 'Foies' },
    { key: 'gesiers', label: 'Gésiers' },
    { key: 'autres', label: 'Autres morceaux' }
  ];

  if (loading && lotsWaiting.length === 0 && lotsCut.length === 0) {
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
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Atelier de Découpe</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Saisie quantitative et pondérale des découpes par catégorie de produits</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('attente')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'attente' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          À découper ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Découpes Réalisées ({lotsCut.length})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom du lot</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Volailles Abattues</th>
                  {activeTab === 'realise' && (
                    <>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière Dispo.</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Poids Obtenu</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rendement</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Opérateur</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun lot en attente de découpe.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700 dark:text-slate-200">{lot.slaughterDetails?.quantitySlaughtered || lot.quantity} carcasses</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-slate-300">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenForm(lot, false)}
                              className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                            >
                              Démarrer la découpe
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsCut.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun historique de découpe enregistré.</td>
                    </tr>
                  ) : (
                    lotsCut.map(lot => {
                      const avail = lot.weight || 0;
                      const pieces = lot.cuttingDetails?.pieces;
                      let cutWeight = 0;
                      if (pieces) {
                        cutWeight = Object.values(pieces).reduce((s, p) => s + (p.weight || 0), 0);
                      }
                      const yieldPct = avail > 0 ? ((cutWeight / avail) * 100).toFixed(1) : '0';

                      return (
                        <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-slate-300">{lot.slaughterDetails?.quantitySlaughtered || lot.quantity} carcasses</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-500 dark:text-slate-400">{avail.toFixed(1)} kg</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-green">{cutWeight.toFixed(1)} kg</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{yieldPct}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.cuttingDetails?.responsible}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="flex justify-center items-center gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => handleOpenForm(lot, true)}
                                  className="text-brand-blue hover:text-brand-green p-1 transition-all"
                                  title="Modifier"
                                >
                                  <Edit3 size={16} />
                                </button>
                              )}
                              <Link
                                to={`/admin/production/lots/${lot.id}`}
                                className="text-gray-500 dark:text-slate-400 hover:text-brand-green p-1 transition-all"
                                title="Voir fiche traçabilité"
                              >
                                <Eye size={16} />
                              </Link>
                              <button
                                onClick={() => setSelectedLot(lot)}
                                className="text-green-600 hover:text-green-800 p-1 font-bold text-xs bg-green-50 rounded"
                              >
                                Bilan
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Saisie / Consultation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text dark:text-white border-b pb-2 flex justify-between items-center">
                <span>{isEditing ? 'Modifier Découpe' : 'Saisie Découpe'}</span>
                <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              {/* Jauge Résumé Visuel Formulaire */}
              <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Matière Disponible</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{availableWeight.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 flex overflow-hidden relative">
                  <div 
                    className={`h-3 transition-all ${exceedsWeight ? 'bg-red-500' : 'bg-brand-green'}`} 
                    style={{ width: `${Math.min(100, (totalWeight / (availableWeight || 1)) * 100)}%` }}
                  ></div>
                  {!exceedsWeight && missingWeight > 0 && (
                     <div 
                        className="bg-brand-red opacity-30 h-3" 
                        style={{ width: `${(missingWeight / (availableWeight || 1)) * 100}%` }}
                     ></div>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                    <span className="text-gray-600 dark:text-slate-300">Obtenu: <strong className={exceedsWeight ? 'text-red-500' : 'text-brand-green'}>{totalWeight.toFixed(1)} kg</strong></span>
                  </div>
                  {!exceedsWeight && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-brand-red opacity-50"></div>
                      <span className="text-gray-600 dark:text-slate-300">Pertes: <strong className="text-brand-red">{missingWeight.toFixed(1)} kg</strong></span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                   <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Rendement estimé : </span>
                   <span className={`font-extrabold ${exceedsWeight ? 'text-red-500' : 'text-blue-600'}`}>{computedYield} %</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Responsable</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-slate-800" />
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pieceFields.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded-lg">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-200 col-span-1">{label}</span>
                    <input
                      type="number"
                      placeholder="Qté"
                      value={pieces[key].quantity || ''}
                      onChange={(e) => handlePieceChange(key, 'quantity', e.target.value)}
                      min={0}
                      className="px-2 py-1 border border-gray-200 dark:border-slate-700 rounded text-xs focus:outline-none text-center"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Poids (kg)"
                      value={pieces[key].weight || ''}
                      onChange={(e) => handlePieceChange(key, 'weight', e.target.value)}
                      min={0}
                      className={`px-2 py-1 border rounded text-xs focus:outline-none text-center font-bold ${exceedsWeight ? 'border-red-300 text-red-600' : 'border-gray-200 dark:border-slate-700'}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={exceedsWeight}
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={14} />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setSelectedLot(null); }}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-bold"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : selectedLot && selectedLot.cuttingDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-brand-blue" />
                  Bilan Découpe
                </h3>
                <ProductionStatusBadge status={selectedLot.status} />
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase block mb-1">Informations du Lot</span>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-slate-300">Numéro :</span>
                    <span className="font-mono font-bold text-brand-blue">{selectedLot.elevageLotNumber}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-slate-300">Opérateur :</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.cuttingDetails.responsible}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-300">Date :</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.cuttingDetails.date}</span>
                  </div>
                </div>

                {/* Bilan Rendement Visuel */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                   <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3 text-center">Bilan Matière & Rendement</h4>
                   
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Matière Disponible</span>
                     <span className="text-sm font-bold">{selectedLot.weight.toFixed(1)} kg</span>
                   </div>
                   
                   <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-3 mb-3 flex overflow-hidden">
                     <div 
                        className="bg-brand-green h-3" 
                        style={{ width: `${Math.min(100, (Object.values(selectedLot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight||0), 0) / (selectedLot.weight || 1)) * 100)}%` }}
                     ></div>
                     <div 
                        className="bg-brand-red opacity-30 h-3" 
                        style={{ width: `${Math.max(0, ((selectedLot.weight - Object.values(selectedLot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight||0), 0)) / (selectedLot.weight || 1)) * 100)}%` }}
                     ></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                        <span className="text-gray-600 dark:text-slate-300">Obtenu: <strong className="text-brand-green">{Object.values(selectedLot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight||0), 0).toFixed(1)} kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-red opacity-50"></div>
                        <span className="text-gray-600 dark:text-slate-300">Pertes: <strong className="text-brand-red">{Math.max(0, selectedLot.weight - Object.values(selectedLot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight||0), 0)).toFixed(1)} kg</strong></span>
                      </div>
                   </div>
                   <div className="text-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Rendement Global</span>
                     <span className="text-xl font-extrabold text-blue-600">{selectedLot.weight > 0 ? ((Object.values(selectedLot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight||0), 0) / selectedLot.weight) * 100).toFixed(1) : '0'} %</span>
                   </div>
                </div>

                <h4 className="font-bold text-gray-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-2">Répartition des Morceaux :</h4>
                <div className="space-y-1.5">
                  {pieceFields.map(({ key, label }) => {
                    const item = selectedLot.cuttingDetails!.pieces[key];
                    if (item.quantity === 0 && item.weight === 0) return null;
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-600 dark:text-slate-300 text-xs font-medium">{label}</span>
                        <div className="text-right">
                          <span className="font-bold text-brand-text dark:text-white text-sm block">{item.weight.toFixed(1)} kg</span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{item.quantity} unités</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {canEdit && (
                  <button
                    onClick={() => handleOpenForm(selectedLot, true)}
                    className="flex-1 bg-brand-blue text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} />
                    Modifier la saisie
                  </button>
                )}
                <button
                  onClick={() => setSelectedLot(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-bold"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-slate-500">
              <Scissors size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour enregistrer ou consulter la découpe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecoupePage;
