
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, Activity, Package, Droplets, ArrowRight, Truck } from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { Lot, Poulailer, HealthEvent, FeedRecord, TimelineEvent, WorkflowStep, HistoryEvent, LotStatus } from '../types';
import { LotStatusBadge } from '../components/LotStatusBadge';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { WorkflowProgress } from '../components/WorkflowProgress';

export const LotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lot, setLot] = useState<Lot | null>(null);
  const [poulailers, setPoulailers] = useState<Poulailer[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [weightRecords, setWeightRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'health' | 'feed' | 'weight' | 'history' | 'timeline'>('workflow');
  const [nextStepLoading, setNextStepLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        const [lotData, poulailersData, healthData, feedData, timelineData, workflowData, historyData, weightData] = await Promise.all([
          elevageService.getLotById(id),
          elevageService.getPoulailers(),
          elevageService.getHealthEvents(id),
          elevageService.getFeedRecords(id),
          elevageService.getTimelineEvents(),
          elevageService.getWorkflow(),
          elevageService.getHistory(id),
          elevageService.getWeightRecords(id)
        ]);
        setLot(lotData || null);
        setPoulailers(poulailersData);
        setHealthEvents(healthData);
        setFeedRecords(feedData);
        setTimelineEvents(timelineData);
        setWorkflowSteps(workflowData);
        setHistoryEvents(historyData);
        setWeightRecords(weightData);
        setLoading(false);
      };
      loadData();
    }
  }, [id]);

  const handleNextStep = async () => {
    if (!lot || !id) return;
    setNextStepLoading(true);
    const updatedLot = await elevageService.nextStep(id);
    if (updatedLot) {
      setLot(updatedLot);
      const newHistory = await elevageService.getHistory(id);
      setHistoryEvents(newHistory);
    }
    setNextStepLoading(false);
  };

  const handleTransfer = async () => {
    if (!lot || !id) return;
    setTransferLoading(true);
    const result = await elevageService.transferToProduction(id);
    if (result) {
      setLot(result.elevageLot);
      const newHistory = await elevageService.getHistory(id);
      setHistoryEvents(newHistory);
    }
    setTransferLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl">Lot non trouvé</div>
      </div>
    );
  }

  const validation = elevageService.getValidationRules(lot);
  const poulailer = poulailers.find(p => p.id === lot.poulailerId);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'CREATION_LOT': return <Package size={16} />;
      case 'CHANGEMENT_STATUT': return <Activity size={16} />;
      case 'VACCINATION': return <Activity size={16} />;
      case 'TRANSFERT': return <Truck size={16} />;
      case 'PESEE': return <Eye size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'CREATION_LOT': return 'bg-brand-blue';
      case 'CHANGEMENT_STATUT': return 'bg-brand-green';
      case 'VACCINATION': return 'bg-yellow-500';
      case 'TRANSFERT': return 'bg-brand-blue';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/elevage/lots" className="p-2 rounded-lg hover:bg-gray-100 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{lot.name}</h2>
            <p className="text-sm text-gray-500">{lot.lotNumber} • {lot.breed}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {lot.status === LotStatus.PRET_ABATTAGE && (
            <button
              onClick={handleTransfer}
              disabled={transferLoading || lot.healthControlStatus !== 'VALID'}
              className="bg-brand-blue text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck size={18} />
              {transferLoading ? 'Transfert en cours...' : 'Transférer vers la Production'}
            </button>
          )}
          {lot.status !== LotStatus.PRET_ABATTAGE && (
            <button
              onClick={handleNextStep}
              disabled={!validation.canGoNext || nextStepLoading}
              className="bg-brand-green text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nextStepLoading ? 'Chargement...' : (
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {validation.reason}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Effectif</p>
              <p className="text-2xl font-bold text-brand-text">{lot.chickCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Âge</p>
              <p className="text-2xl font-bold text-brand-text">{lot.age} jours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Poids moyen</p>
              <p className="text-2xl font-bold text-brand-text">{lot.averageWeight} kg</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <LotStatusBadge status={lot.status} />
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

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="border-b border-gray-100 px-6 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {[
              { id: 'workflow', label: 'Workflow' },
              { id: 'general', label: 'Informations' },
              { id: 'health', label: 'Santé' },
              { id: 'feed', label: 'Alimentation' },
              { id: 'weight', label: 'Poids' },
              { id: 'history', label: 'Historique' },
              { id: 'timeline', label: 'Chronologie' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
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
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-text">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date de création</span>
                    <span className="text-brand-text">{lot.createdAt}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date d'arrivée</span>
                    <span className="text-brand-text">{lot.arrivalDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date de mise à jour</span>
                    <span className="text-brand-text">{lot.updatedAt}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Responsable</span>
                    <span className="text-brand-text">{lot.responsible}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Origine</span>
                    <span className="text-brand-text">{lot.origin}</span>
                  </div>
                  {lot.transferDate && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Date de transfert</span>
                      <span className="text-brand-text">{lot.transferDate}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-text">Poulailler</h3>
                {poulailer ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-bold text-brand-text">{poulailer.name}</p>
                    <p className="text-sm text-gray-500">{poulailer.location}</p>
                    <p className="text-sm text-gray-500">Capacité: {poulailer.capacity} oiseaux</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun poulailler associé</p>
                )}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-text">Observations</h3>
                  <p className="text-gray-600">{lot.observations || 'Aucune observation'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Détails du Workflow</h3>
              <WorkflowTimeline lot={lot} steps={workflowSteps} />
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Événements sanitaires</h3>
              <div className="space-y-3">
                {healthEvents.length === 0 ? (
                  <p className="text-gray-500">Aucun événement sanitaire</p>
                ) : (
                  healthEvents.map(event => (
                    <div key={event.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-brand-text">{event.type}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{event.date}</span>
                      </div>
                      {event.product && <p className="text-sm text-gray-600 mb-1">Produit: {event.product}</p>}
                      {event.comment && <p className="text-sm text-gray-600 mb-1">Commentaire: {event.comment}</p>}
                      <p className="text-xs text-gray-400 mt-2">Par {event.responsible}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Suivi alimentaire</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Coût</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-sm text-brand-text">{record.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.feedType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.quantity} kg</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.responsible}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.cost} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'weight' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Évolution du poids</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Poids moyen</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {weightRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-sm text-brand-text">{record.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.averageWeight} kg</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{record.responsible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Historique du workflow</h3>
              <div className="space-y-6">
                {historyEvents.map(event => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white">
                        <Activity size={16} />
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    </div>
                    <div className="pb-6">
                      <p className="font-bold text-brand-text">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-400">{event.date}</p>
                        {event.responsible && <p className="text-xs text-gray-400">Par {event.responsible}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-text">Chronologie des événements</h3>
              <div className="space-y-6">
                {timelineEvents.map(event => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    </div>
                    <div className="pb-6">
                      <p className="font-bold text-brand-text">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
