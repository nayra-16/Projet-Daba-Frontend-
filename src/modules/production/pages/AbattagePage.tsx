import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Edit3, CheckCircle, AlertTriangle, Plus, ArrowRight, ShieldCheck, Clipboard } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, SlaughterDetails } from '../types';

export const AbattagePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lotIdParam = searchParams.get('lotId');

  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsSlaughtered, setLotsSlaughtered] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
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
    
    if (res) {
      setIsFormOpen(false);
      setSelectedLot(null);
      await loadLots();
      setActiveTab('realise');
    } else {
      setLoading(false);
    }
  };

  if (loading) {
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
        <h2 className="text-3xl font-extrabold text-brand-text">Gestion de l'Abattage</h2>
        <p className="text-gray-500 text-sm mt-1">Saisie et suivi des opérations d'abattage, comptabilisation des pertes et rendements</p>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attente')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'attente' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          En attente d'abattage ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Abattage Terminé / Historique ({lotsSlaughtered.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table of Lots */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lot</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Volailles Reçues</th>
                  {activeTab === 'realise' && (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Abattues</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Pertes</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Aucun lot en attente d'abattage.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-gray-700">{lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleOpenForm(lot, false)}
                            className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                          >
                            Enregistrer Abattage
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsSlaughtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Aucun historique d'abattage enregistré.</td>
                    </tr>
                  ) : (
                    lotsSlaughtered.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{lot.slaughterDetails?.quantityReceived}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-green">{lot.slaughterDetails?.quantitySlaughtered}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-red">{lot.slaughterDetails?.losses}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.slaughterDetails?.responsible}</td>
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
                              title="Consulter"
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

        {/* Sidebar Form / Consultation Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2">
                {isEditing ? 'Modifier l\'Abattage' : 'Enregistrer l\'Abattage'}
                <span className="block text-xs font-mono font-bold text-brand-blue mt-1">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Heure</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Responsable</label>
                <input
                  type="text"
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de l'opérateur"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Volailles Reçues</label>
                  <input
                    type="number"
                    name="quantityReceived"
                    value={formData.quantityReceived}
                    disabled
                    className="w-full px-3 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-red uppercase mb-1">Pertes (mortalité)</label>
                  <input
                    type="number"
                    name="losses"
                    value={formData.losses}
                    onChange={handleInputChange}
                    min={0}
                    max={formData.quantityReceived}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-brand-red focus:outline-none focus:border-brand-green"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-brand-green focus:outline-none focus:border-brand-green"
                />
              </div>

              {formData.losses > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motif des pertes</label>
                  <input
                    type="text"
                    name="lossesReason"
                    value={formData.lossesReason || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Échauffement, stress, etc."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observations</label>
                <textarea
                  name="observations"
                  value={formData.observations || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Notes complémentaires..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90"
                >
                  {isEditing ? 'Enregistrer les modifications' : 'Finaliser l\'abattage'}
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
          ) : selectedLot && selectedLot.slaughterDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex items-center justify-between">
                <span>Détails Abattage</span>
                <span className="text-xs bg-brand-green bg-opacity-10 text-brand-green px-2 py-0.5 rounded-full font-bold">Enregistré</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-bold block">Lot Élevage d'origine</span>
                  <span className="font-mono font-bold text-brand-blue">{selectedLot.elevageLotNumber}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">Date</span>
                    <span className="font-semibold text-brand-text">{selectedLot.slaughterDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">Heure</span>
                    <span className="font-semibold text-brand-text">{selectedLot.slaughterDetails.time}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-bold block">Responsable</span>
                  <span className="font-semibold text-brand-text">{selectedLot.slaughterDetails.responsible}</span>
                </div>

                <hr className="border-gray-100" />

                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Reçus</span>
                    <span className="text-md font-bold text-brand-text">{selectedLot.slaughterDetails.quantityReceived}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-green font-bold block uppercase">Abattus</span>
                    <span className="text-md font-extrabold text-brand-green">{selectedLot.slaughterDetails.quantitySlaughtered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-red font-bold block uppercase">Pertes</span>
                    <span className="text-md font-extrabold text-brand-red">{selectedLot.slaughterDetails.losses}</span>
                  </div>
                </div>

                {selectedLot.slaughterDetails.losses > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-brand-red text-xs">
                    <span className="font-bold block uppercase text-[10px]">Motif des pertes :</span>
                    {selectedLot.slaughterDetails.lossesReason}
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-400 font-bold block">Observations</span>
                  <p className="text-gray-600 text-xs italic">{selectedLot.slaughterDetails.observations || 'Aucune observation enregistrée.'}</p>
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
              <Clipboard size={48} className="mx-auto text-gray-300 mb-3 animate-bounce" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour saisir ou consulter son abattage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
