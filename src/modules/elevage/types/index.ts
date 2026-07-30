
// ========== ENUMS ==========
export enum LotStatus {
  ARRIVEE = 'Arrivée',
  INSTALLE = 'Installé',
  EN_ELEVAGE = 'En élevage',
  SUIVI_ALIMENTAIRE = 'Suivi alimentaire',
  VACCINATION = 'Vaccination',
  TRAITEMENT = 'Traitement',
  CONTROLE_POIDS = 'Contrôle du poids',
  CONTROLE_SANITAIRE = 'Contrôle sanitaire',
  PRET_ABATTAGE = 'Prêt pour l\'abattage',
  TRANSFERE_PRODUCTION = 'Transféré en production',
  TERMINE = 'Terminé',
  ARCHIVE = 'Archivé'
}

export enum PoulailerStatus {
  ACTIF = 'Actif',
  EN_MAINTENANCE = 'En maintenance',
  INACTIF = 'Inactif'
}

export enum HealthEventType {
  VACCINATION = 'Vaccination',
  TRAITEMENT = 'Traitement',
  MALADIE = 'Maladie',
  DECES = 'Décès',
  CONTROLE_VETERINAIRE = 'Contrôle vétérinaire'
}

export enum TimelineEventType {
  CREATION_LOT = 'Création de lot',
  VACCINATION = 'Vaccination',
  TRAITEMENT = 'Traitement',
  PESEE = 'Pesée',
  MORTALITE = 'Mortalité',
  DISTRIBUTION_ALIMENT = 'Distribution d\'aliments',
  TRANSFERT = 'Transfert',
  ABATTAGE = 'Abattage',
  CHANGEMENT_STATUT = 'Changement de statut'
}

// ========== INTERFACES ==========
export interface WorkflowStep {
  id: LotStatus;
  label: string;
  color: string;
  icon: string;
  description: string;
  order: number;
}

export interface HistoryEvent {
  id: string;
  lotId: string;
  date: string;
  type: TimelineEventType;
  status?: LotStatus;
  title: string;
  description?: string;
  responsible: string;
  createdAt: string;
}

export interface Lot {
  id: string;
  lotNumber: string;
  name: string;
  arrivalDate: string;
  origin: string;
  chickCount: number;
  breed: string;
  age: number; // in days
  averageWeight: number; // in kg
  minWeightRequired: number; // kg
  status: LotStatus;
  poulailerId: string;
  responsible: string;
  observations?: string;
  feedRecordsCount: number;
  vaccinationsDone: boolean;
  weightRecorded: boolean;
  healthControlValidated: boolean;
  healthControlStatus: 'VALID' | 'REFUSED' | 'PENDING';
  transferDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Poulailer {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  responsible: string;
  status: PoulailerStatus;
  location: string;
  createdAt: string;
  description?: string;
}

export interface HealthEvent {
  id: string;
  date: string;
  lotId: string;
  type: HealthEventType;
  product?: string;
  responsible: string;
  comment?: string;
  mortalityCount?: number;
  createdAt: string;
}

export interface FeedRecord {
  id: string;
  date: string;
  lotId: string;
  feedType: string;
  quantity: number; // in kg
  responsible: string;
  cost: number; // in FCFA
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  lotId: string;
  averageWeight: number; // in kg
  responsible: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  lotId?: string;
  description: string;
  responsible: string;
  createdAt: string;
}

export interface ElevageDashboardStats {
  lotsArrivee: number;
  lotsEnElevage: number;
  lotsEnVaccination: number;
  lotsEnTraitement: number;
  lotsPretsAbattage: number;
  lotsTransferes: number;
  totalBirds: number;
  poulailersCount: number;
  capacityUsed: number; // percentage
  monthlyMortality: number;
  monthlyFeedConsumption: number; // in kg
  upcomingVaccinations: HealthEvent[];
  lotsReadyForSlaughter: Lot[];
  birdEvolution: { date: string; count: number }[];
  feedEvolution: { date: string; quantity: number }[];
  mortalityEvolution: { date: string; count: number }[];
  weightEvolution: { date: string; weight: number }[];
}
