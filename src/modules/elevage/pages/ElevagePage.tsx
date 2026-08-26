// @ts-nocheck
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Warehouse,
  Syringe,
  UtensilsCrossed,
  History,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  Calendar,
  Clock,
  User,
  Scale
} from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { Lot, WorkflowStep, LotStatus, Poulailer, HealthEvent, FeedRecord, TimelineEvent } from '../types';
import { LotStatusBadge } from '../components/LotStatusBadge';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';
import { useAuth } from '../../../core/context/AuthContext';

type TabKey = 'overview' | 'lots' | 'poulaillers' | 'sante' | 'alimentation' | 'historique';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabItem[] = [
  { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: 'lots', label: 'Lots', icon: Layers },
  { key: 'poulaillers', label: 'Poulaillers', icon: Warehouse },
  { key: 'sante', label: 'Santé & Vaccinations', icon: Syringe },
  { key: 'alimentation', label: 'Alimentation', icon: UtensilsCrossed },
  { key: 'historique', label: 'Historique', icon: History },
];

export const ElevagePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const toast = useToast();
  const confirm = useConfirm();

  // === GLOBAL STATE ===
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<Lot[]>([]);
  const [poulaillers, setPoulaillers] = useState<Poulailer[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const [searchLot, setSearchLot] = useState('');
  const [statusFilterLot, setStatusFilterLot] = useState('ALL');
  const [selectedLotForFilter, setSelectedLotForFilter] = useState('ALL');

  const { user } = useAuth();
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Système';

  // === MODAL STATES ===
  // 1. Lot Create/Edit Modal
  const [lotModalOpen, setLotModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [lotForm, setLotForm] = useState({
    name: '',
    chickCount: 1000,
    arrivalDate: new Date().toISOString().split('T')[0],
    poulailerId: '',
    status: LotStatus.ARRIVEE,
  });

  // 2. Lot Details Modal
  const [viewingLot, setViewingLot] = useState<Lot | null>(null);

  // 3. Cycle Modal
  const [cycleModalLot, setCycleModalLot] = useState<Lot | null>(null);
  const [cycleLoading, setCycleLoading] = useState(false);

  // 4. Transfer Modal
  const [transferModalLot, setTransferModalLot] = useState<Lot | null>(null);
  const [transferPoulaillerId, setTransferPoulaillerId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferToProd, setTransferToProd] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  // 5. Poulailler Modal
  const [poulModalOpen, setPoulModalOpen] = useState(false);
  const [editingPoul, setEditingPoul] = useState<Poulailer | null>(null);
  const [poulForm, setPoulForm] = useState({ name: '', capacity: 1000, description: '' });

  // 6. Health / Vaccination Modal
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [editingHealth, setEditingHealth] = useState<HealthEvent | null>(null);
  const [healthForm, setHealthForm] = useState({
    lotId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'VACCINATION' as const,
    productName: '',
    dose: '',
    administrator: currentUserName,
    notes: '',
  });

  // 7. Feed Modal
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [feedForm, setFeedForm] = useState({
    lotId: '',
    date: new Date().toISOString().split('T')[0],
    feedType: 'ALIMENT_DEMARRAGE',
    quantityKg: 50,
    costPerKg: 350,
    notes: '',
  });

  // 8. History Event Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyForm, setHistoryForm] = useState({
    lotId: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    type: 'CYCLE_CHANGE' as const,
    user: currentUserName,
  });

  const [submitting, setSubmitting] = useState(false);

  console.log('[ELEVAGE_PAGE] Composant rendu. loading =', loading);

  // === DATA LOADING ===
  const loadAllData = useCallback(async () => {
    console.log('[ELEVAGE_PAGE] loadAllData START');
    setLoading(true);
    try {
      console.log('[ELEVAGE_PAGE] Appel API...');
      const [lotsData, poulData, wfData, healthData, feedData, historyData] = await Promise.all([
        elevageService.getLots(),
        elevageService.getPoulailers(),
        elevageService.getWorkflow(),
        elevageService.getHealthEvents(),
        elevageService.getFeedRecords(),
        elevageService.getTimelineEvents(),
      ]);
      console.log('[ELEVAGE_PAGE] Réponse API reçue');
      setLots(lotsData);
      setPoulaillers(poulData);
      setWorkflowSteps(wfData);
      setHealthEvents(healthData);
      setFeedRecords(feedData);
      setTimelineEvents(historyData);
    } catch {
      console.error('[ELEVAGE_PAGE] ERREUR API');
      toast.error('Erreur', 'Impossible de synchroniser les données avec le serveur');
    } finally {
      console.log('[ELEVAGE_PAGE] finally exécuté, appel de setLoading(false)');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[ELEVAGE_PAGE] useEffect déclenché');
    loadAllData();
  }, [loadAllData]);

  // === HELPERS ===
  const getLotProgress = (lot: Lot) => {
    const currentIndex = workflowSteps.findIndex((step) => step.id === lot.status);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / workflowSteps.length) * 100);
  };

  const getPoulaillerName = (poulId?: string | number) => {
    if (!poulId) return '—';
    const found = poulaillers.find((p) => String(p.id) === String(poulId));
    return found ? found.name : `Poulailler #${poulId}`;
  };

  // === LOT ACTIONS ===
  const openCreateLot = () => {
    setEditingLot(null);
    setLotForm({
      name: '',
      chickCount: 1000,
      arrivalDate: new Date().toISOString().split('T')[0],
      poulailerId: poulaillers.length > 0 ? String(poulaillers[0].id) : '',
      status: LotStatus.ARRIVEE,
    });
    setLotModalOpen(true);
  };

  const openEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setLotForm({
      name: lot.name,
      chickCount: lot.chickCount,
      arrivalDate: lot.arrivalDate,
      poulailerId: lot.poulailerId ? String(lot.poulailerId) : poulaillers[0]?.id ? String(poulaillers[0].id) : '',
      status: lot.status,
    });
    setLotModalOpen(true);
  };

  const handleLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotForm.name.trim()) {
      toast.error('Validation', 'Le nom du lot est obligatoire');
      return;
    }
    if (!lotForm.chickCount || lotForm.chickCount <= 0) {
      toast.error('Validation', 'Veuillez saisir un effectif valide supérieur à 0');
      return;
    }
    if (!lotForm.arrivalDate) {
      toast.error('Validation', 'La date d\'arrivée est obligatoire');
      return;
    }
    setSubmitting(true);
    try {
      if (editingLot) {
        await elevageService.updateLot(editingLot.id, {
          name: lotForm.name.trim(),
          chickCount: Number(lotForm.chickCount),
          arrivalDate: lotForm.arrivalDate,
          poulailerId: lotForm.poulailerId || undefined,
          status: lotForm.status,
        });
        toast.success('Succès', 'Lot mis à jour avec succès');
      } else {
        await elevageService.createLot({
          name: lotForm.name.trim(),
          chickCount: Number(lotForm.chickCount),
          arrivalDate: lotForm.arrivalDate,
          poulailerId: lotForm.poulailerId || undefined,
          status: lotForm.status,
        });
        toast.success('Succès', 'Nouveau lot créé avec succès');
      }
      setLotModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer le lot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLot = async (lot: Lot) => {
    const ok = await confirm.ask({
      title: 'Supprimer le lot ?',
      message: `Confirmez la suppression définitive du lot ${lot.name} (#${lot.lotNumber}).`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      const deleted = await elevageService.deleteLot(lot.id);
      if (deleted) {
        toast.success('Succès', 'Lot supprimé avec succès');
        await loadAllData();
      }
    } catch {
      toast.error('Erreur', 'Impossible de supprimer ce lot');
    }
  };

  // === CYCLE ACTION ===
  const handleAdvanceCycle = async (lot: Lot) => {
    setCycleLoading(true);
    try {
      const updated = await elevageService.nextStep(lot.id);
      if (updated) {
        toast.success('Cycle mis à jour', `Le lot est passé à l'étape : ${updated.status}`);
        setCycleModalLot(updated);
        await loadAllData();
      }
    } catch {
      toast.error('Erreur', 'Impossible de faire avancer le cycle');
    } finally {
      setCycleLoading(false);
    }
  };

  // === TRANSFER ACTION ===
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalLot) return;
    setTransferLoading(true);
    try {
      if (transferToProd) {
        const res = await elevageService.transferToProduction(transferModalLot.id);
        if (res) {
          toast.success('Transfert réussi', 'Le lot a été transféré avec succès vers la Production industrielle.');
          setTransferModalLot(null);
          await loadAllData();
        }
      } else {
        if (!transferPoulaillerId) {
          toast.error('Validation', 'Veuillez sélectionner un poulailler de destination');
          setTransferLoading(false);
          return;
        }
        await elevageService.updateLot(transferModalLot.id, {
          poulailerId: transferPoulaillerId,
        });
        toast.success('Transfert de bâtiment', 'Le lot a été réassigné au nouveau poulailler.');
        setTransferModalLot(null);
        await loadAllData();
      }
    } catch {
      toast.error('Échec', 'Impossible d\'effectuer le transfert');
    } finally {
      setTransferLoading(false);
    }
  };

  // === POULAILLER ACTIONS ===
  const openCreatePoulailler = () => {
    setEditingPoul(null);
    setPoulForm({ name: '', capacity: 1000, description: '' });
    setPoulModalOpen(true);
  };

  const openEditPoulailler = (p: Poulailer) => {
    setEditingPoul(p);
    setPoulForm({ name: p.name, capacity: p.capacity, description: p.description || '' });
    setPoulModalOpen(true);
  };

  const handlePoulSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poulForm.name.trim()) {
      toast.error('Validation', 'Le nom du poulailler est requis');
      return;
    }
    if (!poulForm.capacity || poulForm.capacity <= 0) {
      toast.error('Validation', 'La capacité doit être supérieure à 0');
      return;
    }
    setSubmitting(true);
    try {
      if (editingPoul) {
        await elevageService.updatePoulailler(editingPoul.id, {
          name: poulForm.name.trim(),
          capacity: Number(poulForm.capacity),
          description: poulForm.description,
        });
        toast.success('Succès', 'Poulailler mis à jour');
      } else {
        await elevageService.createPoulailler({
          name: poulForm.name.trim(),
          capacity: Number(poulForm.capacity),
          description: poulForm.description,
        });
        toast.success('Succès', 'Poulailler créé');
      }
      setPoulModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer le poulailler');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePoulailler = async (p: Poulailer) => {
    const ok = await confirm.ask({
      title: 'Supprimer ce poulailler ?',
      message: `Confirmez la suppression du poulailler ${p.name}.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deletePoulailler(p.id);
      toast.success('Succès', 'Poulailler supprimé');
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible de supprimer ce poulailler');
    }
  };

  // === SANTE ACTIONS ===
  const openCreateHealth = () => {
    setEditingHealth(null);
    setHealthForm({
      lotId: lots.length > 0 ? String(lots[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      type: 'VACCINATION',
      productName: '',
      dose: '',
      administrator: currentUserName,
      notes: '',
    });
    setHealthModalOpen(true);
  };

  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.productName.trim()) {
      toast.error('Validation', 'Le nom du vaccin/produit est obligatoire');
      return;
    }
    if (!healthForm.date) {
      toast.error('Validation', 'La date de vaccination est requise');
      return;
    }
    if (!healthForm.lotId) {
      toast.error('Validation', 'Veuillez sélectionner un lot');
      return;
    }
    setSubmitting(true);
    try {
      if (editingHealth) {
        await elevageService.updateHealthEvent(editingHealth.id, {
          lotId: healthForm.lotId,
          vaccinationDate: healthForm.date,
          name: healthForm.productName.trim(),
          description: healthForm.notes || '',
        });
        toast.success('Succès', 'Soin mis à jour');
      } else {
        await elevageService.createHealthEvent({
          lotId: healthForm.lotId,
          vaccinationDate: healthForm.date,
          name: healthForm.productName.trim(),
          description: healthForm.notes || '',
        });
        toast.success('Succès', 'Vaccination enregistrée');
      }
      setHealthModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer le soin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHealth = async (h: HealthEvent) => {
    const ok = await confirm.ask({
      title: 'Supprimer cet enregistrement de soin ?',
      message: `Supprimer ${h.productName} du ${h.date}.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deleteHealthEvent(h.id);
      toast.success('Succès', 'Enregistrement supprimé');
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible de supprimer');
    }
  };

  // === ALIMENTATION ACTIONS ===
  const openCreateFeed = () => {
    setFeedForm({
      lotId: lots[0]?.id ? String(lots[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      feedType: 'ALIMENT_DEMARRAGE',
      quantityKg: 100,
      costPerKg: 350,
      notes: '',
    });
    setFeedModalOpen(true);
  };

  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await elevageService.createFeedRecord({
        lotId: feedForm.lotId,
        date: feedForm.date,
        feedType: feedForm.feedType,
        quantityKg: Number(feedForm.quantityKg),
        costPerKg: Number(feedForm.costPerKg),
        notes: feedForm.notes,
      });
      toast.success('Succès', 'Alimentation enregistrée');
      setFeedModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer l\'alimentation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeed = async (f: FeedRecord) => {
    const ok = await confirm.ask({
      title: 'Supprimer cet enregistrement d\'alimentation ?',
      message: `Supprimer ${f.quantityKg} kg du ${f.date}.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deleteFeedRecord(f.id);
      toast.success('Succès', 'Alimentation supprimée');
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible de supprimer');
    }
  };

  // === HISTORIQUE ACTIONS ===
  const openCreateHistory = () => {
    setHistoryForm({
      lotId: lots[0]?.id ? String(lots[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      type: 'CYCLE_CHANGE',
      user: currentUserName,
    });
    setHistoryModalOpen(true);
  };

  const handleHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyForm.title.trim()) {
      toast.error('Validation', 'Le titre de l\'événement est obligatoire');
      return;
    }
    setSubmitting(true);
    try {
      await elevageService.createHistoryEvent({
        lotId: historyForm.lotId,
        date: historyForm.date,
        title: historyForm.title.trim(),
        description: historyForm.description,
        type: historyForm.type,
        user: historyForm.user,
      });
      toast.success('Succès', 'Événement ajouté au journal');
      setHistoryModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer l\'événement');
    } finally {
      setSubmitting(false);
    }
  };

  // === FILTERED DATA ===
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const q = searchLot.toLowerCase();
      const matchQuery =
        lot.name.toLowerCase().includes(q) ||
        lot.lotNumber.toLowerCase().includes(q) ||
        (lot.breed && lot.breed.toLowerCase().includes(q));
      const matchStatus = statusFilterLot === 'ALL' || lot.status === statusFilterLot;
      return matchQuery && matchStatus;
    });
  }, [lots, searchLot, statusFilterLot]);

  const filteredHealth = useMemo(() => {
    if (selectedLotForFilter === 'ALL') return healthEvents;
    return healthEvents.filter((h) => String(h.lotId) === String(selectedLotForFilter));
  }, [healthEvents, selectedLotForFilter]);

  const filteredFeed = useMemo(() => {
    if (selectedLotForFilter === 'ALL') return feedRecords;
    return feedRecords.filter((f) => String(f.lotId) === String(selectedLotForFilter));
  }, [feedRecords, selectedLotForFilter]);

  // Overall Stats
  const totalChicks = lots.reduce((acc, l) => acc + (l.currentCount || l.chickCount || 0), 0);
  const activePoulaillers = poulaillers.length;
  const totalCapacity = poulaillers.reduce((acc, p) => acc + (p.capacity || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((totalChicks / totalCapacity) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Gestion de l'Élevage</h1>
              <p className="text-slate-400 text-sm">
                Suivi avicole complet : Lots, Bâtiments, Cycles, Vaccinations, Alimentation & Traçabilité
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#42B649] text-white shadow-md'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.key === 'lots' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {lots.length}
                </span>
              )}
              {tab.key === 'poulaillers' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {poulaillers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: VUE D'ENSEMBLE                                         */}
      {/* ============================================================ */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Lots en élevage</span>
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
                  <Layers size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-100">{lots.length}</p>
              <p className="text-xs text-slate-500 mt-1">Actuellement en cycle</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Effectif total</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-100">{totalChicks.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-slate-500 mt-1">Sujets vivants comptabilisés</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Poulaillers actifs</span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Warehouse size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-400">{activePoulaillers}</p>
              <p className="text-xs text-slate-500 mt-1">Capacité : {totalCapacity.toLocaleString('fr-FR')} places</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Taux d'occupation</span>
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-400">{occupancyRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Densité moyenne globale</p>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Lots Summary */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100">Derniers Lots Actifs</h3>
                <button
                  onClick={() => setActiveTab('lots')}
                  className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1"
                >
                  <span>Tous les lots</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              {lots.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Aucun lot en cours.</p>
              ) : (
                <div className="space-y-3">
                  {lots.slice(0, 4).map((lot) => {
                    const progress = getLotProgress(lot);
                    return (
                      <div
                        key={lot.id}
                        className="p-3.5 bg-slate-800/50 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-200 text-sm">
                            {lot.name} <span className="font-mono text-xs text-slate-500 font-normal">#{lot.lotNumber}</span>
                          </p>
                          <p className="text-xs text-slate-400">
                            {lot.chickCount.toLocaleString()} sujets • {getPoulaillerName(lot.poulailerId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <LotStatusBadge status={lot.status} />
                          <button
                            onClick={() => {
                              setViewingLot(lot);
                            }}
                            className="p-1.5 text-blue-400 hover:bg-slate-700 rounded-lg transition-all"
                            title="Consulter"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Health & Sanitary Alerts */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100">Dernières Opérations Sanitaires</h3>
                <button
                  onClick={() => setActiveTab('sante')}
                  className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1"
                >
                  <span>Carnet de santé</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              {healthEvents.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Aucun soin enregistré.</p>
              ) : (
                <div className="space-y-3">
                  {healthEvents.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 bg-slate-800/50 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center">
                          <Syringe size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{h.productName}</p>
                          <p className="text-xs text-slate-400">
                            Lot #{h.lotId} • {h.date} {h.dose ? `• ${h.dose}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
                        {h.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LOTS                                                   */}
      {/* ============================================================ */}
      {currentTab === 'lots' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Lots d'Élevage</h2>
              <p className="text-slate-400 text-sm">
                {filteredLots.length} sur {lots.length} lot(s)
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateLot}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Nouveau lot</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher un lot par nom, référence..."
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm text-slate-100 placeholder-slate-500"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={statusFilterLot}
                onChange={(e) => setStatusFilterLot(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm appearance-none text-slate-200 font-medium"
              >
                <option value="ALL">Tous les statuts</option>
                <option value={LotStatus.ARRIVEE}>Arrivée</option>
                <option value={LotStatus.DEMARRAGE}>Démarrage</option>
                <option value={LotStatus.CROISSANCE}>Croissance</option>
                <option value={LotStatus.FINITION}>Finition</option>
                <option value={LotStatus.EN_ELEVAGE}>En élevage</option>
                <option value={LotStatus.TRANSFERE}>Transféré</option>
              </select>
            </div>
          </div>

          {/* Lots Table */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Chargement des lots...</div>
          ) : filteredLots.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl">
              <Layers size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-300 font-bold">Aucun lot d'élevage trouvé</p>
              <p className="text-gray-500 text-sm mt-1">Cliquez sur "Nouveau lot" pour créer un premier lot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Lot</th>
                    <th className="py-3 px-4">Poulailler</th>
                    <th className="py-3 px-4">Effectif</th>
                    <th className="py-3 px-4">Date d'arrivée</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredLots.map((lot) => {
                    const progress = getLotProgress(lot);
                    return (
                      <tr key={lot.id} className="hover:bg-slate-800/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{lot.name}</p>
                            <p className="font-mono text-xs text-blue-400 font-bold">#{lot.lotNumber}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-300 font-medium">
                          {getPoulaillerName(lot.poulailerId)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-bold text-slate-200">
                          {lot.chickCount.toLocaleString('fr-FR')}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-400">{lot.arrivalDate}</td>
                        <td className="py-3.5 px-4">
                          <LotStatusBadge status={lot.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-green rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 font-bold min-w-[28px]">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1. Voir */}
                            <button
                              onClick={() => setViewingLot(lot)}
                              className="px-2.5 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors flex items-center gap-1"
                              title="Voir les détails complets"
                            >
                              <Eye size={14} />
                              <span>Voir</span>
                            </button>

                            {/* 2. Modifier */}
                            <button
                              onClick={() => openEditLot(lot)}
                              className="px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors flex items-center gap-1"
                              title="Modifier"
                            >
                              <Edit size={14} />
                              <span>Modifier</span>
                            </button>

                            {/* 3. Cycle */}
                            <button
                              onClick={() => setCycleModalLot(lot)}
                              className="px-2.5 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors flex items-center gap-1"
                              title="Cycle d'élevage"
                            >
                              <Clock size={14} />
                              <span>Cycle</span>
                            </button>

                            {/* 4. Transférer */}
                            <button
                              onClick={() => {
                                setTransferModalLot(lot);
                                setTransferPoulaillerId(lot.poulailerId ? String(lot.poulailerId) : '');
                                setTransferToProd(false);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors flex items-center gap-1"
                              title="Transférer"
                            >
                              <ArrowRightLeft size={14} />
                              <span>Transférer</span>
                            </button>

                            {/* 5. Supprimer */}
                            <button
                              onClick={() => handleDeleteLot(lot)}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: POULAILLERS                                            */}
      {/* ============================================================ */}
      {currentTab === 'poulaillers' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Bâtiments & Poulaillers</h2>
                <p className="text-slate-400 text-sm">Gestion des structures d'hébergement et des capacités</p>
              </div>
              <button
                type="button"
                onClick={openCreatePoulailler}
                className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
              >
                <Plus size={18} />
                <span>Nouveau poulailler</span>
              </button>
            </div>

            {poulaillers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun poulailler enregistré.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {poulaillers.map((p) => {
                  const assignedLots = lots.filter((l) => String(l.poulailerId) === String(p.id));
                  const totalOccupants = assignedLots.reduce((acc, l) => acc + (l.chickCount || 0), 0);
                  const rate = p.capacity > 0 ? Math.min(100, Math.round((totalOccupants / p.capacity) * 100)) : 0;

                  return (
                    <div
                      key={p.id}
                      className="border border-slate-700 rounded-2xl p-5 hover:border-brand-green/50 transition-colors bg-slate-950 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                              <Warehouse size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-200">{p.name}</h3>
                              <p className="text-xs text-slate-500 font-mono">ID #{p.id}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rate > 90
                                ? 'bg-red-500/20 text-red-400'
                                : rate > 0
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {rate > 0 ? `${rate}% occupé` : 'Disponible'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm my-4">
                          <div className="flex justify-between text-slate-400">
                            <span>Capacité max :</span>
                            <span className="font-bold text-slate-200">{p.capacity.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Lots hébergés :</span>
                            <span className="font-bold text-blue-400">{assignedLots.length}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Effectif total :</span>
                            <span className="font-bold text-brand-green">{totalOccupants.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditPoulailler(p)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeletePoulailler(p)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: VACCINATIONS & SANTE                                   */}
      {/* ============================================================ */}
      {currentTab === 'sante' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Santé & Traitements</h2>
              <p className="text-slate-400 text-sm">Registre des vaccinations, traitements et interventions sanitaires</p>
            </div>
            <button
              type="button"
              onClick={openCreateHealth}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Nouvelle vaccination</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">Filtrer par lot :</span>
            <select
              value={selectedLotForFilter}
              onChange={(e) => setSelectedLotForFilter(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="ALL">Tous les lots</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} (#{l.lotNumber})
                </option>
              ))}
            </select>
          </div>

          {filteredHealth.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun enregistrement sanitaire.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Lot</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Produit / Vaccin</th>
                    <th className="py-3 px-4">Dose</th>
                    <th className="py-3 px-4">Intervenant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredHealth.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-400">{h.date}</td>
                      <td className="py-3 px-4 text-sm font-bold text-blue-400">Lot #{h.lotId}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-green/20 text-brand-green">
                          {h.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-200">{h.productName}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{h.dose || '—'}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{h.administrator || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteHealth(h)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: ALIMENTATION                                           */}
      {/* ============================================================ */}
      {currentTab === 'alimentation' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Suivi de l'Alimentation</h2>
              <p className="text-slate-400 text-sm">Consommation journalière d'aliments et rations par lot</p>
            </div>
            <button
              type="button"
              onClick={openCreateFeed}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Nouvelle alimentation</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">Filtrer par lot :</span>
            <select
              value={selectedLotForFilter}
              onChange={(e) => setSelectedLotForFilter(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              <option value="ALL">Tous les lots</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} (#{l.lotNumber})
                </option>
              ))}
            </select>
          </div>

          {filteredFeed.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun enregistrement d'alimentation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Lot</th>
                    <th className="py-3 px-4">Type d'Aliment</th>
                    <th className="py-3 px-4">Quantité (kg)</th>
                    <th className="py-3 px-4">Coût total</th>
                    <th className="py-3 px-4">Observations</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredFeed.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-400">{f.date}</td>
                      <td className="py-3 px-4 text-sm font-bold text-blue-400">Lot #{f.lotId}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-200">{f.feedType}</td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-400">{f.quantityKg} kg</td>
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {((f.quantityKg || 0) * (f.costPerKg || 0)).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">{f.notes || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteFeed(f)}
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: HISTORIQUE                                             */}
      {/* ============================================================ */}
      {currentTab === 'historique' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Journal des Événements & Traçabilité</h2>
              <p className="text-slate-400 text-sm">Chronologie des actions et jalons de l'élevage</p>
            </div>
            <button
              type="button"
              onClick={openCreateHistory}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Ajouter événement</span>
            </button>
          </div>

          {timelineEvents.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun événement répertorié.</p>
          ) : (
            <div className="relative pl-6 border-l-2 border-brand-green/30 space-y-6 my-4">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-green border-4 border-slate-900 shadow-sm" />
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 text-sm">{evt.title}</span>
                      <span className="text-xs text-slate-500 font-mono">{evt.date}</span>
                    </div>
                    <p className="text-sm text-slate-400">{evt.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Lot #{evt.lotId}</span>
                      <span>•</span>
                      <span>Opérateur : {evt.user || 'Système'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CRÉATION / MODIFICATION DE LOT                      */}
      {/* ============================================================ */}
      <Modal
        open={lotModalOpen}
        onClose={() => setLotModalOpen(false)}
        title={editingLot ? `Modifier le lot #${editingLot.lotNumber}` : "Nouveau lot d'élevage"}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLotModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="lot-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : editingLot ? 'Mettre à jour' : 'Créer le lot'}
            </button>
          </div>
        }
      >
        <form id="lot-form" onSubmit={handleLotSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Désignation / Référence <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Lot Poussins Cobb 500"
              value={lotForm.name}
              onChange={(e) => setLotForm({ ...lotForm, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Poulailler assigné</label>
              <select
                value={lotForm.poulailerId}
                onChange={(e) => setLotForm({ ...lotForm, poulailerId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                <option value="">Sélectionner un bâtiment ▼</option>
                {poulaillers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Capacité {p.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Effectif (Sujets) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={lotForm.chickCount}
                onChange={(e) => setLotForm({ ...lotForm, chickCount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date d'entrée / Arrivée</label>
              <input
                type="date"
                value={lotForm.arrivalDate}
                onChange={(e) => setLotForm({ ...lotForm, arrivalDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Statut initial</label>
              <select
                value={lotForm.status}
                onChange={(e) => setLotForm({ ...lotForm, status: e.target.value as LotStatus })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                <option value={LotStatus.ARRIVEE}>Arrivée</option>
                <option value={LotStatus.DEMARRAGE}>Démarrage</option>
                <option value={LotStatus.CROISSANCE}>Croissance</option>
                <option value={LotStatus.FINITION}>Finition</option>
                <option value={LotStatus.EN_ELEVAGE}>En élevage</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: DÉTAILS COMPLETS DU LOT                             */}
      {/* ============================================================ */}
      <Modal
        open={viewingLot !== null}
        onClose={() => setViewingLot(null)}
        title={viewingLot ? `Détails du Lot ${viewingLot.name} (#${viewingLot.lotNumber})` : 'Détails du lot'}
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-gray-400">ID Backend : {viewingLot?.id}</span>
            <button
              onClick={() => setViewingLot(null)}
              className="px-5 py-2 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        }
      >
        {viewingLot && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase">Poulailler</p>
                <p className="font-bold text-brand-text">{getPoulaillerName(viewingLot.poulailerId)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Effectif initial</p>
                <p className="font-bold text-brand-text">{viewingLot.chickCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date d'arrivée</p>
                <p className="font-bold text-brand-text">{viewingLot.arrivalDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Statut</p>
                <LotStatusBadge status={viewingLot.status} />
              </div>
            </div>

            {/* Workflow Progress */}
            <div>
              <h4 className="font-bold text-brand-text text-sm mb-3">Progression du Cycle d'Élevage</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-bold">
                {[
                  { step: 'Démarrage', key: LotStatus.DEMARRAGE },
                  { step: 'Croissance', key: LotStatus.CROISSANCE },
                  { step: 'Finition', key: LotStatus.FINITION },
                  { step: 'Prêt abattage', key: LotStatus.PRET_ABATTAGE },
                ].map((item, idx) => (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border ${
                      viewingLot.status === item.key
                        ? 'bg-brand-green text-white border-brand-green shadow-sm'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    <p className="text-xs opacity-75">Étape {idx + 1}</p>
                    <p className="font-bold text-sm mt-0.5">{item.step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: CYCLE D'ÉLEVAGE                                     */}
      {/* ============================================================ */}
      <Modal
        open={cycleModalLot !== null}
        onClose={() => setCycleModalLot(null)}
        title="Cycle d'Élevage"
        size="md"
        footer={
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => setCycleModalLot(null)}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Fermer
            </button>
            {cycleModalLot && (
              <button
                onClick={() => handleAdvanceCycle(cycleModalLot)}
                disabled={cycleLoading}
                className="px-5 py-2 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span>Passer à l'étape suivante</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        }
      >
        {cycleModalLot && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <p className="font-bold text-purple-900">
                Lot : {cycleModalLot.name} (#{cycleModalLot.lotNumber})
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Effectif : {cycleModalLot.chickCount.toLocaleString()} sujets • Poulailler :{' '}
                {getPoulaillerName(cycleModalLot.poulailerId)}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: '1. Démarrage', desc: 'Période initiale (0 à 14 jours)', status: LotStatus.DEMARRAGE },
                { title: '2. Croissance', desc: 'Développement musculaire et squelettique (15 à 35 jours)', status: LotStatus.CROISSANCE },
                { title: '3. Fin d\'élevage / Finition', desc: 'Gain de poids final et préparation commerciale (36 à 45 jours)', status: LotStatus.FINITION },
                { title: '4. Transfert / Abattage', desc: 'Sortie d\'élevage et transfert vers l\'atelier d\'abattage', status: LotStatus.PRET_ABATTAGE },
              ].map((step, i) => {
                const isCurrent = cycleModalLot.status === step.status;
                return (
                  <div
                    key={step.title}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      isCurrent
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{step.title}</p>
                      <p className={`text-xs ${isCurrent ? 'text-purple-100' : 'text-gray-500'}`}>{step.desc}</p>
                    </div>
                    {isCurrent && <CheckCircle2 size={20} className="text-white" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: TRANSFERT DU LOT                                    */}
      {/* ============================================================ */}
      <Modal
        open={transferModalLot !== null}
        onClose={() => setTransferModalLot(null)}
        title="Transférer le lot"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTransferModalLot(null)}
              disabled={transferLoading}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="transfer-form"
              disabled={transferLoading}
              className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {transferLoading ? 'Transfert...' : 'Confirmer le transfert'}
            </button>
          </div>
        }
      >
        {transferModalLot && (
          <form id="transfer-form" onSubmit={handleExecuteTransfer} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="font-bold text-brand-text">
                Lot : {transferModalLot.name} (#{transferModalLot.lotNumber})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Poulailler actuel : {getPoulaillerName(transferModalLot.poulailerId)}
              </p>
              <p className="text-xs text-gray-500">
                Effectif total : {transferModalLot.chickCount.toLocaleString()} sujets
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Type de transfert</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransferToProd(false)}
                  className={`p-3 rounded-xl font-bold text-xs border text-left ${
                    !transferToProd
                      ? 'bg-brand-green/10 border-brand-green text-brand-green'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Changement de Poulailler
                </button>
                <button
                  type="button"
                  onClick={() => setTransferToProd(true)}
                  className={`p-3 rounded-xl font-bold text-xs border text-left ${
                    transferToProd
                      ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Envoi vers Production (Abattage)
                </button>
              </div>
            </div>

            {!transferToProd ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nouveau poulailler de destination <span className="text-brand-red">*</span>
                </label>
                <select
                  value={transferPoulaillerId}
                  onChange={(e) => setTransferPoulaillerId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
                >
                  <option value="">Sélectionner un bâtiment ▼</option>
                  {poulaillers
                    .filter((p) => String(p.id) !== String(transferModalLot.poulailerId))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Capacité {p.capacity})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="bg-brand-blue/5 border-l-4 border-brand-blue p-3 rounded-xl text-xs text-brand-text">
                Ce lot sera transmis à l'atelier de production (Abattoir) sous statut prêt pour la réception.
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Motif / Observations</label>
              <textarea
                rows={2}
                placeholder="Optionnel : justification du transfert..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: POULAILLER FORM                                     */}
      {/* ============================================================ */}
      <Modal
        open={poulModalOpen}
        onClose={() => setPoulModalOpen(false)}
        title={editingPoul ? `Modifier le poulailler #${editingPoul.id}` : 'Nouveau poulailler'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPoulModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="poul-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : editingPoul ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        }
      >
        <form id="poul-form" onSubmit={handlePoulSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du bâtiment <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Poulailler Nord A1"
              value={poulForm.name}
              onChange={(e) => setPoulForm({ ...poulForm, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Capacité maximale (places) <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={poulForm.capacity}
              onChange={(e) => setPoulForm({ ...poulForm, capacity: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description / Emplacement</label>
            <input
              type="text"
              placeholder="Ex: Zone Ouest, ventilation dynamique"
              value={poulForm.description}
              onChange={(e) => setPoulForm({ ...poulForm, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: HEALTH FORM                                         */}
      {/* ============================================================ */}
      <Modal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title="Nouvelle Vaccination / Soin"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHealthModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="health-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="health-form" onSubmit={handleHealthSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lot concerné</label>
              <select
                value={healthForm.lotId}
                onChange={(e) => setHealthForm({ ...healthForm, lotId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (#{l.lotNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={healthForm.date}
                onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du Vaccin / Produit <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Newcastle / Gumboro B1"
              value={healthForm.productName}
              onChange={(e) => setHealthForm({ ...healthForm, productName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dose</label>
              <input
                type="text"
                placeholder="Ex: 1 dose/sujet (eau de boisson)"
                value={healthForm.dose}
                onChange={(e) => setHealthForm({ ...healthForm, dose: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Intervenant / Responsable</label>
              <input
                type="text"
                value={healthForm.administrator}
                onChange={(e) => setHealthForm({ ...healthForm, administrator: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 7: FEED FORM                                           */}
      {/* ============================================================ */}
      <Modal
        open={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        title="Nouvelle Alimentation"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFeedModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="feed-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="feed-form" onSubmit={handleFeedSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lot</label>
              <select
                value={feedForm.lotId}
                onChange={(e) => setFeedForm({ ...feedForm, lotId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (#{l.lotNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={feedForm.date}
                onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type d'Aliment</label>
              <select
                value={feedForm.feedType}
                onChange={(e) => setFeedForm({ ...feedForm, feedType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                <option value="ALIMENT_DEMARRAGE">Aliment Démarrage</option>
                <option value="ALIMENT_CROISSANCE">Aliment Croissance</option>
                <option value="ALIMENT_FINITION">Aliment Finition</option>
                <option value="COMPLEMENT_MINERAL">Complément minéral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantité (kg)</label>
              <input
                type="number"
                required
                min={1}
                value={feedForm.quantityKg}
                onChange={(e) => setFeedForm({ ...feedForm, quantityKg: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 8: HISTORY FORM                                        */}
      {/* ============================================================ */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Ajouter un Événement au Journal"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="history-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        }
      >
        <form id="history-form" onSubmit={handleHistorySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lot</label>
              <select
                value={historyForm.lotId}
                onChange={(e) => setHistoryForm({ ...historyForm, lotId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (#{l.lotNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={historyForm.date}
                onChange={(e) => setHistoryForm({ ...historyForm, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Titre de l'événement <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Pesée de contrôle S4"
              value={historyForm.title}
              onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description / Détails</label>
            <textarea
              rows={3}
              placeholder="Détails de l'événement..."
              value={historyForm.description}
              onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ElevagePage;
