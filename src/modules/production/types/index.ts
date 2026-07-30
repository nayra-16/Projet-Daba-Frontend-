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
  visualControl: 'CONFORME' | 'NON_CONFORME';
  weightControl: 'CONFORME' | 'NON_CONFORME';
  temperatureControl: 'CONFORME' | 'NON_CONFORME';
  conformity: 'CONFORME' | 'NON_CONFORME' | 'EN_ATTENTE';
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
  history: ProductionHistoryEvent[];
  createdAt: string;
  updatedAt: string;

  // Step details recorded along the way
  slaughterDetails?: SlaughterDetails;
  cuttingDetails?: CuttingDetails;
  processingDetails?: ProcessingDetails;
  packagingDetails?: PackagingDetails;
  qualityDetails?: QualityDetails;
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
