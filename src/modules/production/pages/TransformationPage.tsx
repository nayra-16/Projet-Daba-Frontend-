import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Compass, Save, Check, ArrowRight, Activity, AlertCircle, Scale } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, ProcessingDetails, ProductionRecipe } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { useAuth } from '../../../core/context/AuthContext';

const PRODUCTS = [
  'Viande hachée',
  'Saucisses',
  'Merguez',
  'Brochettes',
  'Nuggets',
  'Cordon bleu',
  'Poulet fumé',
  'Charcuterie'
];

export const TransformationPage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsProcessed, setLotsProcessed] = useState<ProductionLot[]>([]);
  const [recipes, setRecipes] = useState<ProductionRecipe[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise'>('attente');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productName, setProductName] = useState(PRODUCTS[0]);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { hasRole } = useAuth();
  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION');

  const loadLots = async () => {
    setLoading(true);
    const waiting = await productionService.getLotsByStep(ProductionStep.DECOUPE_TERMINEE);
    const finished = await productionService.getLotsByStep(ProductionStep.TRANSFORMATION);
    const loadedRecipes = await productionService.getRecipes();
    setLotsWaiting(waiting);
    setLotsProcessed(finished);
    setRecipes(loadedRecipes);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const getAvailableWeight = (lot: ProductionLot) => {
    if (lot.cuttingDetails?.pieces) {
       return Object.values(lot.cuttingDetails.pieces).reduce((sum, p) => sum + (p.weight || 0), 0);
    }
    return lot.weight;
  };

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);
    setFormError(null);
    
    if (editMode && lot.processingDetails) {
      setProductName(lot.processingDetails.productName);
      setQuantity(lot.processingDetails.quantity);
      setWeight(lot.processingDetails.weight);
      setResponsible(lot.processingDetails.responsible);
      setDate(lot.processingDetails.date);
      setObservations(lot.processingDetails.observations || '');
    } else {
      setProductName(PRODUCTS[0]);
      setQuantity(''); 
      setWeight('');
      setResponsible(lot.responsible || 'Awa Sy');
      setDate(new Date().toISOString().split('T')[0]);
      setObservations('');
    }
  };

  const availableWeight = selectedLot ? getAvailableWeight(selectedLot) : 0;
  const currentWeight = Number(weight) || 0;
  const missingWeight = Math.max(0, availableWeight - currentWeight);
  const exceedsWeight = currentWeight > availableWeight;
  const computedYield = availableWeight > 0 ? ((currentWeight / availableWeight) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    if (exceedsWeight) {
      setFormError("Le poids obtenu ne peut pas dépasser la matière première disponible !");
      return;
    }
    setFormError(null);

    setLoading(true);
    const details: ProcessingDetails = {
      productName,
      quantity: Number(quantity) || 0,
      weight: currentWeight,
      date,
      responsible,
      observations
    };
    
    const res = await productionService.saveProcessing(selectedLot.id, details);
    
    // Save to unified loss system if there are losses
    if (res && missingWeight > 0) {
      await productionService.saveLoss({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        productionLotId: selectedLot.id,
        productionLotNumber: selectedLot.elevageLotNumber,
        step: ProductionStep.TRANSFORMATION,
        quantity: missingWeight,
        unit: 'kg',
        reason: 'Perte de transformation',
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

  if (loading && lotsWaiting.length === 0 && lotsProcessed.length === 0) {
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
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Atelier de Transformation</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Élaboration des produits transformés dérivés de la volaille (charcuterie, fumage, marinades)</p>
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
          À transformer ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Transformations Enregistrées ({lotsProcessed.length})
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot d'Origine</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nom du lot</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière Dispo (kg)</th>
                  {activeTab === 'realise' && (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Produit Fini</th>
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
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun lot découpé prêt pour la transformation.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700 dark:text-slate-200">{getAvailableWeight(lot).toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenForm(lot, false)}
                              className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                            >
                              Lancer transformation
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsProcessed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">Aucun produit transformé enregistré.</td>
                    </tr>
                  ) : (
                    lotsProcessed.map(lot => {
                       const avail = getAvailableWeight(lot);
                       const prodWeight = lot.processingDetails?.weight || 0;
                       const yieldPct = avail > 0 ? ((prodWeight / avail) * 100).toFixed(1) : '0';

                       return (
                        <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-slate-300">{avail.toFixed(1)} kg</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-blue">
                             {lot.processingDetails?.productName}
                             <span className="block text-[10px] text-gray-500 dark:text-slate-400 font-normal">{lot.processingDetails?.quantity} u ({prodWeight} kg)</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{yieldPct}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.processingDetails?.responsible}</td>
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
                <span>{isEditing ? 'Modifier Transformation' : 'Saisie Transformation'}</span>
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
                  <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">Matière Première (Viande)</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{availableWeight.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 flex overflow-hidden relative">
                  <div 
                    className={`h-3 transition-all ${exceedsWeight ? 'bg-red-500' : 'bg-brand-green'}`} 
                    style={{ width: `${Math.min(100, (currentWeight / (availableWeight || 1)) * 100)}%` }}
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
                    <span className="text-gray-600 dark:text-slate-300">Transformé: <strong className={exceedsWeight ? 'text-red-500' : 'text-brand-green'}>{currentWeight.toFixed(1)} kg</strong></span>
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

              {/* Recette / Formule */}
              {recipes.find(r => r.productName === productName) && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mt-2">
                  <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-2">Formulation suggérée (pour {currentWeight || 0} kg)</h4>
                  <ul className="space-y-1 text-xs text-amber-800">
                    {recipes.find(r => r.productName === productName)!.ingredients.map(ing => (
                      <li key={ing.id} className="flex justify-between border-b border-amber-200/50 pb-1">
                        <span>{ing.name}</span>
                        <span className="font-bold">{((ing.quantityPer100kg / 100) * (currentWeight || 0)).toFixed(2)} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-700 mt-2 italic flex items-start gap-1">
                    <Compass size={12} className="mt-0.5 flex-shrink-0" />
                    Instructions: {recipes.find(r => r.productName === productName)!.instructions}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Produit à Fabriquer</label>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                >
                  {recipes.length > 0 ? (
                    recipes.map((r, idx) => (
                      <option key={idx} value={r.productName}>{r.productName}</option>
                    ))
                  ) : (
                    PRODUCTS.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Quantité Produite</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    required
                    placeholder="Ex: 100 sachets"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-brand-text dark:text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Poids total obtenu (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={0.1}
                    required
                    placeholder="Poids en kg"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none ${exceedsWeight ? 'border-red-300 text-red-600 focus:border-red-500' : 'border-gray-200 dark:border-slate-700 text-brand-green focus:border-brand-green'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Observations / Recette</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={2}
                  placeholder="Formulation, temps d'étuvage, anomalies..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={exceedsWeight || currentWeight <= 0}
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
          ) : selectedLot && selectedLot.processingDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-brand-blue" />
                  Bilan Transformation
                </h3>
                <ProductionStatusBadge status={selectedLot.status} />
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase block mb-2">Informations d'Origine</span>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 dark:text-slate-300">Lot Source :</span>
                    <span className="font-mono font-bold text-brand-blue">{selectedLot.elevageLotNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-300">Matière Disponible :</span>
                    <span className="font-semibold text-brand-text dark:text-white">{getAvailableWeight(selectedLot).toFixed(1)} kg</span>
                  </div>
                </div>

                {/* Bilan Rendement Visuel */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-lg shadow-sm">
                   <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3 text-center">Produit Fini & Rendement</h4>
                   
                   <div className="flex items-center justify-center gap-2 mb-4 bg-blue-50 p-2 rounded-lg">
                     <span className="font-bold text-brand-blue">{selectedLot.processingDetails.productName}</span>
                     <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">{selectedLot.processingDetails.quantity} u</span>
                   </div>
                   
                   <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-3 mb-3 flex overflow-hidden">
                     <div 
                        className="bg-brand-green h-3" 
                        style={{ width: `${Math.min(100, (selectedLot.processingDetails.weight / (getAvailableWeight(selectedLot) || 1)) * 100)}%` }}
                     ></div>
                     <div 
                        className="bg-brand-red opacity-30 h-3" 
                        style={{ width: `${Math.max(0, ((getAvailableWeight(selectedLot) - selectedLot.processingDetails.weight) / (getAvailableWeight(selectedLot) || 1)) * 100)}%` }}
                     ></div>
                   </div>

                   <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                        <span className="text-gray-600 dark:text-slate-300">Poids Net: <strong className="text-brand-green">{selectedLot.processingDetails.weight.toFixed(1)} kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-brand-red opacity-50"></div>
                        <span className="text-gray-600 dark:text-slate-300">Pertes: <strong className="text-brand-red">{Math.max(0, getAvailableWeight(selectedLot) - selectedLot.processingDetails.weight).toFixed(1)} kg</strong></span>
                      </div>
                   </div>
                   
                   <div className="text-center mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase block mb-1">Rendement de Transformation</span>
                     <span className="text-xl font-extrabold text-blue-600">{getAvailableWeight(selectedLot) > 0 ? ((selectedLot.processingDetails.weight / getAvailableWeight(selectedLot)) * 100).toFixed(1) : '0'} %</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 font-bold block">Date</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.processingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 font-bold block">Responsable</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.processingDetails.responsible}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-bold block mb-1">Observations & Recette</span>
                  <p className="text-gray-600 dark:text-slate-300 text-xs italic bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-800">{selectedLot.processingDetails.observations || 'Aucune observation.'}</p>
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
              <Compass size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour enregistrer ou consulter la transformation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransformationPage;
