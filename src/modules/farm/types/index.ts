export interface Farm {
  id: string | number;
  name: string;
  location?: string;
  address?: string;
  area?: number; // en hectares
  ownerName?: string;
  contactPhone?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  poulaillersCount?: number;
  lotsCount?: number;
}

export interface Animal {
  id: string;
  farmId: string;
  batchId?: string;
  tagNumber: string;
  species: 'POULET' | 'VACHE' | 'MOUTON' | 'CHEVRE' | 'COCHON';
  breed: string;
  birthDate: string;
  gender: 'MALE' | 'FEMELLE';
  status: 'SAIN' | 'MALADE' | 'QUARANTAINE' | 'VENDU' | 'DECEDE';
  weight?: number; // en kg
  createdAt: string;
}

export interface AnimalBatch {
  id: string;
  farmId: string;
  name: string;
  species: 'POULET' | 'VACHE' | 'MOUTON' | 'CHEVRE' | 'COCHON';
  quantity: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'TERMINEE';
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  date: string;
  type: 'VACCINATION' | 'TRAITEMENT' | 'CONSULTATION';
  description: string;
  veterinarian?: string;
  nextVisitDate?: string;
  createdAt: string;
}

export interface Feed {
  id: string;
  farmId: string;
  name: string;
  type: string;
  quantity: number;
  unit: 'KG' | 'SACHET' | 'L';
  purchaseDate: string;
  expiryDate?: string;
  createdAt: string;
}
