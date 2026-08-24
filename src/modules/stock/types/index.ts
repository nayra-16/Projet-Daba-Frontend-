// ============================================================
// Enums
// ============================================================
export enum StockMovementType {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
  TRANSFERT = 'TRANSFERT',
}

export enum StockAlertLevel {
  CRITIQUE = 'CRITIQUE',
  FAIBLE = 'FAIBLE',
  NORMAL = 'NORMAL',
  ELEVE = 'ELEVE',
}

// ============================================================
// Stock (Produit fini en stock)
// ============================================================
export interface Stock {
  id: string;
  finishedProductId?: string;
  productName: string;
  lotNumber: string;
  category: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityMinimum: number;
  weightKg: number;
  unit: string;
  unitPrice?: number;
  dateEntree: string;
  datePeremption?: string;
  location?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Stock Movement
// ============================================================
export interface StockMovement {
  id: string;
  stockId: string;
  productName: string;
  lotNumber: string;
  movementType: StockMovementType;
  quantity: number;
  weightKg?: number;
  movementDate: string;
  movementTime?: string;
  reference?: string;
  reason?: string;
  responsible: string;
  observations?: string;
  createdAt: string;
}

// ============================================================
// Raw Material
// ============================================================
export interface RawMaterial {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Inventory
// ============================================================
export interface Inventory {
  id: string;
  stockId: string;
  productName: string;
  lotNumber: string;
  inventoryDate: string;
  theoreticalQuantity: number;
  actualQuantity: number;
  gap: number;
  responsible: string;
  status: 'CONFORME' | 'EXCEDENT' | 'DEFICIT';
  observations?: string;
  createdAt: string;
}

// ============================================================
// Stock Alert
// ============================================================
export interface StockAlert {
  id: string;
  stockId?: string;
  productName?: string;
  rawMaterialId?: string;
  rawMaterialName?: string;
  alertType: string;
  alertLevel: StockAlertLevel;
  message: string;
  thresholdValue?: number;
  currentValue?: number;
  alertDate: string;
  resolved: boolean;
  resolvedBy?: string;
  createdAt: string;
}

// ============================================================
// Dashboard
// ============================================================
export interface StockDashboardStats {
  totalFinishedProducts: number;
  totalRawMaterials: number;
  lowStockCount: number;
  criticalAlertCount: number;
  totalAlerts: number;
  totalStockValueEur: number;
  todayEntries: number;
  todayExits: number;
  totalWeightKg: number;

  categoryDistribution: { name: string; value: number; color: string }[];
  weeklyMovements: { date: string; entrees: number; sorties: number }[];
  topProducts: { productName: string; quantity: number; status: string }[];
  recentAlerts: { message: string; level: string; alertType: string }[];
}
