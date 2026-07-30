
import {
  Lot,
  Poulailer,
  HealthEvent,
  FeedRecord,
  TimelineEvent,
  ElevageDashboardStats,
  WorkflowStep,
  HistoryEvent,
  LotStatus
} from '../types';
import { MOCK_LOTS } from '../mocks/lots.mock';
import { MOCK_POULAILERS } from '../mocks/poulailers.mock';
import { MOCK_HEALTH_EVENTS } from '../mocks/health.mock';
import { MOCK_FEED_RECORDS } from '../mocks/feed.mock';
import { MOCK_TIMELINE_EVENTS } from '../mocks/timeline.mock';
import { MOCK_DASHBOARD_STATS } from '../mocks/dashboard.mock';
import { WORKFLOW_STEPS } from '../mocks/status.mock';
import { MOCK_HISTORY } from '../mocks/history.mock';

let history = [...MOCK_HISTORY];

// Mock production module data for transfer simulation
export interface ProductionLot {
  id: string;
  lotNumber: string;
  elevageLotId: string;
  name: string;
  status: 'En attente d\'abattage' | 'En cours d\'abattage' | 'Abattu';
  arrivalDate: string;
  chickCount: number;
  responsible: string;
}
let productionLots: ProductionLot[] = [];

export const elevageService = {
  // ========== DASHBOARD ==========
  async getDashboardStats(): Promise<ElevageDashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Update stats based on current MOCK_LOTS
    MOCK_DASHBOARD_STATS.lotsArrivee = MOCK_LOTS.filter(l => l.status === LotStatus.ARRIVEE).length;
    MOCK_DASHBOARD_STATS.lotsEnElevage = MOCK_LOTS.filter(l => l.status === LotStatus.EN_ELEVAGE).length;
    MOCK_DASHBOARD_STATS.lotsEnVaccination = MOCK_LOTS.filter(l => l.status === LotStatus.VACCINATION).length;
    MOCK_DASHBOARD_STATS.lotsEnTraitement = MOCK_LOTS.filter(l => l.status === LotStatus.TRAITEMENT).length;
    MOCK_DASHBOARD_STATS.lotsPretsAbattage = MOCK_LOTS.filter(l => l.status === LotStatus.PRET_ABATTAGE).length;
    MOCK_DASHBOARD_STATS.lotsTransferes = MOCK_LOTS.filter(l => l.status === LotStatus.TRANSFERE_PRODUCTION).length;
    return MOCK_DASHBOARD_STATS;
  },

  // ========== LOTS ==========
  async getLots(): Promise<Lot[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_LOTS;
  },

  async getActiveLots(): Promise<Lot[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_LOTS.filter(l => l.status !== LotStatus.TRANSFERE_PRODUCTION && l.status !== LotStatus.TERMINE && l.status !== LotStatus.ARCHIVE);
  },

  async getLotById(id: string): Promise<Lot | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_LOTS.find(lot => lot.id === id);
  },

  async createLot(lotData: Omit<Lot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lot> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newLot: Lot = {
      ...lotData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    MOCK_LOTS.push(newLot);
    return newLot;
  },

  async updateLot(id: string, lotData: Partial<Lot>): Promise<Lot | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_LOTS.findIndex(lot => lot.id === id);
    if (index !== -1) {
      MOCK_LOTS[index] = {
        ...MOCK_LOTS[index],
        ...lotData,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      return MOCK_LOTS[index];
    }
    return undefined;
  },

  async deleteLot(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_LOTS.findIndex(lot => lot.id === id);
    if (index !== -1) {
      MOCK_LOTS.splice(index, 1);
      return true;
    }
    return false;
  },

  // ========== WORKFLOW ==========
  async getWorkflow(): Promise<WorkflowStep[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return WORKFLOW_STEPS;
  },

  getValidationRules(lot: Lot): { canGoNext: boolean; reason?: string } {
    switch (lot.status) {
      case LotStatus.EN_ELEVAGE:
        if (lot.feedRecordsCount === 0) {
          return { canGoNext: false, reason: 'Impossible de continuer : aucun enregistrement alimentaire' };
        }
        return { canGoNext: true };
      case LotStatus.SUIVI_ALIMENTAIRE:
        if (!lot.vaccinationsDone) {
          return { canGoNext: false, reason: 'Impossible de continuer : vaccinations non terminées' };
        }
        return { canGoNext: true };
      case LotStatus.CONTROLE_POIDS:
        if (!lot.weightRecorded) {
          return { canGoNext: false, reason: 'Impossible de continuer : aucun contrôle de poids' };
        }
        if (lot.averageWeight < lot.minWeightRequired) {
          return { canGoNext: false, reason: `Impossible de continuer : poids minimum non atteint (${lot.minWeightRequired} kg)` };
        }
        return { canGoNext: true };
      case LotStatus.CONTROLE_SANITAIRE:
        if (lot.healthControlStatus !== 'VALID') {
          return { canGoNext: false, reason: 'Impossible de continuer : contrôle sanitaire non validé' };
        }
        return { canGoNext: true };
      case LotStatus.PRET_ABATTAGE:
        return { canGoNext: true, reason: 'Prêt pour le transfert vers la Production' };
      case LotStatus.TRANSFERE_PRODUCTION:
      case LotStatus.TERMINE:
      case LotStatus.ARCHIVE:
        return { canGoNext: false, reason: 'Cycle terminé' };
      default:
        return { canGoNext: true };
    }
  },

  canGoToNextStep(lot: Lot): boolean {
    return this.getValidationRules(lot).canGoNext;
  },

  async nextStep(lotId: string): Promise<Lot | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lot = MOCK_LOTS.find(l => l.id === lotId);
    if (!lot) return undefined;
    if (!this.canGoToNextStep(lot)) return undefined;

    const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === lot.status);
    if (currentStepIndex === -1 || currentStepIndex >= WORKFLOW_STEPS.length - 1) return undefined;

    const nextStep = WORKFLOW_STEPS[currentStepIndex + 1];
    const index = MOCK_LOTS.findIndex(l => l.id === lotId);
    if (index !== -1) {
      MOCK_LOTS[index] = {
        ...MOCK_LOTS[index],
        status: nextStep.id,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      // Add history entry
      const newHistoryEvent: HistoryEvent = {
        id: Date.now().toString(),
        lotId: lotId,
        date: new Date().toISOString().split('T')[0],
        type: 'CHANGEMENT_STATUT' as any,
        status: nextStep.id,
        title: `Passage à l'étape : ${nextStep.label}`,
        description: nextStep.description,
        responsible: MOCK_LOTS[index].responsible,
        createdAt: new Date().toISOString()
      };
      history.push(newHistoryEvent);
      return MOCK_LOTS[index];
    }
    return undefined;
  },

  async transferToProduction(lotId: string): Promise<{ elevageLot: Lot; productionLot: ProductionLot } | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lot = MOCK_LOTS.find(l => l.id === lotId);
    if (!lot) return undefined;
    if (lot.status !== LotStatus.PRET_ABATTAGE) return undefined;
    if (lot.healthControlStatus !== 'VALID') return undefined;

    // Update lot in elevage
    const index = MOCK_LOTS.findIndex(l => l.id === lotId);
    if (index === -1) return undefined;

    const transferDate = new Date().toISOString().split('T')[0];
    MOCK_LOTS[index] = {
      ...MOCK_LOTS[index],
      status: LotStatus.TRANSFERE_PRODUCTION,
      transferDate: transferDate,
      updatedAt: transferDate
    };

    // Create production lot
    const newProductionLot: ProductionLot = {
      id: `PROD-${lotId}`,
      lotNumber: lot.lotNumber,
      elevageLotId: lotId,
      name: lot.name,
      status: 'En attente d\'abattage',
      arrivalDate: transferDate,
      chickCount: lot.chickCount,
      responsible: lot.responsible
    };
    productionLots.push(newProductionLot);

    // Add history entry
    const newHistoryEvent: HistoryEvent = {
      id: Date.now().toString(),
      lotId: lotId,
      date: transferDate,
      type: 'TRANSFERT' as any,
      status: LotStatus.TRANSFERE_PRODUCTION,
      title: 'Transfert vers la Production',
      description: 'Lot transféré vers le module Production',
      responsible: lot.responsible,
      createdAt: new Date().toISOString()
    };
    history.push(newHistoryEvent);

    return { elevageLot: MOCK_LOTS[index], productionLot: newProductionLot };
  },

  async getHistory(lotId?: string): Promise<HistoryEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (lotId) {
      return history.filter(h => h.lotId === lotId);
    }
    return history;
  },

  // ========== POULAILERS ==========
  async getPoulailers(): Promise<Poulailer[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_POULAILERS;
  },

  async getPoulailerById(id: string): Promise<Poulailer | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_POULAILERS.find(p => p.id === id);
  },

  // ========== HEALTH ==========
  async getHealthEvents(lotId?: string): Promise<HealthEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (lotId) {
      return MOCK_HEALTH_EVENTS.filter(e => e.lotId === lotId);
    }
    return MOCK_HEALTH_EVENTS;
  },

  // ========== FEED ==========
  async getFeedRecords(lotId?: string): Promise<FeedRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (lotId) {
      return MOCK_FEED_RECORDS.filter(r => r.lotId === lotId);
    }
    return MOCK_FEED_RECORDS;
  },

  // ========== TIMELINE ==========
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_TIMELINE_EVENTS;
  },

  // ========== WEIGHT RECORDS ==========
  async getWeightRecords(lotId?: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock weight records
    return [
      { id: '1', lotId: '1', date: '2024-05-15', averageWeight: 0.5, responsible: 'Koffi Mensah' },
      { id: '2', lotId: '1', date: '2024-06-01', averageWeight: 1.2, responsible: 'Koffi Mensah' },
      { id: '3', lotId: '1', date: '2024-06-15', averageWeight: 1.8, responsible: 'Koffi Mensah' },
      { id: '4', lotId: '1', date: '2024-07-01', averageWeight: 2.3, responsible: 'Koffi Mensah' }
    ].filter(r => !lotId || r.lotId === lotId);
  }
};
