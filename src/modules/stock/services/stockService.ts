import axiosInstance from '../../../core/api/axios';
import {
  Stock,
  StockMovement,
  RawMaterial,
  Inventory,
  StockAlert,
  StockDashboardStats,
} from '../types';

function unwrap<T>(response: any): T {
  const body = response?.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

function toIdString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toIsoDate(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.substring(0, 10);
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value).substring(0, 10);
}

function toTimeHHmm(value: any): string | undefined {
  if (!value) return undefined;
  const s = String(value);
  return s.length >= 5 ? s.substring(0, 5) : s;
}

function mapStock(raw: any): Stock {
  return {
    id: toIdString(raw.id),
    finishedProductId: raw.finishedProductId !== null && raw.finishedProductId !== undefined ? toIdString(raw.finishedProductId) : undefined,
    productName: raw.productName ?? '',
    lotNumber: raw.lotNumber ?? '',
    category: raw.category ?? '',
    quantityAvailable: Number(raw.quantityAvailable ?? 0),
    quantityReserved: Number(raw.quantityReserved ?? 0),
    quantityMinimum: Number(raw.quantityMinimum ?? 0),
    weightKg: Number(raw.weightKg ?? 0),
    unit: raw.unit ?? '',
    unitPrice: raw.unitPrice !== null && raw.unitPrice !== undefined ? Number(raw.unitPrice) : undefined,
    dateEntree: toIsoDate(raw.dateEntree),
    datePeremption: raw.datePeremption ? toIsoDate(raw.datePeremption) : undefined,
    location: raw.location ?? undefined,
    observations: raw.observations ?? undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : '',
  };
}

function mapMovement(raw: any): StockMovement {
  return {
    id: toIdString(raw.id),
    stockId: toIdString(raw.stockId),
    productName: raw.productName ?? '',
    lotNumber: raw.lotNumber ?? '',
    movementType: raw.movementType as any,
    quantity: Number(raw.quantity ?? 0),
    weightKg: raw.weightKg !== null && raw.weightKg !== undefined ? Number(raw.weightKg) : undefined,
    movementDate: toIsoDate(raw.movementDate),
    movementTime: toTimeHHmm(raw.movementTime),
    reference: raw.reference ?? undefined,
    reason: raw.reason ?? undefined,
    responsible: raw.responsible ?? '',
    observations: raw.observations ?? undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
  };
}

function mapInventory(raw: any): Inventory {
  return {
    id: toIdString(raw.id),
    stockId: toIdString(raw.stockId),
    productName: raw.productName ?? '',
    lotNumber: raw.lotNumber ?? '',
    inventoryDate: toIsoDate(raw.inventoryDate),
    theoreticalQuantity: Number(raw.theoreticalQuantity ?? 0),
    actualQuantity: Number(raw.actualQuantity ?? 0),
    gap: Number(raw.gap ?? 0),
    responsible: raw.responsible ?? '',
    status: (raw.status ?? 'CONFORME') as any,
    observations: raw.observations ?? undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
  };
}

function mapRawMaterial(raw: any): RawMaterial {
  return {
    id: toIdString(raw.id),
    name: raw.name ?? '',
    category: raw.category ?? '',
    reference: raw.reference ?? undefined,
    supplier: raw.supplier ?? undefined,
    quantityAvailable: Number(raw.quantityAvailable ?? 0),
    quantityMinimum: Number(raw.quantityMinimum ?? 0),
    unit: raw.unit ?? '',
    unitPrice: raw.unitPrice !== null && raw.unitPrice !== undefined ? Number(raw.unitPrice) : undefined,
    dateReception: raw.dateReception ? toIsoDate(raw.dateReception) : undefined,
    datePeremption: raw.datePeremption ? toIsoDate(raw.datePeremption) : undefined,
    location: raw.location ?? undefined,
    observations: raw.observations ?? undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : '',
  };
}

function mapAlert(raw: any): StockAlert {
  return {
    id: toIdString(raw.id),
    stockId: raw.stockId !== null && raw.stockId !== undefined ? toIdString(raw.stockId) : undefined,
    productName: raw.productName ?? undefined,
    rawMaterialId: raw.rawMaterialId !== null && raw.rawMaterialId !== undefined ? toIdString(raw.rawMaterialId) : undefined,
    rawMaterialName: raw.rawMaterialName ?? undefined,
    alertType: raw.alertType ?? '',
    alertLevel: raw.alertLevel as any,
    message: raw.message ?? '',
    thresholdValue: raw.thresholdValue !== null && raw.thresholdValue !== undefined ? Number(raw.thresholdValue) : undefined,
    currentValue: raw.currentValue !== null && raw.currentValue !== undefined ? Number(raw.currentValue) : undefined,
    alertDate: toIsoDate(raw.alertDate),
    resolved: Boolean(raw.resolved),
    resolvedBy: raw.resolvedBy ?? undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
  };
}

function mapDashboard(raw: any): StockDashboardStats {
  return {
    totalFinishedProducts: Number(raw.totalFinishedProducts ?? 0),
    totalRawMaterials: Number(raw.totalRawMaterials ?? 0),
    lowStockCount: Number(raw.lowStockCount ?? 0),
    criticalAlertCount: Number(raw.criticalAlertCount ?? 0),
    totalAlerts: Number(raw.totalAlerts ?? 0),
    totalStockValueEur: Number(raw.totalStockValueEur ?? 0),
    todayEntries: Number(raw.todayEntries ?? 0),
    todayExits: Number(raw.todayExits ?? 0),
    totalWeightKg: Number(raw.totalWeightKg ?? 0),
    categoryDistribution: Array.isArray(raw.categoryDistribution)
      ? raw.categoryDistribution.map((c: any) => ({
          name: c.name ?? '',
          value: Number(c.value ?? 0),
          color: c.color ?? '',
        }))
      : [],
    weeklyMovements: Array.isArray(raw.weeklyMovements)
      ? raw.weeklyMovements.map((w: any) => ({
          date: w.date ?? '',
          entrees: Number(w.entrees ?? 0),
          sorties: Number(w.sorties ?? 0),
        }))
      : [],
    topProducts: Array.isArray(raw.topProducts)
      ? raw.topProducts.map((p: any) => ({
          productName: p.productName ?? '',
          quantity: Number(p.quantity ?? 0),
          status: p.status ?? '',
        }))
      : [],
    recentAlerts: Array.isArray(raw.recentAlerts)
      ? raw.recentAlerts.map((a: any) => ({
          message: a.message ?? '',
          level: a.level ?? '',
          alertType: a.alertType ?? '',
        }))
      : [],
  };
}

export const stockService = {

  // -------------------------------------------------------
  // Dashboard
  // -------------------------------------------------------
  async getDashboard(): Promise<StockDashboardStats> {
    const res = await axiosInstance.get('/stocks/dashboard');
    return mapDashboard(unwrap<any>(res));
  },

  // -------------------------------------------------------
  // Stocks — Produits finis CRUD
  // -------------------------------------------------------
  async getAllStocks(): Promise<Stock[]> {
    const res = await axiosInstance.get('/stocks');
    const data = unwrap<any[]>(res) ?? [];
    return Array.isArray(data) ? data.map(mapStock) : [];
  },

  async getStockById(id: string | number): Promise<Stock> {
    const res = await axiosInstance.get(`/stocks/${id}`);
    return mapStock(unwrap<any>(res));
  },

  async createStock(data: {
    finishedProductId?: number;
    productName: string;
    lotNumber: string;
    category: string;
    quantityAvailable: number;
    quantityReserved?: number;
    quantityMinimum: number;
    weightKg?: number;
    unit: string;
    unitPrice?: number;
    dateEntree?: string;
    datePeremption?: string;
    location?: string;
    observations?: string;
  }): Promise<Stock> {
    const res = await axiosInstance.post('/stocks', data);
    return mapStock(unwrap<any>(res));
  },

  async updateStock(id: string | number, data: {
    finishedProductId?: number;
    productName: string;
    lotNumber: string;
    category: string;
    quantityAvailable: number;
    quantityReserved?: number;
    quantityMinimum: number;
    weightKg?: number;
    unit: string;
    unitPrice?: number;
    dateEntree?: string;
    datePeremption?: string;
    location?: string;
    observations?: string;
  }): Promise<Stock> {
    const res = await axiosInstance.put(`/stocks/${id}`, data);
    return mapStock(unwrap<any>(res));
  },

  async deleteStock(id: string | number): Promise<void> {
    await axiosInstance.delete(`/stocks/${id}`);
  },

  // -------------------------------------------------------
  // Stock Movements
  // -------------------------------------------------------
  async getAllMovements(): Promise<StockMovement[]> {
    const res = await axiosInstance.get('/stocks/movements');
    const data = unwrap<any[]>(res) ?? [];
    return Array.isArray(data) ? data.map(mapMovement) : [];
  },

  async stockIn(data: {
    stockId: number;
    quantity: number;
    weightKg?: number;
    movementDate: string;
    movementTime?: string;
    reference?: string;
    reason?: string;
    responsible: string;
    observations?: string;
  }): Promise<StockMovement> {
    const payload = { ...data, movementType: 'ENTREE' };
    const res = await axiosInstance.post('/stocks/in', payload);
    return mapMovement(unwrap<any>(res));
  },

  async stockOut(data: {
    stockId: number;
    quantity: number;
    weightKg?: number;
    movementDate: string;
    movementTime?: string;
    reference?: string;
    reason?: string;
    responsible: string;
    observations?: string;
  }): Promise<StockMovement> {
    const payload = { ...data, movementType: 'SORTIE' };
    const res = await axiosInstance.post('/stocks/out', payload);
    return mapMovement(unwrap<any>(res));
  },

  // -------------------------------------------------------
  // Inventory
  // -------------------------------------------------------
  async getAllInventories(): Promise<Inventory[]> {
    const res = await axiosInstance.get('/stocks/inventory');
    const data = unwrap<any[]>(res) ?? [];
    return Array.isArray(data) ? data.map(mapInventory) : [];
  },

  async createInventory(data: {
    stockId: number;
    inventoryDate: string;
    theoreticalQuantity: number;
    actualQuantity: number;
    responsible: string;
    observations?: string;
  }): Promise<Inventory> {
    const res = await axiosInstance.post('/stocks/inventory', data);
    return mapInventory(unwrap<any>(res));
  },

  // -------------------------------------------------------
  // Alerts
  // -------------------------------------------------------
  async getAllAlerts(): Promise<StockAlert[]> {
    const res = await axiosInstance.get('/stocks/alerts');
    const data = unwrap<any[]>(res) ?? [];
    return Array.isArray(data) ? data.map(mapAlert) : [];
  },

  // -------------------------------------------------------
  // Raw Materials
  // -------------------------------------------------------
  async getAllRawMaterials(): Promise<RawMaterial[]> {
    const res = await axiosInstance.get('/stocks/raw-materials');
    const data = unwrap<any[]>(res) ?? [];
    return Array.isArray(data) ? data.map(mapRawMaterial) : [];
  },

  async createRawMaterial(data: {
    name: string;
    category: string;
    reference?: string;
    supplier?: string;
    quantityAvailable: number;
    quantityMinimum: number;
    unit: string;
    unitPrice?: number;
    dateReception?: string;
    datePeremption?: string;
    location?: string;
    observations?: string;
  }): Promise<RawMaterial> {
    const res = await axiosInstance.post('/stocks/raw-materials', data);
    return mapRawMaterial(unwrap<any>(res));
  },
};
