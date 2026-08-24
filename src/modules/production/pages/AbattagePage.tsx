import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Edit3, CheckCircle, AlertTriangle, Plus, ArrowRight, ShieldCheck, Clipboard, Scale, Activity } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, SlaughterDetails } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { useAuth } from '../../../core/context/AuthContext';

export const AbattagePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lotIdParam = searchParams.get('lotId');

  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsSlaughtered, setLotsSlaughtered] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  
  const { hasPermission } = useAuth();
  const canCreateProduction = hasPermission(['PRODUCTION_CREATE']);
  const canUpdateProduction = hasPermission(['PRODUCTION_UPDATE']);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise'>('attente');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SlaughterDetails>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    responsible: '',
    quantityReceived: 0,
    quantitySlaughtered: 0,
    losses: 0,
    lossesReason: '',
    observations: ''
  });

  const loadLots = async () => {
    setLoading(true);
    const waiting = await productionService.getLotsByStep(ProductionStep.ATTENTE_ABATTAGE);
    const finished = await productionService.getLotsByStep(ProductionStep.ABATTAGE_TERMINE);
    setLotsWaiting(waiting);
    setLotsSlaughtered(finished);
    setLoading(false);

    // If query param lotId is present, automatically open form
    if (lotIdParam) {
      const targetLot = waiting.find(l => l.id === lotIdParam) || finished.find(l => l.id === lotIdParam);
      if (targetLot) {
        handleOpenForm(targetLot, targetLot.status === ProductionStep.ABATTAGE_TERMINE);
      }
    }
  };

  useEffect(() => {
    loadLots();
  }, [lotIdParam]);

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);
    
    if (editMode && lot.slaughterDetails) {
      setFormData({ ...lot.slaughterDetails });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        responsible: lot.responsible || 'Amadou Koné',
        quantityReceived: lot.quantity,
        quantitySlaughtered: lot.quantity, // default to all abattus
        losses: 0,
        lossesReason: '',
        observations: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-recalculate slaughtered based on received - losses
      if (name === 'losses') {
        const lossVal = parseInt(value) || 0;
        updated.quantitySlaughtered = Math.max(0, prev.quantityReceived - lossVal);
      } else if (name === 'quantitySlaughtered') {
        const slaughterVal = parseInt(value) || 0;
        updated.losses = Math.max(0, prev.quantityReceived - slaughterVal);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    setLoading(true);
    const res = await productionService.startSlaughter(selectedLot.id, {
      ...formData,
      quantityReceived: Number(formData.quantityReceived),
      quantitySlaughtered: Number(formData.quantitySlaughtered),
      losses: Number(formData.losses)
    });
    
    // Save to unified loss system if there are losses
    if (res && Number(formData.losses) > 0) {
      await productionService.saveLoss({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productionLotId: selectedLot.id,
        productionLotNumber: selectedLot.elevageLotNumber,
        step: ProductionStep.ABATTAGE_TERMINE,
        quantity: Number(formData.losses),
        unit: 'unités',
        reason: 'Perte d\'abattage',
        responsible: formData.responsible || 'Inconnu',
        comments: formData.lossesReason,
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

  if (loading && lotsWaiting.length === 0 && lotsSlaughtered.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des informations d'abattage...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Gestion de l'Abattage</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Saisie et suivi des opérations d'abattage, comptabilisation des pertes et rendements</p>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('attente')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'attente' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          En attente d'abattage ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Abattage Terminé / Historique ({lotsSlaughtered.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table of Lots */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Volailles Reçues</th>
                  {activeTab === 'realise' && (
                    <>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Abattues</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pertes</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Taux Survie</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun lot en attente d'abattage.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-700 dark:text-slate-200">{lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {canCreateProduction && (
                            <button
                              onClick={() => handleOpenForm(lot, false)}
                              className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                            >
                              Saisir Abattage
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsSlaughtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun historique d'abattage enregistré.</td>
                    </tr>
                  ) : (
                    lotsSlaughtered.map(lot => {
                      const received = lot.slaughterDetails?.quantityReceived || 0;
                      const slaughtered = lot.slaughterDetails?.quantitySlaughtered || 0;
                      const survivalRate = received > 0 ? ((slaughtered / received) * 100).toFixed(1) : '0';

                      return (
                        <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-slate-300">{received}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-green">{slaughtered}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-red">{lot.slaughterDetails?.losses || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{survivalRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.slaughterDetails?.responsible}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="flex justify-center items-center gap-2">
                              {canUpdateProduction && (
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
                                className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 px-2 py-1 rounded"
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

        {/* Sidebar Form / Consultation Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text dark:text-white border-b pb-2">
                {isEditing ? 'Modifier l\'Abattage' : 'Enregistrer l\'Abattage'}
                <span className="block text-xs font-mono font-bold text-brand-blue mt-1">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
                <strong>Information :</strong> Le poids vif du lot à la réception était de <strong>{selectedLot.weight.toFixed(1)} kg</strong>.
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Heure</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Responsable</label>
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de l'opérateur"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Volailles Reçues</label>
                  <input
                    type="number"
                    name="quantityReceived"
                    value={formData.quantityReceived}
                    disabled
                    className="w-full px-3 py-2 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-red uppercase mb-1">Rejets (Pertes)</label>
                  <input
                    type="number"
                    name="losses"
                    value={formData.losses}
                    onChange={handleInputChange}
                    min={0}
                    max={formData.quantityReceived}
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-brand-red focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-green uppercase mb-1">Nombre Abattu Effectif</label>
                <input
                  type="number"
                  name="quantitySlaughtered"
                  value={formData.quantitySlaughtered}
                  onChange={handleInputChange}
                  min={0}
                  max={formData.quantityReceived}
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-brand-green focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              {formData.losses > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Motif des pertes</label>
                  <input
                    type="text"
                    name="lossesReason"
                    value={formData.lossesReason || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Échauffement, stress, etc."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Poids carcasse obtenu (API manquante)</label>
                <input
                  type="text"
                  disabled
                  value="Non supporté par l'API"
                  className="w-full px-3 py-2 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 italic rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Observations</label>
                <textarea
                  name="observations"
                  value={formData.observations || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Notes complémentaires..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90"
                >
                  {isEditing ? 'Enregistrer modifs' : 'Valider abattage'}
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
          ) : selectedLot && selectedLot.slaughterDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-brand-blue" />
                  Bilan Abattage
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
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.slaughterDetails.responsible}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-300">Horodatage :</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.slaughterDetails.date} à {selectedLot.slaughterDetails.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg text-center shadow-sm">
                    <Scale size={20} className="mx-auto text-gray-400 dark:text-slate-500 mb-1" />
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold block uppercase">Poids Vif Initial</span>
                    <span className="text-md font-bold text-brand-text dark:text-white">{selectedLot.weight.toFixed(1)} kg</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg text-center shadow-sm">
                    <Scale size={20} className="mx-auto text-gray-400 dark:text-slate-500 mb-1" />
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold block uppercase">Poids Carcasse</span>
                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 italic mt-1 block">Donnée API absente</span>
                  </div>
                </div>

                {/* Rendement visuel */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                   <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3 text-center">Rendement Quantitatif (Taux de survie)</h4>
                   
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Volailles Reçues</span>
                     <span className="text-sm font-bold">{selectedLot.slaughterDetails.quantityReceived}</span>
                   </div>
                   
                   <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-2.5 mb-3 flex overflow-hidden">
                     <div 
                        className="bg-brand-green h-2.5" 
                        style={{ width: `${(selectedLot.slaughterDetails.quantitySlaughtered / selectedLot.slaughterDetails.quantityReceived) * 100}%` }}
                     ></div>
                     <div 
                        className="bg-brand-red h-2.5" 
                        style={{ width: `${(selectedLot.slaughterDetails.losses / selectedLot.slaughterDetails.quantityReceived) * 100}%` }}
                     ></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                        <span className="text-gray-600 dark:text-slate-300">Abattues: <strong className="text-brand-green">{selectedLot.slaughterDetails.quantitySlaughtered}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                        <span className="text-gray-600 dark:text-slate-300">Pertes: <strong className="text-brand-red">{selectedLot.slaughterDetails.losses}</strong></span>
                      </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                   <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3 text-center">Rendement Massique (Poids)</h4>
                   <div className="text-center">
                     <span className="text-2xl font-extrabold text-gray-300">— %</span>
                     <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase mt-1">Impossible à calculer sans le poids carcasse (API manquante)</p>
                   </div>
                </div>

                {selectedLot.slaughterDetails.losses > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 rounded-xl p-3 text-brand-red dark:text-red-400 text-xs shadow-sm">
                    <span className="font-bold block uppercase text-[10px]">Motif des pertes :</span>
                    {selectedLot.slaughterDetails.lossesReason}
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-bold block">Observations</span>
                  <p className="text-gray-600 dark:text-slate-300 text-xs italic bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-800">{selectedLot.slaughterDetails.observations || 'Aucune observation enregistrée.'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {canUpdateProduction && (
                  <button
                    onClick={() => handleOpenForm(selectedLot, true)}
                    className="flex-1 bg-brand-blue text-white py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center justify-center gap-1"
                  >
                    <Edit3 size={14} />
                    Modifier
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
              <Clipboard size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour saisir ou consulter son bilan d'abattage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
