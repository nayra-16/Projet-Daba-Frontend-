import api from '../../../core/services/api';
import { Farm, Animal, AnimalBatch, HealthRecord, Feed } from '../types';

export const farmService = {
  getAllFarms: async (): Promise<Farm[]> => {
    // For now, return mock data since we don't have a backend yet
    // return (await api.get('/farms')).data;
    return MOCK_FARMS;
  },
  getFarmById: async (id: string): Promise<Farm> => {
    // return (await api.get(`/farms/${id}`)).data;
    return MOCK_FARMS.find(f => f.id === id) || MOCK_FARMS[0];
  },
  getAnimalsByFarmId: async (farmId: string): Promise<Animal[]> => {
    // return (await api.get(`/farms/${farmId}/animals`)).data;
    return MOCK_ANIMALS.filter(a => a.farmId === farmId);
  },
  getBatchesByFarmId: async (farmId: string): Promise<AnimalBatch[]> => {
    // return (await api.get(`/farms/${farmId}/batches`)).data;
    return MOCK_BATCHES.filter(b => b.farmId === farmId);
  },
  getHealthRecordsByAnimalId: async (animalId: string): Promise<HealthRecord[]> => {
    // return (await api.get(`/animals/${animalId}/health-records`)).data;
    return MOCK_HEALTH_RECORDS.filter(h => h.animalId === animalId);
  },
  getFeedByFarmId: async (farmId: string): Promise<Feed[]> => {
    // return (await api.get(`/farms/${farmId}/feed`)).data;
    return MOCK_FEED.filter(f => f.farmId === farmId);
  }
};

const MOCK_FARMS: Farm[] = [
  {
    id: '1',
    name: 'Ferme Agoè',
    location: 'Agoè, Togo',
    area: 50,
    ownerName: 'Kofi Mensah',
    contactPhone: '+228 90 12 34 56',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ferme Lomé',
    location: 'Lomé, Togo',
    area: 30,
    ownerName: 'Ama Akuffo',
    contactPhone: '+228 91 23 45 67',
    createdAt: '2024-03-20'
  }
];

const MOCK_ANIMALS: Animal[] = [
  {
    id: '1',
    farmId: '1',
    batchId: '1',
    tagNumber: 'P001',
    species: 'POULET',
    breed: 'Broiler',
    birthDate: '2024-05-01',
    gender: 'MALE',
    status: 'SAIN',
    weight: 2.5,
    createdAt: '2024-05-01'
  },
  {
    id: '2',
    farmId: '1',
    batchId: '1',
    tagNumber: 'P002',
    species: 'POULET',
    breed: 'Broiler',
    birthDate: '2024-05-01',
    gender: 'FEMELLE',
    status: 'SAIN',
    weight: 2.3,
    createdAt: '2024-05-01'
  }
];

const MOCK_BATCHES: AnimalBatch[] = [
  {
    id: '1',
    farmId: '1',
    name: 'Lot 2024-05',
    species: 'POULET',
    quantity: 500,
    startDate: '2024-05-01',
    status: 'ACTIVE',
    createdAt: '2024-05-01'
  },
  {
    id: '2',
    farmId: '1',
    name: 'Lot 2024-03',
    species: 'POULET',
    quantity: 400,
    startDate: '2024-03-01',
    endDate: '2024-06-15',
    status: 'TERMINEE',
    createdAt: '2024-03-01'
  }
];

const MOCK_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: '1',
    animalId: '1',
    date: '2024-05-15',
    type: 'VACCINATION',
    description: 'Vaccination contre la maladie de Gumboro',
    veterinarian: 'Dr. Yao',
    createdAt: '2024-05-15'
  }
];

const MOCK_FEED: Feed[] = [
  {
    id: '1',
    farmId: '1',
    name: 'Aliment démarrage',
    type: 'Aliment composé',
    quantity: 200,
    unit: 'KG',
    purchaseDate: '2024-05-01',
    expiryDate: '2024-08-01',
    createdAt: '2024-05-01'
  },
  {
    id: '2',
    farmId: '1',
    name: 'Aliment croissance',
    type: 'Aliment composé',
    quantity: 500,
    unit: 'KG',
    purchaseDate: '2024-05-20',
    expiryDate: '2024-08-20',
    createdAt: '2024-05-20'
  }
];
