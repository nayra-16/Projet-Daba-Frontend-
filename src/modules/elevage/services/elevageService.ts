import { lotService } from '../../../core/services/lotService';
import {
  poulaillerService,
  vaccinationService,
  alimentationService,
  animalService,
  historiqueService,
} from '../../../core/services/elevageServices';
import { productionService } from '../../../modules/production/services/productionService';
import {
  Lot,
  Poulailer,
  HealthEvent,
  FeedRecord,
  TimelineEvent,
  ElevageDashboardStats,
  WorkflowStep,
  HistoryEvent,
  Animal,
  WeightRecord,
  LotStatus,
  PoulailerStatus,
  HealthEventType,
  TimelineEventType,
} from '../types';
import { WORKFLOW_STEPS } from '../constants/status.constants';

// ============================================================
// STATUS MAPPINGS (Frontend LotStatus <-> Backend String)
// ============================================================

export function mapBackendStatusToLotStatus(status?: string): LotStatus {
  if (!status) return LotStatus.EN_ELEVAGE;
  const s = status.toUpperCase().trim();
  if (s.includes('ARRIVEE') || s === 'ARRIVÉE') return LotStatus.ARRIVEE;
  if (s.includes('INSTALLE') || s === 'INSTALLÉ') return LotStatus.INSTALLE;
  if (s.includes('VACCINATION')) return LotStatus.VACCINATION;
  if (s.includes('TRAITEMENT')) return LotStatus.TRAITEMENT;
  if (s.includes('SUIVI') || s.includes('ALIMENTAIRE')) return LotStatus.SUIVI_ALIMENTAIRE;
  if (s.includes('POIDS')) return LotStatus.CONTROLE_POIDS;
  if (s.includes('SANITAIRE')) return LotStatus.CONTROLE_SANITAIRE;
  if (s.includes('PRET') || s.includes('PRÊT') || s.includes('ABATTAGE')) return LotStatus.PRET_ABATTAGE;
  if (s.includes('TRANSFERE') || s.includes('TRANSFÉRÉ') || s.includes('PRODUCTION')) return LotStatus.TRANSFERE_PRODUCTION;
  if (s.includes('TERMINE') || s === 'TERMINÉ') return LotStatus.TERMINE;
  if (s.includes('ARCHIVE') || s === 'ARCHIVÉ') return LotStatus.ARCHIVE;
  return LotStatus.EN_ELEVAGE;
}

export function mapLotStatusToBackend(status: LotStatus | string): string {
  switch (status) {
    case LotStatus.ARRIVEE: return 'ARRIVEE';
    case LotStatus.INSTALLE: return 'INSTALLE';
    case LotStatus.EN_ELEVAGE: return 'EN_ELEVAGE';
    case LotStatus.SUIVI_ALIMENTAIRE: return 'SUIVI_ALIMENTAIRE';
    case LotStatus.VACCINATION: return 'VACCINATION';
    case LotStatus.TRAITEMENT: return 'TRAITEMENT';
    case LotStatus.CONTROLE_POIDS: return 'CONTROLE_POIDS';
    case LotStatus.CONTROLE_SANITAIRE: return 'CONTROLE_SANITAIRE';
    case LotStatus.PRET_ABATTAGE: return 'PRET_ABATTAGE';
    case LotStatus.TRANSFERE_PRODUCTION: return 'TRANSFERE_PRODUCTION';
    case LotStatus.TERMINE: return 'TERMINE';
    case LotStatus.ARCHIVE: return 'ARCHIVE';
    default: return String(status).toUpperCase().replace(/\s+/g, '_');
  }
}

// ============================================================
// DTO -> DOMAIN MODEL MAPPINGS
// ============================================================

function mapLotDTOToLot(raw: any): Lot {
  const status = mapBackendStatusToLotStatus(raw.status);
  return {
    id: String(raw.id),
    lotNumber: raw.lotNumber || raw.name || `LOT-${raw.id}`,
    name: raw.name || `Lot ${raw.id}`,
    arrivalDate: raw.arrivalDate ? String(raw.arrivalDate).substring(0, 10) : new Date().toISOString().split('T')[0],
    origin: raw.origin || 'Ferme principale',
    chickCount: Number(raw.quantity || 0),
    breed: raw.breed || 'Poulet de chair',
    age: Number(raw.age || 30),
    averageWeight: Number(raw.averageWeight || 1.8),
    minWeightRequired: Number(raw.minWeightRequired || 1.8),
    status,
    poulailerId: raw.poulaillerId ? String(raw.poulaillerId) : '',
    responsible: raw.responsible || 'Responsable Élevage',
    observations: raw.observations || raw.description || undefined,
    feedRecordsCount: Number(raw.feedRecordsCount || 1),
    vaccinationsDone: Boolean(raw.vaccinationsDone ?? true),
    weightRecorded: Boolean(raw.weightRecorded ?? true),
    healthControlValidated: Boolean(raw.healthControlValidated ?? true),
    healthControlStatus: (raw.healthControlStatus || 'VALID') as any,
    transferDate: raw.transferDate ? String(raw.transferDate).substring(0, 10) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt).substring(0, 10) : new Date().toISOString().split('T')[0],
    updatedAt: raw.updatedAt ? String(raw.updatedAt).substring(0, 10) : new Date().toISOString().split('T')[0],
  };
}

function mapPoulaillerDTOToPoulailer(raw: any): Poulailer {
  return {
    id: String(raw.id),
    name: raw.name || `Poulailler ${raw.id}`,
    capacity: Number(raw.capacity || 1000),
    currentCount: Number(raw.currentCount || 0),
    responsible: raw.responsible || 'Responsable Poulailler',
    status: (raw.status as PoulailerStatus) || PoulailerStatus.ACTIF,
    location: raw.location || raw.farmName || 'Site principal',
    description: raw.description || undefined,
    createdAt: raw.createdAt ? String(raw.createdAt).substring(0, 10) : new Date().toISOString().split('T')[0],
  };
}

function mapAlimentationDTOToFeedRecord(raw: any): FeedRecord {
  const qty = Number(raw.quantity || 0);
  return {
    id: String(raw.id),
    date: raw.feedDate ? String(raw.feedDate).substring(0, 10) : new Date().toISOString().split('T')[0],
    lotId: raw.lotId ? String(raw.lotId) : '',
    feedType: raw.feedType || 'Aliment composé',
    quantity: qty,
    responsible: raw.responsible || 'Agent d\'élevage',
    cost: Number(raw.cost || (qty * 300)),
    createdAt: raw.createdAt ? String(raw.createdAt).substring(0, 10) : new Date().toISOString().split('T')[0],
  };
}

function mapVaccinationDTOToHealthEvent(raw: any): HealthEvent {
  return {
    id: String(raw.id),
    date: raw.vaccinationDate ? String(raw.vaccinationDate).substring(0, 10) : new Date().toISOString().split('T')[0],
    lotId: raw.lotId ? String(raw.lotId) : '',
    type: HealthEventType.VACCINATION,
    product: raw.name || 'Vaccin',
    responsible: raw.responsible || 'Agent Vétérinaire',
    comment: raw.description || undefined,
    mortalityCount: raw.mortalityCount || undefined,
    createdAt: raw.createdAt ? String(raw.createdAt).substring(0, 10) : new Date().toISOString().split('T')[0],
  };
}

function mapHistoriqueDTOToHistoryEvent(raw: any): HistoryEvent {
  return {
    id: String(raw.id),
    lotId: raw.lotId ? String(raw.lotId) : '',
    date: raw.eventDate ? String(raw.eventDate).substring(0, 10) : new Date().toISOString().split('T')[0],
    type: TimelineEventType.CHANGEMENT_STATUT,
    title: raw.action || 'Événement Élevage',
    description: raw.details || undefined,
    responsible: raw.responsible || 'Responsable Élevage',
    createdAt: raw.eventDate ? String(raw.eventDate) : new Date().toISOString(),
  };
}

function mapAnimalDTOToAnimal(raw: any): Animal {
  return {
    id: String(raw.id),
    tag: raw.tag || `TAG-${raw.id}`,
    type: raw.type || 'Poulet',
    sexe: raw.sexe || 'M',
    birthDate: raw.birthDate ? String(raw.birthDate).substring(0, 10) : undefined,
    weight: raw.weight ? Number(raw.weight) : undefined,
    lotId: String(raw.lotId || ''),
    createdAt: raw.createdAt ? String(raw.createdAt).substring(0, 10) : new Date().toISOString().split('T')[0],
  };
}

// ============================================================
// SERVICE CONNECTÉ AUX VRAIES APIS BACKEND
// ============================================================

export const elevageService = {
  // ========== DASHBOARD ==========
  async getDashboardStats(): Promise<ElevageDashboardStats> {
    try {
      const [lots, poulaillers, feedRecords, healthEvents, animals] = await Promise.all([
        this.getLots(),
        this.getPoulailers(),
        this.getFeedRecords(),
        this.getHealthEvents(),
        this.getAnimals(),
      ]);

      const activeLots = lots.filter(
        (l) => l.status !== LotStatus.TRANSFERE_PRODUCTION && l.status !== LotStatus.TERMINE && l.status !== LotStatus.ARCHIVE
      );
      const poulesCount = animals.filter(a => a.sexe === 'F' || a.type?.toLowerCase() === 'poule').length;
      const coqsCount = animals.filter(a => a.sexe === 'M' || a.type?.toLowerCase() === 'coq').length;
      const totalBirds = poulesCount > 0 || coqsCount > 0 
        ? poulesCount + coqsCount 
        : activeLots.reduce((sum, l) => sum + (l.chickCount || 0), 0);
      const totalCapacity = poulaillers.reduce((sum, p) => sum + (p.capacity || 0), 0);
      const capacityUsed = totalCapacity > 0 ? Math.min(100, Math.round((totalBirds / totalCapacity) * 100)) : 0;
      const totalFeed = feedRecords.reduce((sum, f) => sum + (f.quantity || 0), 0);

      return {
        lotsArrivee: lots.filter((l) => l.status === LotStatus.ARRIVEE).length,
        lotsEnElevage: lots.filter((l) => l.status === LotStatus.EN_ELEVAGE).length,
        lotsEnVaccination: lots.filter((l) => l.status === LotStatus.VACCINATION).length,
        lotsEnTraitement: lots.filter((l) => l.status === LotStatus.TRAITEMENT).length,
        lotsPretsAbattage: lots.filter((l) => l.status === LotStatus.PRET_ABATTAGE).length,
        lotsTransferes: lots.filter((l) => l.status === LotStatus.TRANSFERE_PRODUCTION).length,
        totalBirds,
        poulailersCount: poulaillers.length,
        capacityUsed,
        monthlyMortality: 0,
        monthlyFeedConsumption: totalFeed,
        upcomingVaccinations: healthEvents.slice(0, 5),
        lotsReadyForSlaughter: lots.filter((l) => l.status === LotStatus.PRET_ABATTAGE),
        activeLotsCount: activeLots.length,
        birdEvolution: activeLots.map((l) => ({ date: l.name, count: l.chickCount })),
        feedEvolution: feedRecords.slice(0, 7).map((f) => ({ date: f.date, quantity: f.quantity })),
        mortalityEvolution: [],
        weightEvolution: activeLots.map((l) => ({ date: l.name, weight: l.averageWeight })),
      };
    } catch {
      return {
        lotsArrivee: 0,
        lotsEnElevage: 0,
        lotsEnVaccination: 0,
        lotsEnTraitement: 0,
        lotsPretsAbattage: 0,
        lotsTransferes: 0,
        totalBirds: 0,
        poulailersCount: 0,
        capacityUsed: 0,
        monthlyMortality: 0,
        monthlyFeedConsumption: 0,
        upcomingVaccinations: [],
        lotsReadyForSlaughter: [],
        activeLotsCount: 0,
        birdEvolution: [],
        feedEvolution: [],
        mortalityEvolution: [],
        weightEvolution: [],
      };
    }
  },

  // ========== LOTS ==========
  async getLots(): Promise<Lot[]> {
    try {
      const dtos = await lotService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapLotDTOToLot) : [];
    } catch {
      return [];
    }
  },

  async getActiveLots(): Promise<Lot[]> {
    const all = await this.getLots();
    return all.filter(
      (l) => l.status !== LotStatus.TRANSFERE_PRODUCTION && l.status !== LotStatus.TERMINE && l.status !== LotStatus.ARCHIVE
    );
  },

  async getLotById(id: string): Promise<Lot | undefined> {
    try {
      const dto = await lotService.getById(Number(id));
      return dto ? mapLotDTOToLot(dto) : undefined;
    } catch {
      return undefined;
    }
  },

  async createLot(lotData: Partial<Lot> & { name: string; chickCount: number }): Promise<Lot> {
    const payload: any = {
      name: lotData.name,
      quantity: Number(lotData.chickCount || 0),
      arrivalDate: lotData.arrivalDate || new Date().toISOString().split('T')[0],
      status: mapLotStatusToBackend(lotData.status || LotStatus.EN_ELEVAGE),
      farmId: 1,
      poulaillerId: lotData.poulailerId ? Number(lotData.poulailerId) : undefined,
    };
    const created = await lotService.create(payload);
    return mapLotDTOToLot(created);
  },

  async updateLot(id: string, lotData: Partial<Lot>): Promise<Lot | undefined> {
    const existing = await this.getLotById(id);
    const payload: any = {
      name: lotData.name ?? existing?.name ?? `Lot-${id}`,
      quantity: lotData.chickCount ?? existing?.chickCount ?? 0,
      arrivalDate: lotData.arrivalDate ?? existing?.arrivalDate ?? new Date().toISOString().split('T')[0],
      status: mapLotStatusToBackend(lotData.status ?? existing?.status ?? LotStatus.EN_ELEVAGE),
      farmId: 1,
      poulaillerId: lotData.poulailerId ? Number(lotData.poulailerId) : (existing?.poulailerId ? Number(existing.poulailerId) : undefined),
    };
    const updated = await lotService.update(Number(id), payload);
    return mapLotDTOToLot(updated);
  },

  async deleteLot(id: string): Promise<boolean> {
    try {
      await lotService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== POULAILLERS ==========
  async getPoulailers(): Promise<Poulailer[]> {
    try {
      const dtos = await poulaillerService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapPoulaillerDTOToPoulailer) : [];
    } catch {
      return [];
    }
  },

  async getPoulailerById(id: string): Promise<Poulailer | undefined> {
    try {
      const dto = await poulaillerService.getById(Number(id));
      return dto ? mapPoulaillerDTOToPoulailer(dto) : undefined;
    } catch {
      return undefined;
    }
  },

  async createPoulailler(data: { name: string; capacity: number; description?: string; farmId?: number }): Promise<Poulailer> {
    const payload: any = {
      name: data.name,
      capacity: Number(data.capacity || 1000),
      description: data.description || '',
      farmId: data.farmId || 1,
    };
    const created = await poulaillerService.create(payload);
    return mapPoulaillerDTOToPoulailer(created);
  },

  async updatePoulailler(id: string, data: Partial<{ name: string; capacity: number; description?: string; farmId?: number }>): Promise<Poulailer | undefined> {
    const existing = await this.getPoulailerById(id);
    const payload: any = {
      name: data.name ?? existing?.name ?? `Poulailler-${id}`,
      capacity: data.capacity ?? existing?.capacity ?? 1000,
      description: data.description ?? existing?.description ?? '',
      farmId: data.farmId || 1,
    };
    const updated = await poulaillerService.update(Number(id), payload);
    return mapPoulaillerDTOToPoulailer(updated);
  },

  async deletePoulailler(id: string): Promise<boolean> {
    try {
      await poulaillerService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== HEALTH / VACCINATION ==========
  async getHealthEvents(lotId?: string): Promise<HealthEvent[]> {
    try {
      const dtos = lotId
        ? await vaccinationService.getByLotId(Number(lotId))
        : await vaccinationService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapVaccinationDTOToHealthEvent) : [];
    } catch {
      return [];
    }
  },

  async createHealthEvent(data: { name: string; vaccinationDate: string; lotId: string; description?: string }): Promise<HealthEvent> {
    const payload: any = {
      name: data.name,
      vaccinationDate: data.vaccinationDate,
      lotId: Number(data.lotId),
      description: data.description || '',
    };
    const created = await vaccinationService.create(payload);
    return mapVaccinationDTOToHealthEvent(created);
  },

  async updateHealthEvent(id: string, data: Partial<{ name: string; vaccinationDate: string; lotId: string; description?: string }>): Promise<HealthEvent> {
    const payload: any = {
      name: data.name,
      vaccinationDate: data.vaccinationDate,
      description: data.description || '',
      lotId: Number(data.lotId),
    };
    const updated = await vaccinationService.update(Number(id), payload);
    return mapVaccinationDTOToHealthEvent(updated);
  },

  async deleteHealthEvent(id: string): Promise<boolean> {
    try {
      await vaccinationService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== FEED / ALIMENTATION ==========
  async getFeedRecords(lotId?: string): Promise<FeedRecord[]> {
    try {
      const dtos = lotId
        ? await alimentationService.getByLotId(Number(lotId))
        : await alimentationService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapAlimentationDTOToFeedRecord) : [];
    } catch {
      return [];
    }
  },

  async createFeedRecord(data: { feedDate: string; quantity: number; feedType: string; lotId: string }): Promise<FeedRecord> {
    const payload: any = {
      feedDate: data.feedDate,
      quantity: Number(data.quantity),
      feedType: data.feedType,
      lotId: Number(data.lotId),
    };
    const created = await alimentationService.create(payload);
    return mapAlimentationDTOToFeedRecord(created);
  },

  async updateFeedRecord(id: string, data: Partial<{ feedDate: string; quantity: number; feedType: string; lotId: string }>): Promise<FeedRecord> {
    const payload: any = {
      feedDate: data.feedDate,
      quantity: data.quantity ? Number(data.quantity) : undefined,
      feedType: data.feedType,
      lotId: data.lotId ? Number(data.lotId) : undefined,
    };
    const updated = await alimentationService.update(Number(id), payload);
    return mapAlimentationDTOToFeedRecord(updated);
  },

  async deleteFeedRecord(id: string): Promise<boolean> {
    try {
      await alimentationService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== ANIMALS / ANIMAUX ==========
  async getAnimals(lotId?: string): Promise<Animal[]> {
    try {
      const dtos = lotId
        ? await animalService.getByLotId(Number(lotId))
        : await animalService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapAnimalDTOToAnimal) : [];
    } catch {
      return [];
    }
  },

  async createAnimal(data: { type: string; lotId: string; tag?: string; sexe?: string; birthDate?: string; weight?: number }): Promise<Animal> {
    const payload: any = {
      type: data.type,
      lotId: Number(data.lotId),
      tag: data.tag || `TAG-${Date.now().toString().slice(-4)}`,
      sexe: data.sexe || 'M',
      birthDate: data.birthDate,
      weight: data.weight ? Number(data.weight) : undefined,
    };
    const created = await animalService.create(payload);
    return mapAnimalDTOToAnimal(created);
  },

  async updateAnimal(id: string, data: Partial<{ type: string; lotId: string; tag?: string; sexe?: string; birthDate?: string; weight?: number }>): Promise<Animal> {
    const payload: any = {
      type: data.type,
      lotId: data.lotId ? Number(data.lotId) : undefined,
      tag: data.tag,
      sexe: data.sexe,
      birthDate: data.birthDate,
      weight: data.weight ? Number(data.weight) : undefined,
    };
    const updated = await animalService.update(Number(id), payload);
    return mapAnimalDTOToAnimal(updated);
  },

  async deleteAnimal(id: string): Promise<boolean> {
    try {
      await animalService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== TIMELINE & HISTORIQUE ==========
  async getHistory(lotId?: string): Promise<HistoryEvent[]> {
    try {
      const dtos = lotId
        ? await historiqueService.getByLotId(Number(lotId))
        : await historiqueService.getAll();
      return Array.isArray(dtos) ? dtos.map(mapHistoriqueDTOToHistoryEvent) : [];
    } catch {
      return [];
    }
  },

  async getTimelineEvents(): Promise<TimelineEvent[]> {
    try {
      const dtos = await historiqueService.getAll();
      return Array.isArray(dtos)
        ? dtos.map((h: any) => ({
            id: String(h.id),
            date: h.eventDate ? String(h.eventDate).substring(0, 10) : new Date().toISOString().split('T')[0],
            type: TimelineEventType.CHANGEMENT_STATUT,
            lotId: h.lotId ? String(h.lotId) : undefined,
            description: h.action ? `${h.action}${h.details ? ` - ${h.details}` : ''}` : h.details || 'Événement',
            responsible: h.responsible || 'Système',
            createdAt: h.eventDate ? String(h.eventDate) : new Date().toISOString(),
          }))
        : [];
    } catch {
      return [];
    }
  },

  async createHistoryEvent(data: { action: string; eventDate: string; details?: string; lotId?: string }): Promise<HistoryEvent> {
    const payload: any = {
      action: data.action,
      eventDate: data.eventDate,
      details: data.details || '',
      lotId: data.lotId ? Number(data.lotId) : undefined,
    };
    const created = await historiqueService.create(payload);
    return mapHistoriqueDTOToHistoryEvent(created);
  },

  async deleteHistoryEvent(id: string): Promise<boolean> {
    try {
      await historiqueService.remove(Number(id));
      return true;
    } catch {
      return false;
    }
  },

  // ========== WEIGHT RECORDS ==========
  async getWeightRecords(lotId?: string): Promise<WeightRecord[]> {
    try {
      const animals = await this.getAnimals(lotId);
      const withWeight = animals.filter((a) => a.weight !== undefined && a.weight > 0);
      if (withWeight.length > 0) {
        return withWeight.map((a) => ({
          id: a.id,
          lotId: a.lotId,
          date: a.createdAt || new Date().toISOString().split('T')[0],
          averageWeight: a.weight || 1.8,
          responsible: 'Agent Vétérinaire',
          createdAt: a.createdAt || new Date().toISOString(),
        }));
      }

      // Fallback vers l'historique
      const history = await this.getHistory(lotId);
      return history
        .filter((h) => h.title?.toLowerCase().includes('poids') || h.description?.toLowerCase().includes('poids'))
        .map((h) => ({
          id: h.id,
          lotId: h.lotId,
          date: h.date,
          averageWeight: 1.8,
          responsible: h.responsible,
          createdAt: h.createdAt,
        }));
    } catch {
      return [];
    }
  },

  // ========== WORKFLOW ==========
  async getWorkflow(): Promise<WorkflowStep[]> {
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
    const lot = await this.getLotById(lotId);
    if (!lot) return undefined;
    if (!this.canGoToNextStep(lot)) return undefined;

    const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === lot.status);
    if (currentStepIndex === -1 || currentStepIndex >= WORKFLOW_STEPS.length - 1) return undefined;

    const nextStep = WORKFLOW_STEPS[currentStepIndex + 1];
    const updated = await this.updateLot(lotId, { status: nextStep.id });

    // Consigner l'action dans le backend historiques
    try {
      await this.createHistoryEvent({
        action: `Passage à l'étape : ${nextStep.label}`,
        eventDate: new Date().toISOString(),
        details: nextStep.description,
        lotId,
      });
    } catch {
      // Tolérance audit
    }

    return updated;
  },

  async transferToProduction(lotId: string): Promise<{ elevageLot: Lot; productionLot: any } | undefined> {
    const lot = await this.getLotById(lotId);
    if (!lot) return undefined;

    const transferDate = new Date().toISOString().split('T')[0];
    const updated = await this.updateLot(lotId, { status: LotStatus.TRANSFERE_PRODUCTION });

    try {
      await this.createHistoryEvent({
        action: 'Transfert vers la Production',
        eventDate: new Date().toISOString(),
        details: 'Lot transféré vers le module Production',
        lotId,
      });
    } catch {
      // Continue
    }

    // Déclencher la synchro automatique côté module production
    try {
      await productionService.syncFromElevage();
    } catch {
      // Continue
    }

    return {
      elevageLot: updated || lot,
      productionLot: {
        id: `PROD-${lotId}`,
        lotNumber: lot.lotNumber,
        elevageLotId: lotId,
        name: lot.name,
        status: 'En attente d\'abattage',
        arrivalDate: transferDate,
        chickCount: lot.chickCount,
        responsible: lot.responsible,
      },
    };
  },
};
