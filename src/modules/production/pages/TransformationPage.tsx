import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Compass, Save, Check } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, ProcessingDetails } from '../types';

const PRODUCTS = [
  'Saucisses',
  'Merguez',
  'Poulet fumé',
  'Produits marinés',
  'Nuggets',
  'Autres produits transformés'
];

export const TransformationPage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsProcessed, setLotsProcessed] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise'>('attente');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productName, setProductName] = useState(PRODUCTS[0]);
  const [quantity, setQuantity] = useState(0);
  const [weight, setWeight] = useState(0);
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');

  const loadLots = async () => {
    setLoading(true);
    const waiting = await productionService.getLotsByStep(ProductionStep.DECOUPE_TERMINEE);
    const finished = await productionService.getLotsByStep(ProductionStep.TRANSFORMATION);
    setLotsWaiting(waiting);
    setLotsProcessed(finished);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);
    
    if (editMode && lot.processingDetails) {
      setProductName(lot.processingDetails.productName);
      setQuantity(lot.processingDetails.quantity);
      setWeight(lot.processingDetails.weight);
      setResponsible(lot.processingDetails.responsible);
      setDate(lot.processingDetails.date);
      setObservations(lot.processingDetails.observations || '');
    } else {
      setProductName(PRODUCTS[0]);
      setQuantity(100); // Default placeholder
      setWeight(lot.weight); // default weight from cuts
      setResponsible(lot.responsible || 'Awa Sy');
      setDate(new Date().toISOString().split('T')[0]);
      setObservations('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    setLoading(true);
    const details: ProcessingDetails = {
      productName,
      quantity: Number(quantity),
      weight: Number(weight),
      date,
      responsible,
      observations
    };
    
    const res = await productionService.saveProcessing(selectedLot.id, details);
    
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
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des informations de transformation...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Atelier de Transformation</h2>
        <p className="text-gray-500 text-sm mt-1">Élaboration des produits transformés dérivés de la volaille (charcuterie, fumage, marinades)</p>
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
          À transformer ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Transformations Enregistrées ({lotsProcessed.length})
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
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Poids Matière (kg)</th>
                  {activeTab === 'realise' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit Fini</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Quantité Produite</th>
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
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Aucun lot découpé prêt pour la transformation.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{lot.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleOpenForm(lot, false)}
                            className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                          >
                            Lancer transformation
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsProcessed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Aucun produit transformé enregistré.</td>
                    </tr>
                  ) : (
                    lotsProcessed.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{lot.cuttingDetails?.pieces ? Object.values(lot.cuttingDetails.pieces).reduce((sum, p) => sum + p.weight, 0).toFixed(1) : lot.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-blue">{lot.processingDetails?.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-green">{lot.processingDetails?.quantity} unités ({lot.processingDetails?.weight} kg)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.processingDetails?.responsible}</td>
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
                <span>{isEditing ? 'Modifier Transformation' : 'Saisie Transformation'}</span>
                <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Produit à Fabriquer</label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                >
                  {PRODUCTS.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantité Produite</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    required
                    placeholder="Ex: 100 sachets"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-brand-text focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Poids total obtenu (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={0.1}
                    required
                    placeholder="Poids en kg"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-brand-green focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observations / Recette</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  placeholder="Formulation, temps d'étuvage, anomalies..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
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
          ) : selectedLot && selectedLot.processingDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex items-center justify-between">
                <span>Détails Transformation</span>
                <span className="text-xs bg-brand-green bg-opacity-10 text-brand-green px-2 py-0.5 rounded-full font-bold">Réalisé</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block">Produit élaboré</span>
                  <span className="font-bold text-brand-blue text-sm">{selectedLot.processingDetails.productName}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 font-bold block">Date</span>
                    <span className="font-semibold text-brand-text">{selectedLot.processingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">Responsable</span>
                    <span className="font-semibold text-brand-text">{selectedLot.processingDetails.responsible}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-gray-50 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Unités Produites</span>
                    <span className="text-md font-bold text-brand-text">{selectedLot.processingDetails.quantity} u</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-green font-bold block uppercase">Poids Total</span>
                    <span className="text-md font-extrabold text-brand-green">{selectedLot.processingDetails.weight} kg</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 font-bold block">Observations & Recette</span>
                  <p className="text-gray-600 text-xs italic">{selectedLot.processingDetails.observations || 'Aucune observation.'}</p>
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
              <Compass size={48} className="mx-auto text-gray-300 mb-3 animate-spin duration-1000" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour enregistrer ou consulter la transformation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
