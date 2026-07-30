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
} from '../types';
import { ProductionDashboardStats, MOCK_PRODUCTION_DASHBOARD } from '../mocks/productionDashboard.mock';

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
  async getDashboard(): Promise<ProductionDashboardStats> {
    try {
      const resp = await axiosInstance.get('/production/dashboard/stats');
      const data = unwrap<any>(resp);
      if (!data) {
        return MOCK_PRODUCTION_DASHBOARD;
      }
      // Merge with mock defaults for chart fallback fields
      return {
        ...MOCK_PRODUCTION_DASHBOARD,
        receivedToday: Number(data.receivedToday ?? 0),
        waitingLots: Number(data.waitingLots ?? 0),
        inSlaughter: Number(data.inSlaughter ?? 0),
        inCutting: Number(data.inCutting ?? 0),
        inProcessing: Number(data.inProcessing ?? 0),
        inPackaging: Number(data.inPackaging ?? 0),
        inQualityCheck: Number(data.inQualityCheck ?? 0),
        finishedProducts: Number(data.finishedProducts ?? 0),
        rejectedProducts: Number(data.rejectedProducts ?? 0),
        dailyProductionKg: Number(data.dailyProductionKg ?? 0),
        monthlyProductionKg: Number(data.monthlyProductionKg ?? 0),
        averageProductionTimeHours: Number(data.averageProductionTimeHours ?? 4.8),
        dailyProduction: data.dailyProduction || MOCK_PRODUCTION_DASHBOARD.dailyProduction,
        monthlyProduction: data.monthlyProduction || MOCK_PRODUCTION_DASHBOARD.monthlyProduction,
        productDistribution: data.productDistribution || MOCK_PRODUCTION_DASHBOARD.productDistribution,
        averageTimePerStep: data.averageTimePerStep || MOCK_PRODUCTION_DASHBOARD.averageTimePerStep,
        yieldRate: data.yieldRate || MOCK_PRODUCTION_DASHBOARD.yieldRate,
      };
    } catch (err) {
      console.error('[productionService] getDashboard error:', err);
      return MOCK_PRODUCTION_DASHBOARD;
    }
  },

  async getAllLots(): Promise<ProductionLot[]> {
    try {
      const resp = await axiosInstance.get('/production/lots');
      const data = unwrap<any[]>(resp) || [];
      return data.map(mapLot);
    } catch (err) {
      console.error('[productionService] getAllLots error:', err);
      return [];
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
      return raw.map(mapLot);
    } catch (err) {
      console.error('[productionService] getLotsByStep error:', err);
      return [];
    }
  },

  async getLotById(id: string): Promise<ProductionLot | undefined> {
    try {
      const resp = await axiosInstance.get(`/production/lots/${id}`);
      const raw = unwrap<any>(resp);
      return raw ? mapLot(raw) : undefined;
    } catch (err) {
      console.error('[productionService] getLotById error:', err);
      return undefined;
    }
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
};
