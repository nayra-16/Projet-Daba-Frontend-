import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Package, Save, Barcode, ArrowRight, Scale, Activity, Snowflake, PackageCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, PackagingDetails, ChambreFroide } from '../types';
import { useAuth } from '../../../core/context/AuthContext';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { ConditionnementStats } from '../components/conditionnement/ConditionnementStats';
import { TabAttente } from '../components/conditionnement/TabAttente';
import { TabRealise } from '../components/conditionnement/TabRealise';
import { TabChambres } from '../components/conditionnement/TabChambres';
import { TabIncidents } from '../components/conditionnement/TabIncidents';
import { TabHistorique } from '../components/conditionnement/TabHistorique';
import { TabLotsPerdus } from '../components/conditionnement/TabLotsPerdus';

const PACKAGING_TYPES = [
  'Sachet plastique scellé',
  'Barquette sous atmosphère',
  'Film rétractable & barquette',
  'Carton de regroupement',
  'Sac vrac zippé'
];

export const ConditionnementPage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsPackaged, setLotsPackaged] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise' | 'chambres' | 'incidents' | 'historique' | 'perdus'>('attente');
  const [chambres, setChambres] = useState<ChambreFroide[]>([]);

  // Unit calculator mode
  const [useUnitCalculator, setUseUnitCalculator] = useState(false);
  const [unitWeightStr, setUnitWeightStr] = useState('1.0');
  
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(['PRODUCTION_CREATE', 'PRODUCTION_UPDATE']);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [packagingType, setPackagingType] = useState(PACKAGING_TYPES[0]);
  
  // Nouveaux champs pour le calcul
  const [unitWeight, setUnitWeight] = useState<number | ''>(''); // Poids unitaire en kg (ex: 0.5)
  const [quantity, setQuantity] = useState<number | ''>(''); // Nombre d'emballages
  const [weight, setWeight] = useState<number | ''>(''); // Poids total
  
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dlc, setDlc] = useState('');
  const [generatedLotNum, setGeneratedLotNum] = useState('');

  // Stocker Form State
  const [isStockerFormOpen, setIsStockerFormOpen] = useState(false);
  const [selectedChambreId, setSelectedChambreId] = useState('');

  const loadLots = async () => {
    setLoading(true);
    // Lots in TRANSFORMATION are waiting for packaging
    const waiting = await productionService.getLotsByStep(ProductionStep.TRANSFORMATION);
    // Lots in CONTROLE_QUALITE, PRODUIT_TERMINE, or STOCK have completed packaging
    const allLots = await productionService.getAllLots();
    const finished = allLots.filter(l => 
      l.status === ProductionStep.CONTROLE_QUALITE || 
      l.status === ProductionStep.PRODUIT_TERMINE || 
      l.status === ProductionStep.STOCK
    );
    
    try {
      const cf = await productionService.getChambresFroides();
      setChambres(cf);
    } catch (e) {
      console.error(e);
    }

    setLotsWaiting(waiting);
    setLotsPackaged(finished);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const getAvailableWeight = (lot: ProductionLot) => {
    if (lot.processingDetails) return lot.processingDetails.weight;
    if (lot.cuttingDetails?.pieces) return Object.values(lot.cuttingDetails.pieces).reduce((s, p) => s + (p.weight || 0), 0);
    return lot.weight;
  };

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const defaultLotNum = lot.packagingDetails?.productionLotNumber || `LOT-PROD-${todayStr}-${lot.elevageLotId}`;
    setGeneratedLotNum(defaultLotNum);
    
    if (editMode && lot.packagingDetails) {
      setPackagingType(lot.packagingDetails.packagingType);
      setQuantity(lot.packagingDetails.quantity);
      setWeight(lot.packagingDetails.weight);
      // Tentative de déduction du format unitaire
      if (lot.packagingDetails.quantity > 0) {
        setUnitWeight(Number((lot.packagingDetails.weight / lot.packagingDetails.quantity).toFixed(3)));
      }
      setResponsible(lot.packagingDetails.responsible);
      setDate(lot.packagingDetails.date);
      setDlc(lot.dlc || '');
    } else {
      setPackagingType(PACKAGING_TYPES[0]);
      setQuantity('');
      setWeight('');
      setUnitWeight('');
      setResponsible(lot.responsible || 'Fatou Diop');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Default DLC: + 10 jours
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setDlc(d.toISOString().split('T')[0]);
    }
  };

  // Gestion du lien entre format, quantité et poids total
  const handleUnitWeightChange = (val: string) => {
    const num = Number(val);
    setUnitWeight(val === '' ? '' : num);
    if (num > 0 && typeof quantity === 'number') {
      setWeight(Number((num * quantity).toFixed(3)));
    } else if (num > 0 && typeof weight === 'number') {
       setQuantity(Math.floor(weight / num));
    }
  };

  const handleQuantityChange = (val: string) => {
    const num = Number(val);
    setQuantity(val === '' ? '' : num);
    if (num > 0 && typeof unitWeight === 'number') {
      setWeight(Number((num * unitWeight).toFixed(3)));
    }
  };

  const handleWeightChange = (val: string) => {
    const num = Number(val);
    setWeight(val === '' ? '' : num);
    if (num > 0 && typeof unitWeight === 'number' && unitWeight > 0) {
      setQuantity(Math.floor(num / unitWeight));
    }
  };

  const availableWeight = selectedLot ? getAvailableWeight(selectedLot) : 0;
  const currentTotalWeight = Number(weight) || 0;
  const exceedsWeight = currentTotalWeight > availableWeight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;
    if (exceedsWeight) return;

    setLoading(true);
    const details: PackagingDetails = {
      packagingType,
      quantity: Number(quantity) || 0,
      weight: currentTotalWeight,
      date,
      responsible,
      productionLotNumber: generatedLotNum
    };
    
    const res = await productionService.savePackaging(selectedLot.id, details);
    
    if (res) {
      if (dlc) {
        await productionService.updateLotExtras(res.id, { dlc });
      }
      setIsFormOpen(false);
      setSelectedLot(null);
      await loadLots();
      setActiveTab('realise');
    } else {
      setLoading(false);
    }
  };

  const handleStockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !selectedChambreId) return;
    
    setLoading(true);
    await productionService.updateLotExtras(selectedLot.id, { chambreFroideId: selectedChambreId });
    setIsStockerFormOpen(false);
    setSelectedLot(null);
    await loadLots();
  };

  if (loading && lotsWaiting.length === 0 && lotsPackaged.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des conditionnements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Conditionnement</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Mise sous emballage, gestion des formats unitaires et génération du lot de commercialisation</p>
      </div>

      {/* Stats Cards */}
      <ConditionnementStats 
        chambres={chambres} 
        lotsWaiting={lotsWaiting} 
        lotsPackaged={lotsPackaged} 
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('attente')}
          className={`px-4 lg:px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'attente' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          À conditionner ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-4 lg:px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Conditionnés ({lotsPackaged.length})
        </button>
        <button
          onClick={() => setActiveTab('chambres')}
          className={`px-4 lg:px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'chambres' 
              ? 'border-blue-500 text-blue-500' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Chambres froides ({chambres.length})
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 lg:px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'incidents' 
              ? 'border-brand-red text-brand-red' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Incidents
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`px-4 lg:px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'historique' 
              ? 'border-purple-500 text-purple-500' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Traçabilité
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chambres' && (
        <TabChambres 
          chambres={chambres} 
          lotsPackaged={lotsPackaged} 
          canEdit={canEdit} 
          onRefresh={loadLots} 
        />
      )}
      
      {activeTab === 'incidents' && (
        <TabIncidents 
          chambres={chambres} 
          canEdit={canEdit} 
          onRefresh={loadLots} 
        />
      )}
      
      {activeTab === 'historique' && (
        <TabHistorique 
          lots={[...lotsWaiting, ...lotsPackaged]} 
        />
      )}

      {activeTab === 'perdus' && (
        <TabLotsPerdus 
          lots={[...lotsWaiting, ...lotsPackaged]} 
        />
      )}

      {(activeTab === 'attente' || activeTab === 'realise') && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Table list */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot d'Origine</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Produit / Nom</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Matière Dispo.</th>
                    {activeTab === 'realise' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Code Lot Production</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Conditionnement</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">DLC</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Chambre</th>
                      </>
                    )}
                    {activeTab === 'attente' && (
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Opérateur</th>
                    )}
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {activeTab === 'attente' ? (
                    <TabAttente 
                      lotsWaiting={lotsWaiting} 
                      canEdit={canEdit}
                      onConditionner={handleOpenForm}
                      getAvailableWeight={getAvailableWeight}
                    />
                  ) : (
                    <TabRealise 
                      lotsPackaged={lotsPackaged}
                      chambres={chambres}
                      canEdit={canEdit}
                      getAvailableWeight={getAvailableWeight}
                      onEditConditionnement={(lot) => handleOpenForm(lot, true)}
                      onStocker={(lot) => {
                        setSelectedLot(lot);
                        setIsStockerFormOpen(true);
                      }}
                    />
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
                  <span>{isEditing ? 'Modifier Conditionnement' : 'Conditionner'}</span>
                  <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
                </h3>

                {/* Indicateur de disponibilité */}
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Matière Disponible :</span>
                  <span className="text-sm font-extrabold text-brand-text dark:text-white">{availableWeight.toFixed(1)} kg</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Code Lot Production</label>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-purple-700">
                    <Barcode size={16} />
                    {generatedLotNum}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Type d'Emballage</label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                  >
                    {PACKAGING_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* SECTION: Format Unitaire et Calculateur */}
                <div className="border border-brand-blue/20 bg-brand-blue/5 rounded-xl p-3 space-y-3">
                   <h4 className="text-[10px] font-bold text-brand-blue uppercase flex items-center gap-1"><Scale size={12}/> Calculateur d'Emballage</h4>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Format Unitaire (kg)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={unitWeight}
                          onChange={(e) => handleUnitWeightChange(e.target.value)}
                          placeholder="ex: 0.5"
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded text-xs font-bold text-brand-blue focus:outline-none focus:border-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Nombre d'unités</label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          min={1}
                          required
                          placeholder="ex: 200"
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded text-xs font-bold text-brand-text dark:text-white focus:outline-none focus:border-brand-green"
                        />
                      </div>
                   </div>

                   <div>
                     <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1">Poids Total Emballé (kg)</label>
                     <input
                       type="number"
                       step="0.1"
                       value={weight}
                       onChange={(e) => handleWeightChange(e.target.value)}
                       min={0.1}
                       required
                       placeholder="Total"
                       className={`w-full px-3 py-2 border rounded-lg text-sm font-extrabold focus:outline-none ${exceedsWeight ? 'border-red-300 text-red-600 focus:border-red-500 bg-red-50' : 'border-gray-200 dark:border-slate-700 text-brand-green focus:border-brand-green bg-white dark:bg-slate-900'}`}
                     />
                   </div>
                   {exceedsWeight && (
                     <p className="text-[10px] text-red-500 font-bold">Le poids emballé dépasse la quantité disponible !</p>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Date d'emballage</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">DLC</label>
                    <input
                      type="date"
                      value={dlc}
                      onChange={(e) => setDlc(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="col-span-2">
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

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={exceedsWeight || currentTotalWeight <= 0}
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
            ) : selectedLot && selectedLot.packagingDetails ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                    <Activity size={20} className="text-brand-blue" />
                    Détails Conditionnement
                  </h3>
                  <ProductionStatusBadge status={selectedLot.status} />
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-800 text-center">
                    <span className="text-gray-500 dark:text-slate-400 font-bold uppercase block mb-1">Code Lot Production</span>
                    <span className="font-mono font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg text-lg border border-purple-200 tracking-wider block">{selectedLot.packagingDetails.productionLotNumber}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 dark:text-slate-500 font-bold block mb-1">Type d'emballage</span>
                    <span className="font-bold text-brand-text dark:text-white text-sm flex items-center gap-2">
                       <Package size={16} className="text-brand-green" />
                       {selectedLot.packagingDetails.packagingType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 dark:text-slate-500 font-bold block">Date</span>
                      <span className="font-semibold text-brand-text dark:text-white">{selectedLot.packagingDetails.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-slate-500 font-bold block">DLC</span>
                      <span className="font-semibold text-brand-text dark:text-white">{selectedLot.dlc ? new Date(selectedLot.dlc).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 dark:text-slate-500 font-bold block">Responsable</span>
                      <span className="font-semibold text-brand-text dark:text-white">{selectedLot.packagingDetails.responsible}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div>
                      <span className="text-[10px] text-brand-blue font-bold block uppercase">Nombre d'Unités</span>
                      <span className="text-lg font-extrabold text-brand-blue">{selectedLot.packagingDetails.quantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-green font-bold block uppercase">Poids Total</span>
                      <span className="text-lg font-extrabold text-brand-green">{selectedLot.packagingDetails.weight.toFixed(1)} kg</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-500 dark:text-slate-400 italic text-[10px]">
                     Format estimé : {selectedLot.packagingDetails.quantity > 0 ? (selectedLot.packagingDetails.weight / selectedLot.packagingDetails.quantity).toFixed(3) : 0} kg / unité
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
            ) : isStockerFormOpen && selectedLot ? (
              <form onSubmit={handleStockerSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                    <Snowflake size={20} className="text-blue-500" />
                    Stocker en chambre froide
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">
                    Lot : {selectedLot.packagingDetails?.productionLotNumber || selectedLot.elevageLotNumber}
                  </label>
                  <div className="text-sm bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-700 mb-4">
                    Poids à stocker: <span className="font-bold">{selectedLot.packagingDetails?.weight} kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Choisir la chambre froide</label>
                  <select
                    value={selectedChambreId}
                    onChange={(e) => setSelectedChambreId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                  >
                    <option value="">-- Sélectionner une chambre --</option>
                    {chambres.map(c => {
                       const isAvailable = c.status === 'Disponible' || c.status === 'Occupée';
                       const remainingCapacity = c.capacity - c.currentLoad;
                       const canFit = remainingCapacity >= (selectedLot.packagingDetails?.weight || 0);
                       const disabled = !isAvailable || !canFit;
                       
                       return (
                         <option key={c.id} value={c.id} disabled={disabled}>
                           {c.name} - {c.status} ({remainingCapacity.toFixed(1)} {c.capacityUnit} restants)
                         </option>
                       );
                    })}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!selectedChambreId}
                    className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    Valider
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsStockerFormOpen(false); setSelectedLot(null); }}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-bold"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500 space-y-3 py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour enregistrer ou consulter le conditionnement.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionnementPage;
