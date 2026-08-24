import axiosInstance from '../../../core/api/axios';
import {
  ProductionLot,
  ProductionStep,
  QualityStatus,
  FinishedProduct,
  SlaughterDetails,
  CuttingDetails,
  ProcessingDetails,
  PackagingDetails,
  QualityDetails,
  ProductionHistoryEvent,
  ProductionOrder,
  ProductionRecipe,
  ProductionLoss,
  NonConformity,
  ChambreFroide,
} from '../types';
import { ProductionDashboardDTO } from '../../../core/types/api';

// ============================================================
// Enum mapping: Backend status → Frontend ProductionStep
// ============================================================
const STATUS_BACKEND_TO_FRONTEND: Record<string, ProductionStep> = {
  RECEPTION: ProductionStep.RECEPTION,
  ATTENTE_ABATTAGE: ProductionStep.ATTENTE_ABATTAGE,
  ABATTAGE_TERMINE: ProductionStep.ABATTAGE_TERMINE,
  DECOUPE_TERMINEE: ProductionStep.DECOUPE_TERMINEE,
  TRANSFORMATION: ProductionStep.TRANSFORMATION,
  CONDITIONNEMENT: ProductionStep.CONDITIONNEMENT,
  CONTROLE_QUALITE: ProductionStep.CONTROLE_QUALITE,
  PRODUIT_TERMINE: ProductionStep.PRODUIT_TERMINE,
  STOCK: ProductionStep.STOCK,
};

const STATUS_FRONTEND_TO_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_BACKEND_TO_FRONTEND).map(([k, v]) => [v, k])
);

const QUALITY_BACKEND_TO_FRONTEND: Record<string, QualityStatus> = {
  PENDING: QualityStatus.PENDING,
  PASSED: QualityStatus.PASSED,
  FAILED: QualityStatus.FAILED,
};

// ============================================================
// Helpers
// ============================================================
function toIdString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toTimeHHmm(value: string | undefined | null): string {
  if (!value) return '00:00';
  return value.length >= 5 ? value.substring(0, 5) : value;
}

function unwrap<T>(response: any): T {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

function toIsoDate(d: any): string {
  if (!d) return new Date().toISOString().split('T')[0];
  if (typeof d === 'string') return d.substring(0, 10);
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d);
}

function toBackendTimeHHmmss(t: string | undefined): string {
  if (!t) return '00:00:00';
  const clean = t.length >= 5 ? t.substring(0, 5) : t;
  return clean.length === 5 ? `${clean}:00` : clean;
}

// ============================================================
// Object mapping: Backend DTO → Frontend interfaces
// ============================================================
function mapLot(raw: any): ProductionLot {
  const elevageLotNumber = raw.elevageLotNumber || raw.elevage_lot_number || '';
  const defaultName = raw.name || elevageLotNumber || `Lot ${raw.id}`;
  return {
    id: toIdString(raw.id),
    elevageLotId: toIdString(raw.elevageLotId),
    elevageLotNumber,
    name: defaultName,
    quantity: Number(raw.quantity || 0),
    weight: Number(raw.weight || 0),
    dateFabrication: toIsoDate(raw.dateFabrication),
    dateLimite: raw.dateLimite ? toIsoDate(raw.dateLimite) : undefined,
    responsible: raw.responsible || 'Inconnu',
    status: STATUS_BACKEND_TO_FRONTEND[raw.status] || ProductionStep.RECEPTION,
    qualityStatus: QUALITY_BACKEND_TO_FRONTEND[raw.qualityStatus] || QualityStatus.PENDING,
    observations: raw.observations ?? undefined,
    history: Array.isArray(raw.history) ? raw.history.map(mapHistory) : [],
    createdAt: toIsoDate(raw.createdAt),
    updatedAt: toIsoDate(raw.updatedAt),
    slaughterDetails: raw.slaughter ? mapSlaughterDetails(raw.slaughter) : undefined,
    cuttingDetails: raw.cutting ? mapCuttingDetails(raw.cutting) : undefined,
    processingDetails: raw.processing ? mapProcessingDetails(raw.processing) : undefined,
    packagingDetails: raw.packaging ? mapPackagingDetails(raw.packaging) : undefined,
    qualityDetails: raw.qualityCheck ? mapQualityDetails(raw.qualityCheck) : undefined,
    chambreFroideId: raw.chambreFroideId ?? undefined,
    dlc: raw.dlc ? toIsoDate(raw.dlc) : undefined,
    perteReason: raw.perteReason ?? undefined,
    perteIncidentId: raw.perteIncidentId ?? undefined,
    perteDate: raw.perteDate ? toIsoDate(raw.perteDate) : undefined,
  } as any;
}

function mapHistory(raw: any): ProductionHistoryEvent {
  return {
    id: toIdString(raw.id),
    date: toIsoDate(raw.eventDate || raw.date),
    time: toTimeHHmm(raw.eventTime || raw.time),
    step: STATUS_BACKEND_TO_FRONTEND[raw.step] ?? ProductionStep.RECEPTION,
    responsible: raw.responsible || 'Inconnu',
    comment: raw.comment ?? undefined,
  };
}

function mapSlaughterDetails(raw: any): SlaughterDetails {
  return {
    date: toIsoDate(raw.slaughterDate),
    time: toTimeHHmm(raw.slaughterTime),
    responsible: raw.responsible,
    quantityReceived: Number(raw.quantityReceived || 0),
    quantitySlaughtered: Number(raw.quantitySlaughtered || 0),
    losses: Number(raw.losses || 0),
    lossesReason: raw.lossesReason ?? undefined,
    observations: raw.observations ?? undefined,
  };
}

function mapCuttingDetails(raw: any): CuttingDetails {
  return {
    date: toIsoDate(raw.cuttingDate),
    responsible: raw.responsible,
    pieces: raw.pieces || {
      pouletEntier: { quantity: 0, weight: 0 },
      cuisses: { quantity: 0, weight: 0 },
      pilons: { quantity: 0, weight: 0 },
      ailes: { quantity: 0, weight: 0 },
      blancs: { quantity: 0, weight: 0 },
      foies: { quantity: 0, weight: 0 },
      gesiers: { quantity: 0, weight: 0 },
      autres: { quantity: 0, weight: 0 },
    },
  };
}

function mapProcessingDetails(raw: any): ProcessingDetails {
  return {
    productName: raw.productName,
    quantity: Number(raw.quantity || 0),
    weight: Number(raw.weight || 0),
    date: toIsoDate(raw.processingDate),
    responsible: raw.responsible,
    observations: raw.observations ?? undefined,
  };
}

function mapPackagingDetails(raw: any): PackagingDetails {
  return {
    packagingType: raw.packagingType || 'Standard',
    quantity: Number(raw.quantity || 0),
    weight: Number(raw.weight || 0),
    date: toIsoDate(raw.packagingDate),
    responsible: raw.responsible,
    productionLotNumber: raw.productionLotNumber,
  };
}

function mapQualityDetails(raw: any): QualityDetails {
  return {
    visualControl: (raw.visualControl || 'EN_ATTENTE') as any,
    weightControl: (raw.weightControl || 'EN_ATTENTE') as any,
    temperatureControl: (raw.temperatureControl || 'EN_ATTENTE') as any,
    conformity: (raw.conformity || 'EN_ATTENTE') as any,
    comments: raw.comments ?? undefined,
    date: toIsoDate(raw.controlDate),
    responsible: raw.responsible,
  };
}

function mapFinishedProduct(raw: any): FinishedProduct {
  return {
    id: toIdString(raw.id),
    productName: raw.productName,
    lotNumber: raw.lotNumber,
    elevageLotNumber: raw.elevageLotNumber || '',
    dateFabrication: toIsoDate(raw.dateFabrication),
    dateLimite: toIsoDate(raw.dateLimite),
    quantity: Number(raw.quantity || 0),
    weight: Number(raw.weight || 0),
    status: (raw.status || 'En stock') as any,
    stock: Number(raw.stock || 0),
  };
}

// ============================================================
// Service API
// ============================================================
export const productionService = {
  async getDashboard(): Promise<ProductionDashboardDTO> {
    const defaultStats: ProductionDashboardDTO = {
      lotsEnCours: 0,
      poidsTraite: 0,
      produitsFinis: 0,
      rendementMoyen: 0,
      controlesReussis: 0,
      rejets: 0,
    };

    try {
      const resp = await axiosInstance.get('/production/dashboard/stats');
      const data = unwrap<any>(resp);
      if (!data) {
        return defaultStats;
      }
      return {
        lotsEnCours: Number(data.lotsEnCours ?? 0),
        poidsTraite: Number(data.poidsTraite ?? 0),
        produitsFinis: Number(data.produitsFinis ?? 0),
        rendementMoyen: Number(data.rendementMoyen ?? 0),
        controlesReussis: Number(data.controlesReussis ?? 0),
        rejets: Number(data.rejets ?? 0),
      };
    } catch (err) {
      console.error('[productionService] getDashboard error:', err);
      return defaultStats;
    }
  },

  async getChambresFroides(): Promise<ChambreFroide[]> {
    const raw = localStorage.getItem('daba_chambres_froides');
    if (raw) {
      return JSON.parse(raw);
    }
    const mockChambres: ChambreFroide[] = [
      { id: '1', name: 'CF-01 (Matières premières)', capacityUnit: 'kg', minTemp: 2, maxTemp: 5, currentTemp: 3, status: 'Disponible', capacity: 1000, currentLoad: 800 },
      { id: '2', name: 'CF-02 (Produits finis)', capacityUnit: 'kg', minTemp: -20, maxTemp: -18, currentTemp: -18, status: 'Occupée', capacity: 1500, currentLoad: 1450 },
      { id: '3', name: 'CF-03 (Congélation rapide)', capacityUnit: 'kg', minTemp: -30, maxTemp: -25, currentTemp: -28, status: 'Disponible', capacity: 500, currentLoad: 200 },
      { id: '4', name: 'CF-04 (Découpe)', capacityUnit: 'kg', minTemp: 0, maxTemp: 4, currentTemp: 10, status: 'En maintenance', capacity: 800, currentLoad: 0 },
      { id: '5', name: 'CF-05 (Sauvegarde)', capacityUnit: 'kg', minTemp: -18, maxTemp: -15, currentTemp: 0, status: 'En panne', capacity: 600, currentLoad: 0 },
      { id: '6', name: 'CF-06 (Export)', capacityUnit: 'kg', minTemp: -22, maxTemp: -18, currentTemp: -19, status: 'Occupée', capacity: 2000, currentLoad: 1900 },
    ];
    localStorage.setItem('daba_chambres_froides', JSON.stringify(mockChambres));
    return mockChambres;
  },

  async saveChambreFroide(chambre: ChambreFroide): Promise<ChambreFroide> {
    const chambres = await this.getChambresFroides();
    const index = chambres.findIndex(c => c.id === chambre.id);
    if (index >= 0) {
      chambres[index] = chambre;
    } else {
      chambres.push(chambre);
    }
    localStorage.setItem('daba_chambres_froides', JSON.stringify(chambres));
    return chambre;
  },

  async getIncidents(): Promise<Incident[]> {
    const raw = localStorage.getItem('daba_incidents_froid');
    return raw ? JSON.parse(raw) : [];
  },

  async saveIncident(incident: Incident): Promise<Incident> {
    const incidents = await this.getIncidents();
    const index = incidents.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      incidents[index] = incident;
    } else {
      incidents.push(incident);
    }
    localStorage.setItem('daba_incidents_froid', JSON.stringify(incidents));
    return incident;
  },

  _getLotExtras(id: string) {
    const extras = JSON.parse(localStorage.getItem('daba_lots_extras') || '{}');
    return extras[id] || {};
  },

  _saveLotExtra(id: string, extra: any) {
    const extras = JSON.parse(localStorage.getItem('daba_lots_extras') || '{}');
    extras[id] = { ...extras[id], ...extra };
    localStorage.setItem('daba_lots_extras', JSON.stringify(extras));
  },

  _applyExtras(lot: ProductionLot): ProductionLot {
    const extras = this._getLotExtras(lot.id);
    return { ...lot, ...extras };
  },

  async getAllLots(): Promise<ProductionLot[]> {
    try {
      const resp = await axiosInstance.get('/production/lots');
      const data = unwrap<any[]>(resp) || [];
      return data.map(mapLot).map(l => this._applyExtras(l));
    } catch (err) {
      console.error('[productionService] getAllLots error:', err);
      // Fallback
      const fallback = localStorage.getItem('daba_mock_lots_fallback');
      return fallback ? JSON.parse(fallback).map((l:any) => this._applyExtras(l)) : [];
    }
  },

  async getReceivedLots(): Promise<ProductionLot[]> {
    try {
      const resp = await axiosInstance.get('/production/lots/received');
      const data = unwrap<any[]>(resp) || [];
      return data.map(mapLot);
    } catch (err) {
      console.error('[productionService] getReceivedLots error:', err);
      return [];
    }
  },

  async getLotsByStep(step: ProductionStep): Promise<ProductionLot[]> {
    try {
      const backendStatus = STATUS_FRONTEND_TO_BACKEND[step];
      let raw: any[] = [];
      if (backendStatus) {
        const resp = await axiosInstance.get(`/production/lots`, { params: { status: backendStatus } });
        raw = unwrap<any[]>(resp) || [];
      } else {
        // Fallback: fetch all then filter client-side
        const resp = await axiosInstance.get(`/production/lots`);
        raw = (unwrap<any[]>(resp) || []).filter((r) => STATUS_BACKEND_TO_FRONTEND[r.status] === step);
      }
      return raw.map(mapLot).map(l => this._applyExtras(l));
    } catch (err) {
      console.error('[productionService] getLotsByStep error:', err);
      return [];
    }
  },

  async getLotById(id: string): Promise<ProductionLot | undefined> {
    try {
      const resp = await axiosInstance.get(`/production/lots/${id}`);
      const raw = unwrap<any>(resp);
      return raw ? this._applyExtras(mapLot(raw)) : undefined;
    } catch (err) {
      console.error('[productionService] getLotById error:', err);
      // Fallback
      const fallback = localStorage.getItem('daba_mock_lots_fallback');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        const lot = parsed.find((l:any) => l.id == id);
        if (lot) return this._applyExtras(lot);
      }
      return undefined;
    }
  },

  async updateLotExtras(id: string, updates: Partial<ProductionLot>): Promise<void> {
    this._saveLotExtra(id, updates);
  },

  async updateLotStatus(
    id: string,
    newStatus: ProductionStep,
    responsible: string,
    comment?: string
  ): Promise<ProductionLot | undefined> {
    try {
      const backendStatus = STATUS_FRONTEND_TO_BACKEND[newStatus];
      if (!backendStatus) {
        throw new Error(`Statut frontend inconnu: ${newStatus}`);
      }
      const resp = await axiosInstance.put(`/production/lots/${id}/status`, {
        status: backendStatus,
        responsible,
        comment,
      });
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] updateLotStatus error:', err);
      throw err;
    }
  },

  async startSlaughter(lotId: string, details: SlaughterDetails): Promise<ProductionLot | undefined> {
    try {
      const payload = {
        productionLotId: Number(lotId),
        slaughterDate: toIsoDate(details.date),
        slaughterTime: toBackendTimeHHmmss(details.time),
        responsible: details.responsible,
        quantityReceived: Number(details.quantityReceived || 0),
        quantitySlaughtered: Number(details.quantitySlaughtered || 0),
        losses: Number(details.losses || 0),
        lossesReason: details.lossesReason || null,
        observations: details.observations || null,
      };
      const resp = await axiosInstance.post('/production/slaughter', payload);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] startSlaughter error:', err);
      throw err;
    }
  },

  async saveCutting(lotId: string, details: CuttingDetails): Promise<ProductionLot | undefined> {
    try {
      const payload = {
        productionLotId: Number(lotId),
        cuttingDate: toIsoDate(details.date),
        responsible: details.responsible,
        pieces: details.pieces,
      };
      const resp = await axiosInstance.post('/production/cutting', payload);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] saveCutting error:', err);
      throw err;
    }
  },

  async saveProcessing(lotId: string, details: ProcessingDetails): Promise<ProductionLot | undefined> {
    try {
      const payload = {
        productionLotId: Number(lotId),
        productName: details.productName,
        quantity: Number(details.quantity || 0),
        weight: Number(details.weight || 0),
        processingDate: toIsoDate(details.date),
        responsible: details.responsible,
        observations: details.observations || null,
      };
      const resp = await axiosInstance.post('/production/processing', payload);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] saveProcessing error:', err);
      throw err;
    }
  },

  async savePackaging(lotId: string, details: PackagingDetails): Promise<ProductionLot | undefined> {
    try {
      const payload = {
        productionLotId: Number(lotId),
        packagingType: details.packagingType || null,
        quantity: Number(details.quantity || 0),
        weight: Number(details.weight || 0),
        packagingDate: toIsoDate(details.date),
        responsible: details.responsible,
        productionLotNumber: details.productionLotNumber || null,
      };
      const resp = await axiosInstance.post('/production/packaging', payload);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] savePackaging error:', err);
      throw err;
    }
  },

  async validateQuality(lotId: string, details: QualityDetails): Promise<ProductionLot | undefined> {
    try {
      const payload = {
        productionLotId: Number(lotId),
        visualControl: details.visualControl,
        weightControl: details.weightControl,
        temperatureControl: details.temperatureControl,
        conformity: details.conformity,
        comments: details.comments || null,
        controlDate: toIsoDate(details.date),
        responsible: details.responsible,
      };
      const resp = await axiosInstance.post('/production/quality', payload);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] validateQuality error:', err);
      throw err;
    }
  },

  async transferToStock(lotId: string): Promise<FinishedProduct | undefined> {
    try {
      const resp = await axiosInstance.post(`/production/lots/${lotId}/transfer-to-stock`);
      const raw = unwrap<any>(resp);
      return raw ? mapFinishedProduct(raw) : undefined;
    } catch (err) {
      console.error('[productionService] transferToStock error:', err);
      throw err;
    }
  },

  async getFinishedProducts(): Promise<FinishedProduct[]> {
    try {
      const resp = await axiosInstance.get('/production/finished-products');
      const data = unwrap<any[]>(resp) || [];
      return data.map(mapFinishedProduct);
    } catch (err) {
      console.error('[productionService] getFinishedProducts error:', err);
      return [];
    }
  },

  async getTimelineEvents(): Promise<any[]> {
    try {
      const resp = await axiosInstance.get('/production/history');
      const data = unwrap<any[]>(resp) || [];
      return data.map((raw) => {
        const history = mapHistory(raw);
        // Also include lot identifying info if returned
        return {
          ...history,
          lotId: toIdString(raw.productionLotId),
          elevageLotNumber: raw.elevageLotNumber || '',
          lotName: raw.lotName || '',
        };
      });
    } catch (err) {
      console.error('[productionService] getTimelineEvents error:', err);
      return [];
    }
  },

  // Sync with Elevage: call backend to automatically import TRANSFERE_PRODUCTION lots
  async syncFromElevage(): Promise<ProductionLot[]> {
    try {
      const resp = await axiosInstance.post('/production/lots/sync-from-elevage');
      const data = unwrap<any[]>(resp) || [];
      return data.map(mapLot);
    } catch (err) {
      console.error('[productionService] syncFromElevage error:', err);
      return [];
    }
  },

  // ============================================================
  // MOCKS FOR PHASE 2 (Local Storage / In-Memory)
  // ============================================================

  // --- Production Orders ---
  async getProductionOrders(): Promise<ProductionOrder[]> {
    const raw = localStorage.getItem('mock_production_orders');
    return raw ? JSON.parse(raw) : [];
  },

  async saveProductionOrder(order: ProductionOrder): Promise<ProductionOrder> {
    const orders = await this.getProductionOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem('mock_production_orders', JSON.stringify(orders));
    return order;
  },

  async deleteProductionOrder(id: string): Promise<void> {
    const orders = await this.getProductionOrders();
    const updated = orders.filter(o => o.id !== id);
    localStorage.setItem('mock_production_orders', JSON.stringify(updated));
  },

  // --- Recipes ---
  async getRecipes(): Promise<ProductionRecipe[]> {
    const raw = localStorage.getItem('mock_production_recipes');
    if (raw) return JSON.parse(raw);
    
    // Seed default recipes
    const defaults: ProductionRecipe[] = [
      {
        id: '1',
        productName: 'Merguez',
        ingredients: [
          { id: 'i1', name: 'Viande hachée', quantityPer100kg: 80, unit: 'kg' },
          { id: 'i2', name: 'Epices Merguez', quantityPer100kg: 5, unit: 'kg' },
          { id: 'i3', name: 'Glace/Eau', quantityPer100kg: 10, unit: 'kg' },
          { id: 'i4', name: 'Boyaux', quantityPer100kg: 5, unit: 'kg' }
        ],
        instructions: 'Broyage -> Mélange épices -> Poussage -> Séchage'
      },
      {
        id: '2',
        productName: 'Poulet fumé',
        ingredients: [
          { id: 'i1', name: 'Poulet entier', quantityPer100kg: 95, unit: 'kg' },
          { id: 'i2', name: 'Sel/Saumure', quantityPer100kg: 5, unit: 'L' }
        ],
        instructions: 'Saumurage 24h -> Fumage au bois de hêtre à 75°C'
      },
      {
        id: '3',
        productName: 'Cuisses marinées',
        ingredients: [
          { id: 'i1', name: 'Cuisses de poulet', quantityPer100kg: 90, unit: 'kg' },
          { id: 'i2', name: 'Marinade', quantityPer100kg: 10, unit: 'L' }
        ],
        instructions: 'Mélange viande et marinade -> Repos 12h en chambre froide'
      }
    ];
    localStorage.setItem('mock_production_recipes', JSON.stringify(defaults));
    return defaults;
  },

  async saveRecipe(recipe: ProductionRecipe): Promise<ProductionRecipe> {
    const recipes = await this.getRecipes();
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
    localStorage.setItem('mock_production_recipes', JSON.stringify(recipes));
    return recipe;
  },

  async deleteRecipe(id: string): Promise<void> {
    const recipes = await this.getRecipes();
    const updated = recipes.filter(r => r.id !== id);
    localStorage.setItem('mock_production_recipes', JSON.stringify(updated));
  },

  // --- Losses ---
  async getLosses(): Promise<ProductionLoss[]> {
    const raw = localStorage.getItem('mock_production_losses');
    return raw ? JSON.parse(raw) : [];
  },

  async saveLoss(loss: ProductionLoss): Promise<ProductionLoss> {
    const losses = await this.getLosses();
    losses.push(loss); // usually we just append losses
    localStorage.setItem('mock_production_losses', JSON.stringify(losses));
    return loss;
  },

  // --- Non-Conformities ---
  async getNonConformities(): Promise<NonConformity[]> {
    const raw = localStorage.getItem('mock_production_non_conformities');
    return raw ? JSON.parse(raw) : [];
  },

  async saveNonConformity(nc: NonConformity): Promise<NonConformity> {
    const ncs = await this.getNonConformities();
    const index = ncs.findIndex(n => n.id === nc.id);
    if (index >= 0) {
      ncs[index] = nc;
    } else {
      ncs.push(nc);
    }
    localStorage.setItem('mock_production_non_conformities', JSON.stringify(ncs));
    return nc;
  }
};
