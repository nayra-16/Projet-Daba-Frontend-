import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Activity,
  Package,
  ArrowRight,
  Truck,
  Plus,
  Trash2,
  RefreshCw,
  Scale,
  Syringe,
  UtensilsCrossed,
} from 'lucide-react';
import { elevageService } from '../services/elevageService';
import {
  Lot,
  Poulailer,
  HealthEvent,
  FeedRecord,
  TimelineEvent,
  WorkflowStep,
  HistoryEvent,
  Animal,
  WeightRecord,
  LotStatus,
} from '../types';
import { LotStatusBadge } from '../components/LotStatusBadge';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const LotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lot, setLot] = useState<Lot | null>(null);
  const [poulailers, setPoulailers] = useState<Poulailer[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflow' | 'general' | 'health' | 'feed' | 'weight' | 'history'>('workflow');
  const [nextStepLoading, setNextStepLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  // Sub-resource Modals
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [animalModalOpen, setAnimalModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [submittingModal, setSubmittingModal] = useState(false);

  // Forms for sub-resources
  const [healthForm, setHealthForm] = useState({
    name: '',
    vaccinationDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [feedForm, setFeedForm] = useState({
    feedDate: new Date().toISOString().split('T')[0],
    feedType: 'Aliment de croissance',
    quantity: 50,
  });

  const [animalForm, setAnimalForm] = useState({
    type: 'Poulet de chair',
    tag: '',
    sexe: 'M',
    weight: 1.8,
  });

  const [historyForm, setHistoryForm] = useState({
    action: '',
    eventDate: new Date().toISOString().split('T')[0],
    details: '',
  });

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [lotData, poulailersData, healthData, feedData, timelineData, workflowData, historyData, animalsData, weightData] =
        await Promise.all([
          elevageService.getLotById(id),
          elevageService.getPoulailers(),
          elevageService.getHealthEvents(id),
          elevageService.getFeedRecords(id),
          elevageService.getTimelineEvents(),
          elevageService.getWorkflow(),
          elevageService.getHistory(id),
          elevageService.getAnimals(id),
          elevageService.getWeightRecords(id),
        ]);
      setLot(lotData || null);
      setPoulailers(poulailersData);
      setHealthEvents(healthData);
      setFeedRecords(feedData);
      setTimelineEvents(timelineData);
      setWorkflowSteps(workflowData);
      setHistoryEvents(historyData);
      setAnimals(animalsData);
      setWeightRecords(weightData);
    } catch {
      toast.error('Erreur', 'Impossible de charger les données du lot');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNextStep = async () => {
    if (!lot || !id) return;
    setNextStepLoading(true);
    try {
      const updatedLot = await elevageService.nextStep(id);
      if (updatedLot) {
        setLot(updatedLot);
        toast.success('Workflow', `Lot passé à l'étape suivante : ${updatedLot.status}`);
        const newHistory = await elevageService.getHistory(id);
        setHistoryEvents(newHistory);
      } else {
        toast.error('Validation', 'Les conditions requises pour passer à l\'étape suivante ne sont pas remplies');
      }
    } catch {
      toast.error('Erreur', 'Échec du passage à l\'étape suivante');
    } finally {
      setNextStepLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!lot || !id) return;
    const ok = await confirm.ask({
      title: 'Transférer en Production',
      message: `Voulez-vous transférer le lot ${lot.name} (#${lot.lotNumber}) vers le module Production ?`,
      confirmLabel: 'Confirmer le transfert',
      danger: false,
    });
    if (!ok) return;

    setTransferLoading(true);
    try {
      const result = await elevageService.transferToProduction(id);
      if (result) {
        setLot(result.elevageLot);
        toast.success('Transfert réussi', 'Le lot a été transféré avec succès vers la Production');
        const newHistory = await elevageService.getHistory(id);
        setHistoryEvents(newHistory);
      }
    } catch {
      toast.error('Erreur', 'Échec du transfert vers la production');
    } finally {
      setTransferLoading(false);
    }
  };

  // Sub-resource handlers
  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !healthForm.name.trim()) return;
    setSubmittingModal(true);
    try {
      await elevageService.createHealthEvent({
        name: healthForm.name,
        vaccinationDate: healthForm.vaccinationDate,
        lotId: id,
        description: healthForm.description,
      });
      toast.success('Succès', 'Vaccination enregistrée');
      setHealthModalOpen(false);
      setHealthForm({ name: '', vaccinationDate: new Date().toISOString().split('T')[0], description: '' });
      const updated = await elevageService.getHealthEvents(id);
      setHealthEvents(updated);
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer la vaccination');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleDeleteHealth = async (eventId: string) => {
    const ok = await confirm.ask({
      title: 'Supprimer la vaccination',
      message: 'Êtes-vous sûr de vouloir supprimer cet événement sanitaire ?',
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deleteHealthEvent(eventId);
      toast.success('Succès', 'Vaccination supprimée');
      if (id) {
        const updated = await elevageService.getHealthEvents(id);
        setHealthEvents(updated);
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression');
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || Number(feedForm.quantity) <= 0) return;
    setSubmittingModal(true);
    try {
      await elevageService.createFeedRecord({
        feedDate: feedForm.feedDate,
        feedType: feedForm.feedType,
        quantity: Number(feedForm.quantity),
        lotId: id,
      });
      toast.success('Succès', 'Distribution d\'aliment enregistrée');
      setFeedModalOpen(false);
      setFeedForm({ feedDate: new Date().toISOString().split('T')[0], feedType: 'Aliment de croissance', quantity: 50 });
      const updated = await elevageService.getFeedRecords(id);
      setFeedRecords(updated);
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer la distribution');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleDeleteFeed = async (recordId: string) => {
    const ok = await confirm.ask({
      title: 'Supprimer la distribution',
      message: 'Êtes-vous sûr de vouloir supprimer cette distribution d\'aliment ?',
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deleteFeedRecord(recordId);
      toast.success('Succès', 'Distribution supprimée');
      if (id) {
        const updated = await elevageService.getFeedRecords(id);
        setFeedRecords(updated);
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression');
    }
  };

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingModal(true);
    try {
      await elevageService.createAnimal({
        type: animalForm.type,
        lotId: id,
        tag: animalForm.tag || undefined,
        sexe: animalForm.sexe,
        weight: Number(animalForm.weight),
        birthDate: lot?.arrivalDate,
      });
      toast.success('Succès', 'Animal / Pesée enregistré(e)');
      setAnimalModalOpen(false);
      setAnimalForm({ type: 'Poulet de chair', tag: '', sexe: 'M', weight: 1.8 });
      const [updatedAnimals, updatedWeights] = await Promise.all([
        elevageService.getAnimals(id),
        elevageService.getWeightRecords(id),
      ]);
      setAnimals(updatedAnimals);
      setWeightRecords(updatedWeights);
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer l\'animal');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleDeleteAnimal = async (animalId: string) => {
    const ok = await confirm.ask({
      title: 'Supprimer l\'animal',
      message: 'Êtes-vous sûr de vouloir supprimer cette pesée ?',
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await elevageService.deleteAnimal(animalId);
      toast.success('Succès', 'Animal supprimé');
      if (id) {
        const [updatedAnimals, updatedWeights] = await Promise.all([
          elevageService.getAnimals(id),
          elevageService.getWeightRecords(id),
        ]);
        setAnimals(updatedAnimals);
        setWeightRecords(updatedWeights);
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression');
    }
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !historyForm.action.trim()) return;
    setSubmittingModal(true);
    try {
      await elevageService.createHistoryEvent({
        action: historyForm.action,
        eventDate: new Date(historyForm.eventDate).toISOString(),
        details: historyForm.details,
        lotId: id,
      });
      toast.success('Succès', 'Événement consigné dans l\'historique');
      setHistoryModalOpen(false);
      setHistoryForm({ action: '', eventDate: new Date().toISOString().split('T')[0], details: '' });
      const updated = await elevageService.getHistory(id);
      setHistoryEvents(updated);
    } catch {
      toast.error('Erreur', 'Impossible de créer l\'événement');
    } finally {
      setSubmittingModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des détails du lot...</p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Lot introuvable</h2>
        <p className="text-gray-500 mb-6">Le lot demandé n'existe pas ou a été supprimé du serveur.</p>
        <Link
          to="/admin/elevage/lots"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
        >
          <ArrowLeft size={18} />
          Retour à la liste des lots
        </Link>
      </div>
    );
  }

  const validation = elevageService.getValidationRules(lot);
  const poulailer = poulailers.find((p) => String(p.id) === String(lot.poulailerId));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/elevage/lots"
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-brand-text">{lot.name}</h2>
              <span className="font-mono text-xs px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg font-bold">
                {lot.lotNumber}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {lot.breed} • Arrivée le {lot.arrivalDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Rafraîchir les données"
          >
            <RefreshCw size={18} />
          </button>

          {lot.status === LotStatus.PRET_ABATTAGE && (
            <button
              onClick={handleTransfer}
              disabled={transferLoading || lot.healthControlStatus !== 'VALID'}
              className="bg-brand-blue text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck size={18} />
              {transferLoading ? 'Transfert en cours...' : 'Transférer en Production'}
            </button>
          )}

          {lot.status !== LotStatus.PRET_ABATTAGE &&
            lot.status !== LotStatus.TRANSFERE_PRODUCTION &&
            lot.status !== LotStatus.TERMINE &&
            lot.status !== LotStatus.ARCHIVE && (
              <button
                onClick={handleNextStep}
                disabled={!validation.canGoNext || nextStepLoading}
                className="bg-brand-green text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nextStepLoading ? 'Validation...' : (
                  <>
                    <ArrowRight size={18} />
                    Passer à l'étape suivante
                  </>
                )}
              </button>
            )}
        </div>
      </div>

      {!validation.canGoNext && validation.reason && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{validation.reason}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Effectif actuel</p>
              <p className="text-2xl font-bold text-brand-text">{lot.chickCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Âge du lot</p>
              <p className="text-2xl font-bold text-brand-text">{lot.age} jours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
              <Scale size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Poids moyen</p>
              <p className="text-2xl font-bold text-brand-text">{lot.averageWeight} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Statut actuel</p>
            <LotStatusBadge status={lot.status} />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Poulailler</p>
            <p className="text-sm font-bold text-gray-700">{poulailer ? poulailer.name : 'Non assigné'}</p>
          </div>
        </div>
      </div>

      {/* Workflow Progress & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WorkflowProgress lot={lot} steps={workflowSteps} />
        </div>
        <div className="lg:col-span-2">
          <WorkflowTimeline lot={lot} steps={workflowSteps} />
        </div>
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {[
              { id: 'workflow', label: 'Workflow' },
              { id: 'general', label: 'Informations' },
              { id: 'health', label: `Santé (${healthEvents.length})` },
              { id: 'feed', label: `Alimentation (${feedRecords.length})` },
              { id: 'weight', label: `Pesées & Animaux (${animals.length || weightRecords.length})` },
              { id: 'history', label: `Historique (${historyEvents.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: WORKFLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Détails du Workflow</h3>
              <WorkflowTimeline lot={lot} steps={workflowSteps} />
            </div>
          )}

          {/* TAB 2: GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-text">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Date d'arrivée</span>
                    <span className="text-brand-text font-semibold text-sm">{lot.arrivalDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Race</span>
                    <span className="text-brand-text font-semibold text-sm">{lot.breed}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Responsable</span>
                    <span className="text-brand-text font-semibold text-sm">{lot.responsible}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Origine</span>
                    <span className="text-brand-text font-semibold text-sm">{lot.origin}</span>
                  </div>
                  {lot.transferDate && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Date de transfert</span>
                      <span className="text-brand-text font-semibold text-sm">{lot.transferDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-text">Poulailler assigné</h3>
                {poulailer ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="font-bold text-brand-text text-base">{poulailer.name}</p>
                    <p className="text-sm text-gray-500">{poulailer.location}</p>
                    <p className="text-sm text-gray-600 mt-2">Capacité : <strong>{poulailer.capacity}</strong> oiseaux</p>
                    <p className="text-sm text-gray-600">Statut : <strong>{poulailer.status}</strong></p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun poulailler associé à ce lot.</p>
                )}

                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-bold text-brand-text">Observations</h3>
                  <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {lot.observations || 'Aucune observation enregistrée pour ce lot.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEALTH / VACCINATIONS */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-text">Événements sanitaires & Vaccinations</h3>
                <button
                  onClick={() => setHealthModalOpen(true)}
                  className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Nouvelle vaccination
                </button>
              </div>

              {healthEvents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <Syringe size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Aucun événement sanitaire pour ce lot</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-brand-blue">
                            {event.type}
                          </span>
                          <span className="font-bold text-brand-text">{event.product}</span>
                        </div>
                        <p className="text-xs text-gray-500">Date : {event.date}</p>
                        {event.comment && <p className="text-sm text-gray-600">{event.comment}</p>}
                        <p className="text-xs text-gray-400">Par {event.responsible}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteHealth(event.id)}
                        className="text-gray-400 hover:text-brand-red p-1 h-fit"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-text">Distributions d'aliments</h3>
                <button
                  onClick={() => setFeedModalOpen(true)}
                  className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Nouvelle distribution
                </button>
              </div>

              {feedRecords.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <UtensilsCrossed size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Aucune distribution d'aliment enregistrée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type d'aliment</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Quantité (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Coût estimé</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Responsable</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {feedRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-brand-text font-medium">{record.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{record.feedType}</td>
                          <td className="px-4 py-3 text-sm font-bold text-brand-text">{record.quantity} kg</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.cost.toLocaleString()} FCFA</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{record.responsible}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button
                              onClick={() => handleDeleteFeed(record.id)}
                              className="text-gray-400 hover:text-brand-red p-1"
                              title="Supprimer"
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

          {/* TAB 5: WEIGHT & ANIMALS */}
          {activeTab === 'weight' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-text">Contrôle du poids & Animaux</h3>
                <button
                  onClick={() => setAnimalModalOpen(true)}
                  className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Enregistrer une pesée
                </button>
              </div>

              {animals.length === 0 && weightRecords.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <Scale size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Aucune pesée enregistrée pour ce lot</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tag / Réf</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sexe</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Poids (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {animals.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono font-bold text-brand-blue">{a.tag}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{a.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.sexe || '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-brand-text">{a.weight ? `${a.weight} kg` : '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{a.createdAt || '—'}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button
                              onClick={() => handleDeleteAnimal(a.id)}
                              className="text-gray-400 hover:text-brand-red p-1"
                              title="Supprimer"
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

          {/* TAB 6: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-text">Historique du lot</h3>
                <button
                  onClick={() => setHistoryModalOpen(true)}
                  className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Ajouter un événement
                </button>
              </div>

              {historyEvents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <Activity size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Aucun événement dans l'historique de ce lot</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyEvents.map((event) => (
                    <div key={event.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center shrink-0">
                        <Activity size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-brand-text text-sm">{event.title}</p>
                        {event.description && <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>Par {event.responsible}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Vaccination */}
      <Modal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title="Nouvelle vaccination / soin sanitaire"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHealthModalOpen(false)}
              disabled={submittingModal}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="health-form"
              disabled={submittingModal}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submittingModal ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="health-form" onSubmit={handleAddHealth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du vaccin / Traitement <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={healthForm.name}
              onChange={(e) => setHealthForm({ ...healthForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Vaccin Gumboro J14"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Date de vaccination <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              required
              value={healthForm.vaccinationDate}
              onChange={(e) => setHealthForm({ ...healthForm, vaccinationDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Commentaires / Posologie</label>
            <textarea
              value={healthForm.description}
              onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="Détails du protocole sanitaire..."
            />
          </div>
        </form>
      </Modal>

      {/* Modal Alimentation */}
      <Modal
        open={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        title="Nouvelle distribution d'aliment"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFeedModalOpen(false)}
              disabled={submittingModal}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="feed-form"
              disabled={submittingModal}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submittingModal ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="feed-form" onSubmit={handleAddFeed} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                required
                value={feedForm.feedDate}
                onChange={(e) => setFeedForm({ ...feedForm, feedDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Quantité (kg) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                required
                value={feedForm.quantity}
                onChange={(e) => setFeedForm({ ...feedForm, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type d'aliment</label>
            <select
              value={feedForm.feedType}
              onChange={(e) => setFeedForm({ ...feedForm, feedType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
            >
              <option value="Aliment Démarrage">Aliment Démarrage</option>
              <option value="Aliment de croissance">Aliment de croissance</option>
              <option value="Aliment Finition">Aliment Finition</option>
              <option value="Aliment Ponte">Aliment Ponte</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Pesée / Animal */}
      <Modal
        open={animalModalOpen}
        onClose={() => setAnimalModalOpen(false)}
        title="Enregistrer un animal ou contrôle de poids"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAnimalModalOpen(false)}
              disabled={submittingModal}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="animal-form"
              disabled={submittingModal}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submittingModal ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="animal-form" onSubmit={handleAddAnimal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tag / Identifiant</label>
              <input
                type="text"
                value={animalForm.tag}
                onChange={(e) => setAnimalForm({ ...animalForm, tag: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
                placeholder="Optionnel (ex: VOL-042)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Poids mesuré (kg) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                step={0.01}
                min={0.01}
                required
                value={animalForm.weight}
                onChange={(e) => setAnimalForm({ ...animalForm, weight: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
              <input
                type="text"
                value={animalForm.type}
                onChange={(e) => setAnimalForm({ ...animalForm, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sexe</label>
              <select
                value={animalForm.sexe}
                onChange={(e) => setAnimalForm({ ...animalForm, sexe: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                <option value="M">Mâle</option>
                <option value="F">Femelle</option>
                <option value="MIXTE">Mixte / Non sexé</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Historique */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Ajouter un événement à l'historique"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              disabled={submittingModal}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="history-form"
              disabled={submittingModal}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submittingModal ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="history-form" onSubmit={handleAddHistory} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Action / Titre <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={historyForm.action}
              onChange={(e) => setHistoryForm({ ...historyForm, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Visite vétérinaire périodique"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Date <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              required
              value={historyForm.eventDate}
              onChange={(e) => setHistoryForm({ ...historyForm, eventDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Détails</label>
            <textarea
              value={historyForm.details}
              onChange={(e) => setHistoryForm({ ...historyForm, details: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="Observations..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
