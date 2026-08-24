import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, ArrowRight, ShieldAlert, CheckCircle, Save, ShieldCheck, AlertTriangle, Wind, Package, Tag, Scale, Activity } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot, ProductionStep, QualityStatus, QualityDetails, NonConformity } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { useAuth } from '../../../core/context/AuthContext';

export const ControleQualitePage: React.FC = () => {
  const [lotsWaiting, setLotsWaiting] = useState<ProductionLot[]>([]);
  const [lotsReviewed, setLotsReviewed] = useState<ProductionLot[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attente' | 'realise' | 'nc'>('attente');

  type ControlValue = 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [visualControl, setVisualControl] = useState<ControlValue>('CONFORME');
  const [weightControl, setWeightControl] = useState<ControlValue>('CONFORME');
  const [temperatureControl, setTemperatureControl] = useState<ControlValue>('CONFORME');
  const [odorControl, setOdorControl] = useState<ControlValue>('CONFORME');
  const [packagingControl, setPackagingControl] = useState<ControlValue>('CONFORME');
  const [labelControl, setLabelControl] = useState<ControlValue>('CONFORME');
  
  const [conformity, setConformity] = useState<ControlValue>('CONFORME');
  const [comments, setComments] = useState('');
  const [responsible, setResponsible] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { hasRole } = useAuth();
  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION');

  const loadLots = async () => {
    setLoading(true);
    // Lots in CONTROLE_QUALITE step are waiting for quality check
    const waiting = await productionService.getLotsByStep(ProductionStep.CONTROLE_QUALITE);
    // Lots with quality check completed
    const allLots = await productionService.getAllLots();
    const finished = allLots.filter(l => 
      l.qualityStatus === QualityStatus.PASSED || 
      l.qualityStatus === QualityStatus.FAILED ||
      l.qualityStatus === QualityStatus.WARNING
    );
    const ncList = await productionService.getNonConformities();
    
    setLotsWaiting(waiting);
    setLotsReviewed(finished);
    setNonConformities(ncList);
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
      setOdorControl(lot.qualityDetails.odorControl || 'CONFORME');
      setPackagingControl(lot.qualityDetails.packagingControl || 'CONFORME');
      setLabelControl(lot.qualityDetails.labelControl || 'CONFORME');
      setConformity(lot.qualityDetails.conformity as any);
      setComments(lot.qualityDetails.comments || '');
      setResponsible(lot.qualityDetails.responsible);
      setDate(lot.qualityDetails.date);
    } else {
      setVisualControl('CONFORME');
      setWeightControl('CONFORME');
      setTemperatureControl('CONFORME');
      setOdorControl('CONFORME');
      setPackagingControl('CONFORME');
      setLabelControl('CONFORME');
      setConformity('CONFORME');
      setComments('');
      setResponsible(lot.responsible || 'Moussa Sow');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleControlChange = (
    type: 'visual' | 'weight' | 'temp' | 'odor' | 'packaging' | 'label', 
    val: ControlValue
  ) => {
    if (type === 'visual') setVisualControl(val);
    if (type === 'weight') setWeightControl(val);
    if (type === 'temp') setTemperatureControl(val);
    if (type === 'odor') setOdorControl(val);
    if (type === 'packaging') setPackagingControl(val);
    if (type === 'label') setLabelControl(val);

    // Auto-update conformity logic
    setTimeout(() => {
      setConformity(prev => {
        const c1 = type === 'visual' ? val : visualControl;
        const c2 = type === 'weight' ? val : weightControl;
        const c3 = type === 'temp' ? val : temperatureControl;
        const c4 = type === 'odor' ? val : odorControl;
        const c5 = type === 'packaging' ? val : packagingControl;
        const c6 = type === 'label' ? val : labelControl;
        
        const controls = [c1, c2, c3, c4, c5, c6];
        if (controls.includes('NON_CONFORME')) return 'NON_CONFORME';
        if (controls.includes('A_SURVEILLER')) return 'A_SURVEILLER';
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
      odorControl,
      packagingControl,
      labelControl,
      conformity,
      comments,
      date,
      responsible
    };

    const res = await productionService.validateQuality(selectedLot.id, details);

    if (res && (conformity === 'NON_CONFORME' || conformity === 'A_SURVEILLER')) {
      await productionService.saveNonConformity({
        id: Date.now().toString(),
        date,
        productionLotId: selectedLot.id,
        productionLotNumber: selectedLot.packagingDetails?.productionLotNumber || selectedLot.elevageLotNumber,
        type: 'Contrôle Qualité',
        description: comments || `Lot déclaré ${conformity}`,
        severity: conformity === 'NON_CONFORME' ? 'Critique' : 'Mineure',
        status: 'Ouvert',
        reportedBy: responsible,
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

  const getStatusBadge = (status: QualityStatus) => {
    if (status === QualityStatus.PASSED) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-brand-green">CONFORME</span>;
    }
    if (status === QualityStatus.WARNING) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">À SURVEILLER</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-brand-red">REFUSÉ</span>;
  };

  const getControlColor = (val: ControlValue) => {
     if (val === 'CONFORME') return 'text-brand-green';
     if (val === 'A_SURVEILLER') return 'text-yellow-600';
     return 'text-brand-red';
  };

  if (loading && lotsWaiting.length === 0 && lotsReviewed.length === 0) {
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
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Contrôle Qualité & Conformité</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Inspection sanitaire détaillée avant libération pour le stock et la vente</p>
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
          Contrôles à Effectuer ({lotsWaiting.length})
        </button>
        <button
          onClick={() => setActiveTab('realise')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'realise' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Historique des Contrôles ({lotsReviewed.length})
        </button>
        <button
          onClick={() => setActiveTab('nc')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'nc' 
              ? 'border-red-500 text-red-500' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
          }`}
        >
          Non-Conformités ({nonConformities.length})
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{activeTab === 'nc' ? 'Date' : 'Code Lot'}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{activeTab === 'nc' ? 'Code Lot' : 'Produit Conditionné'}</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{activeTab === 'nc' ? 'Sévérité' : 'Poids (kg)'}</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{activeTab === 'nc' ? 'Statut' : 'Unités'}</th>
                  {activeTab === 'realise' && (
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Verdict Qualité</th>
                  )}
                  {activeTab === 'nc' && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Description</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">{activeTab === 'nc' ? 'Signalé par' : 'Inspecteur'}</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {activeTab === 'attente' ? (
                  lotsWaiting.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">Aucun lot en attente de contrôle qualité.</td>
                    </tr>
                  ) : (
                    lotsWaiting.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">{lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.processingDetails?.productName || lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700 dark:text-slate-200">{lot.packagingDetails?.weight || lot.weight} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-600 dark:text-slate-300">{lot.packagingDetails?.quantity || lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenForm(lot, false)}
                              className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
                            >
                              Inspecter le lot
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                ) : activeTab === 'realise' ? (
                  lotsReviewed.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">Aucun rapport de qualité enregistré.</td>
                    </tr>
                  ) : (
                    lotsReviewed.map(lot => (
                      <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">{lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">{lot.processingDetails?.productName || lot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-slate-300">{lot.packagingDetails?.weight || lot.weight} kg</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-slate-300">{lot.packagingDetails?.quantity || lot.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                          {getStatusBadge(lot.qualityStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.qualityDetails?.responsible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex justify-center gap-2">
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
                              Détails
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  nonConformities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">Aucune non-conformité enregistrée.</td>
                    </tr>
                  ) : (
                    nonConformities.map(nc => (
                      <tr key={nc.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-slate-300">{nc.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 w-fit">{nc.productionLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            nc.severity === 'Critique' ? 'bg-red-100 text-red-600' :
                            nc.severity === 'Majeure' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>{nc.severity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            nc.status === 'Ouvert' ? 'bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300' :
                            nc.status === 'En investigation' ? 'bg-blue-100 text-blue-600' :
                            'bg-green-100 text-brand-green'
                          }`}>{nc.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300 max-w-[200px] truncate">{nc.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{nc.reportedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                           <button className="text-gray-500 dark:text-slate-400 hover:text-brand-green font-bold text-xs bg-gray-100 dark:bg-slate-800/50 px-2 py-1 rounded">Gérer</button>
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          {isFormOpen && selectedLot ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-bold text-brand-text dark:text-white border-b pb-2 flex justify-between items-center">
                <span>{isEditing ? 'Modifier Inspection' : 'Inspection Sanitaire'}</span>
                <span className="text-xs font-mono font-bold text-brand-blue">Lot: {selectedLot.elevageLotNumber}</span>
              </h3>

              {/* Quality Checklist Items */}
              <div className="space-y-3">
                {[
                  { key: 'visual', label: '1. Contrôle Visuel', desc: 'Aspect, couleur, texture', icon: <Eye size={14} className="text-brand-blue"/> },
                  { key: 'weight', label: '2. Contrôle du Poids', desc: 'Poids net vs ciblé', icon: <Scale size={14} className="text-brand-blue"/> },
                  { key: 'temp', label: '3. Température', desc: 'Stockage (0-4°C)', icon: <Activity size={14} className="text-brand-blue"/> },
                  { key: 'odor', label: '4. Contrôle Olfactif', desc: 'Absence d\'odeur anormale', icon: <Wind size={14} className="text-brand-blue"/> },
                  { key: 'packaging', label: '5. État Emballage', desc: 'Intégrité, étanchéité', icon: <Package size={14} className="text-brand-blue"/> },
                  { key: 'label', label: '6. Étiquetage', desc: 'Lisibilité, dates (DLC/DDM)', icon: <Tag size={14} className="text-brand-blue"/> }
                ].map((item) => {
                  let currentValue: ControlValue = 'CONFORME';
                  if (item.key === 'visual') currentValue = visualControl;
                  if (item.key === 'weight') currentValue = weightControl;
                  if (item.key === 'temp') currentValue = temperatureControl;
                  if (item.key === 'odor') currentValue = odorControl;
                  if (item.key === 'packaging') currentValue = packagingControl;
                  if (item.key === 'label') currentValue = labelControl;

                  return (
                    <div key={item.key} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-brand-text dark:text-white flex items-center gap-1">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold">{item.desc}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title="Conforme"
                          onClick={() => handleControlChange(item.key as any, 'CONFORME')}
                          className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded transition-all ${
                            currentValue === 'CONFORME' ? 'bg-brand-green text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          type="button"
                          title="À surveiller"
                          onClick={() => handleControlChange(item.key as any, 'A_SURVEILLER')}
                          className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded transition-all ${
                            currentValue === 'A_SURVEILLER' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <AlertTriangle size={14} />
                        </button>
                        <button
                          type="button"
                          title="Non Conforme"
                          onClick={() => handleControlChange(item.key as any, 'NON_CONFORME')}
                          className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded transition-all ${
                            currentValue === 'NON_CONFORME' ? 'bg-brand-red text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          V
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Conformity */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl">
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Verdict Global</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConformity('CONFORME')}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                      conformity === 'CONFORME'
                        ? 'bg-green-50 text-brand-green border-brand-green shadow-sm'
                        : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    CONFORME
                  </button>
                  <button
                    type="button"
                    onClick={() => setConformity('A_SURVEILLER')}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                      conformity === 'A_SURVEILLER'
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-500 shadow-sm'
                        : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <AlertTriangle size={16} />
                    A SURVEILLER
                  </button>
                  <button
                    type="button"
                    onClick={() => setConformity('NON_CONFORME')}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                      conformity === 'NON_CONFORME'
                        ? 'bg-red-50 text-brand-red border-brand-red shadow-sm'
                        : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldAlert size={16} />
                    REFUSÉ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Date Contrôle</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Inspecteur / RQ</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Commentaires / Actions Correctives</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={2}
                  required={conformity === 'NON_CONFORME' || conformity === 'A_SURVEILLER'}
                  placeholder="Justification obligatoire en cas de réserve..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-green"
                />
              </div>

              {conformity === 'CONFORME' && (
                <div className="bg-brand-green/5 border border-brand-green/15 rounded-xl p-3 text-brand-green text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>La validation créera automatiquement une entrée au stock "Produits Finis".</span>
                </div>
              )}

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
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800 font-bold"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : selectedLot && selectedLot.qualityDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-bold text-brand-text dark:text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-brand-blue" />
                  Rapport Qualité
                </h3>
                {getStatusBadge(selectedLot.qualityStatus)}
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-gray-600 dark:text-slate-300 font-medium">Code Lot de Production</span>
                     <span className="font-mono font-bold text-purple-700 bg-purple-100 px-2 rounded">{selectedLot.packagingDetails?.productionLotNumber || selectedLot.elevageLotNumber}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 dark:text-slate-300 font-medium">Produit</span>
                     <span className="font-bold text-brand-text dark:text-white">{selectedLot.processingDetails?.productName || selectedLot.name}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 font-bold block">Date Inspection</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.qualityDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 font-bold block">Inspecteur</span>
                    <span className="font-semibold text-brand-text dark:text-white">{selectedLot.qualityDetails.responsible}</span>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-slate-800" />
                
                <h4 className="font-bold text-gray-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-2">Checklist Complète :</h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Contrôle Visuel', val: selectedLot.qualityDetails.visualControl },
                    { label: 'Contrôle du Poids', val: selectedLot.qualityDetails.weightControl },
                    { label: 'Contrôle de Température', val: selectedLot.qualityDetails.temperatureControl },
                    { label: 'Contrôle Olfactif', val: selectedLot.qualityDetails.odorControl || 'N/A' },
                    { label: 'État Emballage', val: selectedLot.qualityDetails.packagingControl || 'N/A' },
                    { label: 'Étiquetage', val: selectedLot.qualityDetails.labelControl || 'N/A' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-600 dark:text-slate-300 font-medium">{item.label}</span>
                      <span className={`font-bold ${getControlColor(item.val as any)}`}>
                         {item.val.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-100 dark:border-slate-800" />

                <div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-bold block">Commentaires & Verdict</span>
                  <p className="text-gray-600 dark:text-slate-300 text-xs italic bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border mt-1 border-gray-100 dark:border-slate-800">{selectedLot.qualityDetails.comments || 'Aucun commentaire enregistré.'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {canEdit && (
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
              <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold">Sélectionnez un lot dans la liste pour effectuer le contrôle qualité.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControleQualitePage;
