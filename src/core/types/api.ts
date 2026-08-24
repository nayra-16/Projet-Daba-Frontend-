// ============================================================
// TYPES PARTAGÉS — Alignés 1:1 avec les DTOs backend
// ============================================================

// Réponse API générique du backend
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante
  size: number;
}

// =================== STOCK ===================
export interface StockDashboardDTO {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalMovements: number;
  criticalAlerts: number;
  // Certains backends exposent d'autres champs ; on reste permissif.
  [key: string]: any;
}

export interface StockResponse {
  id: number;
  productId: number;
  productName: string;
  productCategory?: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  status?: 'AVAILABLE' | 'LOW' | 'OUT' | string;
  lastUpdated?: string;
  location?: string;
  [key: string]: any;
}

export interface StockCreateRequest {
  productId: number;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  location?: string;
}

export interface StockMovementResponse {
  id: number;
  stockId: number;
  productName: string;
  type: 'IN' | 'OUT' | string;
  quantity: number;
  unit: string;
  reason: string;
  operator?: string;
  movementDate: string;
  [key: string]: any;
}

export interface StockMovementRequest {
  stockId: number;
  quantity: number;
  reason: string;
  operator?: string;
}

export interface StockAlertResponse {
  id: number;
  productName: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO' | string;
  message: string;
  currentStock: number;
  minStock: number;
  detectedAt: string;
  resolved: boolean;
  [key: string]: any;
}

export interface RawMaterialResponse {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  supplierName?: string;
  unitPrice: number;
  category?: string;
  [key: string]: any;
}

export interface RawMaterialCreateRequest {
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  supplierId?: number;
  category?: string;
}

export interface InventoryResponse {
  id: number;
  reference: string;
  date: string;
  status: 'OPEN' | 'CLOSED' | string;
  totalItems: number;
  totalValue: number;
  operator?: string;
  [key: string]: any;
}

export interface InventoryCreateRequest {
  reference: string;
  operator?: string;
}

// =================== FERME ===================
export interface FarmDTO {
  id?: any;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  region?: string;
  city?: string;
  type?: 'POULAILLER' | 'COUVOIR' | 'MIXTE' | string;
  capacity?: number;
  surface?: number;
  area?: number;
  manager?: string;
  ownerName?: string;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | string;
  createdAt?: string;
  [key: string]: any;
}

// =================== ÉLEVAGE ===================
export interface LotDTO {
  id?: any;
  name: string;
  quantity?: number;
  effectif?: number;
  arrivalDate?: string;
  startDate?: string;
  race?: string;
  status?: string;
  farmId?: number;
  poulaillerId?: number;
  [key: string]: any;
}

export interface PoulaillerDTO {
  id: any;
  name: string;
  capacity?: number;
  description?: string;
  farmId?: number;
  [key: string]: any;
}

export interface VaccinationDTO {
  id: any;
  name: string;
  vaccinationDate?: string;
  date?: string;
  description?: string;
  lotId?: any;
  [key: string]: any;
}

export interface AlimentationDTO {
  id: any;
  feedDate?: string;
  date?: string;
  quantity?: number;
  feedType?: string;
  type?: string;
  lotId?: any;
  [key: string]: any;
}

export interface AnimalDTO {
  id: any;
  tag?: string;
  type: string;
  sexe?: string;
  birthDate?: string;
  weight?: number;
  lotId?: any;
  [key: string]: any;
}

export interface HistoriqueDTO {
  id: any;
  action: string;
  eventDate?: string;
  date?: string;
  details?: string;
  lotId?: any;
  animalId?: any;
  [key: string]: any;
}

// =================== PRODUCTION ===================
export type ProductionStatus =
  | 'RECEPTION'
  | 'ATTENTE_ABATTAGE'
  | 'EN_ABATTAGE'
  | 'ABATTAGE_TERMINE'
  | 'EN_DECOUPE'
  | 'DECOUPE_TERMINEE'
  | 'EN_TRANSFORMATION'
  | 'TRANSFORMATION_TERMINEE'
  | 'EN_CONDITIONNEMENT'
  | 'CONDITIONNEMENT_TERMINE'
  | 'EN_CONTROLE_QUALITE'
  | 'CONTROLE_VALIDE'
  | 'TRANSFERE_STOCK'
  | string;

export interface ProductionLotResponse {
  id: number;
  lotNumber: string;
  status: ProductionStatus;
  receptionDate: string;
  source: string;
  totalAnimals: number;
  poidsVifTotal?: number;
  poidsNetTotal?: number;
  elevageLotId?: number;
  history?: any[];
  [key: string]: any;
}

export interface SlaughterCreateRequest {
  productionLotId: number;
  responsible: string;
  comment?: string;
  [key: string]: any;
}

export interface CuttingCreateRequest {
  productionLotId: number;
  cuisses: number;
  filets: number;
  ailes: number;
  carcasses: number;
  poidsCuisse?: number;
  poidsFilet?: number;
  poidsAile?: number;
  poidsCaracasse?: number;
  responsible: string;
  comment?: string;
}

export interface ProcessingCreateRequest {
  productionLotId: number;
  productType: string;
  quantity: number;
  unit: string;
  responsible: string;
  comment?: string;
}

export interface PackagingCreateRequest {
  productionLotId: number;
  packagingType: string;
  unitCount: number;
  weightPerUnit: number;
  dlc: string;
  responsible: string;
  comment?: string;
}

export interface QualityCheckCreateRequest {
  productionLotId: number;
  result: 'CONFORME' | 'NON_CONFORME' | string;
  observations?: string;
  responsible: string;
}

export interface UpdateStatusRequest {
  status: ProductionStatus;
  responsible: string;
  comment?: string;
}

export interface FinishedProductResponse {
  id: number;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  productionDate: string;
  dlc?: string;
  productionLotId: number;
  status?: string;
  [key: string]: any;
}

export interface HistoryEventResponse {
  id: number;
  productionLotId: number;
  event: string;
  date: string;
  responsible: string;
  comment?: string;
  [key: string]: any;
}

export interface ProductionDashboardDTO {
  lotsEnCours: number;
  poidsTraite: number;
  produitsFinis: number;
  rendementMoyen: number;
  controlesReussis: number;
  rejets: number;
  [key: string]: any;
}

// =================== USER ===================
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  enabled: boolean;
  roles: string[];
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roles?: string[];
  role?: string;
  enabled?: boolean;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  enabled?: boolean;
  roles?: string[];
  role?: string;
  password?: string;
}
