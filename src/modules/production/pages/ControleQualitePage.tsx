import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldAlert, CheckCircle, XCircle, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, QualityStatus, QualityDetails } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';

export const ControleQualitePage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsReviewed, setLotsReviewed] = useState<ProductionLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise'>('attente');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [visualControl, setVisualControl] = useState<'CONFORME' | 'NON_CONFORME'>('CONFORME');
  const [weightControl, setWeightControl] = useState<'CONFORME' | 'NON_CONFORME'>('CONFORME');
  const [temperatureControl, setTemperatureControl] = useState<'CONFORME' | 'NON_CONFORME'>('CONFORME');
  const [conformity, setConformity] = useState<'CONFORME' | 'NON_CONFORME'>('CONFORME');
  
  const [comments, setComments] = useState('');
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadLots = async () => {
    setLoading(true);
    // Lots in CONTROLE_QUALITE step are waiting for quality check
    const waiting = await productionService.getLotsByStep(ProductionStep.CONTROLE_QUALITE);
    // Lots with quality check completed (qualityStatus PASSED or FAILED)
    const allLots = await productionService.getAllLots();
    const finished = allLots.filter(l => 
      l.qualityStatus === QualityStatus.PASSED || 
      l.qualityStatus === QualityStatus.FAILED
    );
    
    setLotsWaiting(waiting);
    setLotsReviewed(finished);
    setLoading(false);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleOpenForm = (lot: ProductionLot, editMode = false) => {
    setSelectedLot(lot);
    setIsEditing(editMode);
    setIsFormOpen(true);

    if (editMode && lot.qualityDetails) {
      setVisualControl(lot.qualityDetails.visualControl);
      setWeightControl(lot.qualityDetails.weightControl);
      setTemperatureControl(lot.qualityDetails.temperatureControl);
      setConformity(lot.qualityDetails.conformity as any);
      setComments(lot.qualityDetails.comments || '');
      setResponsible(lot.qualityDetails.responsible);
      setDate(lot.qualityDetails.date);
    } else {
      setVisualControl('CONFORME');
      setWeightControl('CONFORME');
      setTemperatureControl('CONFORME');
      setConformity('CONFORME');
      setComments('');
      setResponsible(lot.responsible || 'Moussa Sow');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleControlChange = (type: 'visual' | 'weight' | 'temp', val: 'CONFORME' | 'NON_CONFORME') => {
    if (type === 'visual') setVisualControl(val);
    if (type === 'weight') setWeightControl(val);
    if (type === 'temp') setTemperatureControl(val);

    // Auto-update conformity: if any control is non-conforme, the overall conformity defaults to non-conforme
    // However, the inspector can still override if needed.
    setTimeout(() => {
      setConformity(prev => {
        const checkVisual = type === 'visual' ? val : visualControl;
        const checkWeight = type === 'weight' ? val : weightControl;
        const checkTemp = type === 'temp' ? val : temperatureControl;
        
        if (checkVisual === 'NON_CONFORME' || checkWeight === 'NON_CONFORME' || checkTemp === 'NON_CONFORME') {
          return 'NON_CONFORME';
        }
        return 'CONFORME';
      });
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;

    setLoading(true);
    const details: QualityDetails = {
      visualControl,
      weightControl,
      temperatureControl,
      conformity,
      comments,
      date,
      responsible
    };

    const res = await productionService.validateQuality(selectedLot.id, details);

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
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement des contrôles qualité...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Contrôle Qualité & Conformité</h2>
        <p className="text-gray-500 text-sm mt-1">Inspection sanitaire et technique avant libération pour le stock et la vente</p>
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
          Contrôles à Effectuer ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Historique des Contrôles ({lotsReviewed.length})
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code Lot</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit Conditionné</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Poids (kg)</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Unités</th>
                  {activeTab === 'realise' && (
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Verdict Qualité</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Inspecteur</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Aucun lot en attente de contrôle qualité.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">{lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.processingDetails?.productName || lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">{lot.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-600">{lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleOpenForm(lot, false)}
                            className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                          >
                            Inspecter le lot
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  lotsReviewed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Aucun rapport de qualité enregistré.</td>
                    </tr>
                  ) : (
                    lotsReviewed.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">{lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-semibold">{lot.processingDetails?.productName || lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{lot.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            lot.qualityStatus === QualityStatus.PASSED 
                              ? 'bg-green-100 text-brand-green' 
                              : 'bg-red-100 text-brand-red'
                          }`}>
                            {lot.qualityStatus === QualityStatus.PASSED ? 'CONFORME' : 'REFUSÉ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lot.qualityDetails?.responsible}</td>
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

        {/* Sidebar Form / Consultation Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex justify-between items-center">
                <span>{isEditing ? 'Modifier Inspection' : 'Enregistrer Inspection'}</span>
                <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>

              {/* Quality Checklist Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-text block">1. Contrôle Visuel</span>
                    <span className="text-[10px] text-gray-400 block font-semibold">Aspect, plumage, couleur</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleControlChange('visual', 'CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        visualControl === 'CONFORME' 
                          ? 'bg-brand-green text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleControlChange('visual', 'NON_CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        visualControl === 'NON_CONFORME' 
                          ? 'bg-brand-red text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      KO
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-text block">2. Contrôle du Poids</span>
                    <span className="text-[10px] text-gray-400 block font-semibold">Poids net vs ciblé</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleControlChange('weight', 'CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        weightControl === 'CONFORME' 
                          ? 'bg-brand-green text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleControlChange('weight', 'NON_CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        weightControl === 'NON_CONFORME' 
                          ? 'bg-brand-red text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      KO
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-text block">3. Contrôle de Température</span>
                    <span className="text-[10px] text-gray-400 block font-semibold">Température de stockage (0-4°C)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleControlChange('temp', 'CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        temperatureControl === 'CONFORME' 
                          ? 'bg-brand-green text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleControlChange('temp', 'NON_CONFORME')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        temperatureControl === 'NON_CONFORME' 
                          ? 'bg-brand-red text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      KO
                    </button>
                  </div>
                </div>
              </div>

              {/* Overall Conformity */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conformité Globale</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConformity('CONFORME')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 border transition-all ${
                      conformity === 'CONFORME'
                        ? 'bg-brand-green/10 text-brand-green border-brand-green'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    CONFORME
                  </button>
                  <button
                    type="button"
                    onClick={() => setConformity('NON_CONFORME')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 border transition-all ${
                      conformity === 'NON_CONFORME'
                        ? 'bg-brand-red/10 text-brand-red border-brand-red'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldAlert size={14} />
                    NON CONFORME
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date Contrôle</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Inspecteur</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commentaires / Actions Correctives</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={2}
                  placeholder="Justification en cas de non-conformité..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              {conformity === 'CONFORME' && (
                <div className="bg-brand-green/5 border border-brand-green/15 rounded-xl p-3 text-brand-green text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>La validation créera automatiquement une entrée de stock "Produits Finis".</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-green text-white py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 flex items-center justify-center gap-1"
                >
                  <Save size={14} />
                  Valider le contrôle
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
          ) : selectedLot && selectedLot.qualityDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text border-b pb-2 flex items-center justify-between">
                <span>Détails Contrôle</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  selectedLot.qualityStatus === QualityStatus.PASSED
                    ? 'bg-green-100 text-brand-green'
                    : 'bg-red-100 text-brand-red'
                }`}>
                  {selectedLot.qualityStatus === QualityStatus.PASSED ? 'VALIDÉ' : 'REFUSÉ'}
                </span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block">Code Lot de Production</span>
                  <span className="font-mono font-bold text-purple-700">{selectedLot.packagingDetails?.productionLotNumber || selectedLot.elevageLotNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 font-bold block">Date Inspection</span>
                    <span className="font-semibold text-brand-text">{selectedLot.qualityDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">Inspecteur</span>
                    <span className="font-semibold text-brand-text">{selectedLot.qualityDetails.responsible}</span>
                  </div>
                </div>

                <hr className="border-gray-100" />
                
                <h4 className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-2">Résultats de la Checklist :</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-600 font-medium">Contrôle Visuel</span>
                    <span className={`font-bold ${selectedLot.qualityDetails.visualControl === 'CONFORME' ? 'text-brand-green' : 'text-brand-red'}`}>{selectedLot.qualityDetails.visualControl}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-600 font-medium">Contrôle du Poids</span>
                    <span className={`font-bold ${selectedLot.qualityDetails.weightControl === 'CONFORME' ? 'text-brand-green' : 'text-brand-red'}`}>{selectedLot.qualityDetails.weightControl}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-600 font-medium">Contrôle de Température</span>
                    <span className={`font-bold ${selectedLot.qualityDetails.temperatureControl === 'CONFORME' ? 'text-brand-green' : 'text-brand-red'}`}>{selectedLot.qualityDetails.temperatureControl}</span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <span className="text-xs text-gray-400 font-bold block">Commentaires & Verdict</span>
                  <p className="text-gray-600 text-xs italic bg-gray-50 p-2.5 rounded-lg border mt-1 border-gray-100">{selectedLot.qualityDetails.comments || 'Aucun commentaire enregistré.'}</p>
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
              <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3 animate-bounce" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour effectuer le contrôle qualité.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
