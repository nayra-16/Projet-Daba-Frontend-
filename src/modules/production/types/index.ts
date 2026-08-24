import { Product } from '../../products/types';

export enum ProductionStep {
  RECEPTION = 'Lot reçu',
  ATTENTE_ABATTAGE = "En attente d'abattage",
  ABATTAGE_TERMINE = 'Abattage terminé',
  DECOUPE_TERMINEE = 'Découpe terminée',
  TRANSFORMATION = 'Transformation',
  CONDITIONNEMENT = 'Conditionnement',
  CONTROLE_QUALITE = 'Contrôle qualité',
  PRODUIT_TERMINE = 'Produit terminé',
  STOCK = 'En stock'
}

export enum QualityStatus {
  PASSED = 'Validé',
  FAILED = 'Refusé',
  PENDING = 'En attente',
  WARNING = 'À surveiller',
}

export interface ChambreFroide {
  id: string;
  name: string;
  capacity: number; // Max capacity
  capacityUnit: 'kg' | 'unités';
  minTemp: number; // °C
  maxTemp: number; // °C
  currentTemp: number; // °C
  location?: string;
  description?: string;
  status: 'Disponible' | 'Occupée' | 'En maintenance' | 'En panne';
  currentLoad: number; // current quantity stored
  lastCheck?: string;
  lastMaintenance?: string;
}

export type IncidentType = 
  | 'Panne de chambre froide'
  | 'Température anormale'
  | 'Coupure électrique'
  | 'Porte restée ouverte'
  | 'Problème technique'
  | 'Maintenance'
  | 'Autre';

export type IncidentStatus = 'Ouvert' | 'En cours' | 'Résolu';

export interface Incident {
  id: string;
  type: IncidentType;
  chambreFroideId: string;
  date: string; // ISO date string
  time: string; // HH:mm
  description: string;
  observedTemp?: number;
  responsible: string;
  status: IncidentStatus;
}

export interface SlaughterDetails {
  date: string;
  time: string;
  responsible: string;
  quantityReceived: number;
  quantitySlaughtered: number;
  losses: number;
  lossesReason?: string;
  observations?: string;
}

export interface PieceDetail {
  quantity: number;
  weight: number; // in kg
}

export interface CuttingPieces {
  pouletEntier: PieceDetail;
  cuisses: PieceDetail;
  pilons: PieceDetail;
  ailes: PieceDetail;
  blancs: PieceDetail;
  foies: PieceDetail;
  gesiers: PieceDetail;
  autres: PieceDetail;
}

export interface CuttingDetails {
  date: string;
  responsible: string;
  pieces: CuttingPieces;
}

export interface ProcessingDetails {
  productName: string; // Saucisses, Merguez, Poulet fumé, Produits marinés, Nuggets, etc.
  quantity: number;
  weight: number; // in kg
  date: string;
  responsible: string;
  observations?: string;
}

export interface PackagingDetails {
  packagingType: string; // Sachet, Barquette, Carton, etc.
  quantity: number;
  weight: number; // in kg
  date: string;
  responsible: string;
  productionLotNumber: string; // Generated automatically
}

export interface QualityDetails {
  visualControl: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  weightControl: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  temperatureControl: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  odorControl?: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  packagingControl?: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  labelControl?: 'CONFORME' | 'NON_CONFORME' | 'A_SURVEILLER';
  conformity: 'CONFORME' | 'NON_CONFORME' | 'EN_ATTENTE' | 'A_SURVEILLER';
  comments?: string;
  date: string;
  responsible: string;
}

export interface ProductionHistoryEvent {
  id: string;
  date: string;
  time: string;
  step: ProductionStep;
  responsible: string;
  comment?: string;
}

export interface ProductionLot {
  id: string;
  elevageLotId: string;
  elevageLotNumber: string;
  name: string; // e.g. "Lot Mai 2024 - Poulailler 1"
  quantity: number; // current quantity of birds or items
  weight: number; // current total weight in kg
  dateFabrication: string;
  dateLimite?: string;
  responsible: string;
  status: ProductionStep;
  qualityStatus: QualityStatus;
  observations?: string;
  product?: Product | any;
  history: ProductionHistoryEvent[];
  createdAt: string;
  updatedAt: string;

  // Step details recorded along the way
  slaughterDetails?: SlaughterDetails;
  cuttingDetails?: CuttingDetails;
  processingDetails?: ProcessingDetails;
  packagingDetails?: PackagingDetails;
  qualityDetails?: QualityDetails;

  // Chambres froides
  chambreFroideId?: string; // ID de la chambre froide si stocké
  dlc?: string; // Date Limite de Consommation (YYYY-MM-DD)
  perteReason?: string; // Motif si le statut est "Perdu"
  perteIncidentId?: string; // ID de l'incident ayant causé la perte
  perteDate?: string;
}

export interface FinishedProduct {
  id: string;
  productName: string;
  lotNumber: string; // Production lot number generated in packaging
  elevageLotNumber: string; // Original elevage lot number
  dateFabrication: string;
  dateLimite: string;
  quantity: number;
  weight: number; // in kg
  status: 'Conforme' | 'Vendu' | 'En stock';
  stock: number;
}

// --- NEW TYPES FOR PHASE 2 ---

export type ProductionOrderStatus = 'Planifié' | 'En cours' | 'Terminé' | 'Reporté' | 'Annulé';
export type ProductionOrderPriority = 'Normale' | 'Prioritaire' | 'Urgent';

export interface ProductionOrder {
  id: string;
  orderNumber: string; // e.g., OP-2026-0042
  productName: string;
  plannedQuantity: number; // in units or kg based on product
  unit: 'kg' | 'unités';
  plannedDate: string;
  plannedTime?: string;
  responsible: string;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  sourceLotId?: string; // Optional: Link to a specific lot
  sourceLotNumber?: string;
  actualQuantity?: number;
  actualYield?: number; // %
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  name: string; // e.g., "Poulet", "Epices", "Marinade"
  quantityPer100kg: number; // Quantity needed to make 100kg of product
  unit: 'kg' | 'L' | 'g';
}

export interface ProductionRecipe {
  id: string;
  productName: string; // Link to the product name (e.g. "Merguez")
  ingredients: RecipeIngredient[];
  instructions?: string;
}

export type LossReason = 
  | 'Perte d\'abattage' 
  | 'Perte de découpe' 
  | 'Perte de transformation' 
  | 'Perte de conditionnement' 
  | 'Produit non conforme' 
  | 'Produit endommagé' 
  | 'Autre';

export interface ProductionLoss {
  id: string;
  date: string;
  productionLotId?: string;
  productionLotNumber?: string;
  step: ProductionStep | string;
  productName?: string;
  quantity: number;
  unit: 'kg' | 'unités';
  reason: LossReason;
  responsible: string;
  comments?: string;
}

export type NonConformityStatus = 'Ouverte' | 'En analyse' | 'Résolue' | 'Clôturée';
export type NonConformityDecision = 'Recontrôle' | 'Retraitement' | 'Destruction' | 'Libération' | 'En attente';

export interface NonConformity {
  id: string;
  incidentNumber: string; // e.g., NC-2026-012
  date: string;
  productionLotId: string;
  productionLotNumber: string;
  productName: string;
  problemDescription: string;
  blockedQuantity: number;
  unit: 'kg' | 'unités';
  status: NonConformityStatus;
  decision: NonConformityDecision;
  responsible: string;
  resolutionComments?: string;
  resolvedAt?: string;
}
