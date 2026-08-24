import { farmService as coreFarmService } from '../../../core/services/farmService';
import { lotService } from '../../../core/services/lotService';
import { poulaillerService, animalService, alimentationService } from '../../../core/services/elevageServices';
import type { FarmDTO, LotDTO, PoulaillerDTO } from '../../../core/types/api';
import { Farm, Animal, AnimalBatch, HealthRecord, Feed } from '../types';

/**
 * Mapper FarmDTO backend -> Farm frontend (modules/farm)
 */
export const mapFarmDtoToModel = (dto: FarmDTO): Farm => ({
  id: dto.id ?? '',
  name: dto.name || '',
  location: dto.address || dto.location || 'Localisation non renseignée',
  address: dto.address || dto.location || '',
  area: dto.area || 0,
  ownerName: dto.ownerName || dto.email || 'Exploitant DABA',
  contactPhone: dto.phone || dto.contactPhone || '—',
  phone: dto.phone || dto.contactPhone || '',
  email: dto.email || '',
  createdAt: dto.createdAt || new Date().toISOString().split('T')[0],
});

export const farmService = {
  /**
   * Récupérer toutes les fermes réelles
   */
  getAllFarms: async (): Promise<Farm[]> => {
    try {
      const data = await coreFarmService.getAllWithoutPagination();
      return (data || []).map(mapFarmDtoToModel);
    } catch (e) {
      console.warn('Erreur lors du chargement des fermes (/farms/all), essai /farms:', e);
      try {
        const paginated = await coreFarmService.getAll(0, 100);
        return (paginated?.content || []).map(mapFarmDtoToModel);
      } catch (err) {
        console.error('Impossible de charger les fermes:', err);
        return [];
      }
    }
  },

  /**
   * Récupérer une ferme réelle par son ID
   */
  getFarmById: async (id: string | number): Promise<Farm | null> => {
    try {
      const data = await coreFarmService.getById(Number(id));
      return data ? mapFarmDtoToModel(data) : null;
    } catch (e) {
      console.error(`Impossible de charger la ferme ID ${id}:`, e);
      return null;
    }
  },

  /**
   * Créer une nouvelle ferme réelle
   */
  createFarm: async (data: {
    name: string;
    address?: string;
    location?: string;
    phone?: string;
    contactPhone?: string;
    email?: string;
    area?: number;
    ownerName?: string;
  }): Promise<Farm> => {
    const payload: FarmDTO = {
      name: data.name,
      address: data.address || data.location || '',
      phone: data.phone || data.contactPhone || '',
      email: data.email || '',
    };
    const created = await coreFarmService.create(payload);
    return mapFarmDtoToModel(created);
  },

  /**
   * Mettre à jour une ferme existante
   */
  updateFarm: async (
    id: string | number,
    data: Partial<{
      name: string;
      address?: string;
      location?: string;
      phone?: string;
      contactPhone?: string;
      email?: string;
      area?: number;
      ownerName?: string;
    }>
  ): Promise<Farm> => {
    const payload: FarmDTO = {
      name: data.name || '',
      address: data.address ?? data.location ?? '',
      phone: data.phone ?? data.contactPhone ?? '',
      email: data.email ?? '',
    };
    const updated = await coreFarmService.update(Number(id), payload);
    return mapFarmDtoToModel(updated);
  },

  /**
   * Supprimer une ferme
   */
  deleteFarm: async (id: string | number): Promise<void> => {
    await coreFarmService.remove(Number(id));
  },

  /**
   * Récupérer les poulaillers d'une ferme réelle (/api/poulaillers/farm/{farmId})
   */
  getPoulaillersByFarmId: async (farmId: string | number): Promise<PoulaillerDTO[]> => {
    try {
      return await poulaillerService.getByFarmId(Number(farmId));
    } catch (e) {
      console.warn(`Erreur lors du chargement des poulaillers pour la ferme ${farmId}:`, e);
      return [];
    }
  },

  /**
   * Récupérer les lots d'une ferme réelle (/api/lots/farm/{farmId})
   */
  getLotsByFarmId: async (farmId: string | number): Promise<LotDTO[]> => {
    try {
      return await lotService.getByFarmId(Number(farmId));
    } catch (e) {
      console.warn(`Erreur lors du chargement des lots pour la ferme ${farmId}:`, e);
      return [];
    }
  },

  /**
   * Récupérer les lots (format AnimalBatch pour compatibilité rétroactive)
   */
  getBatchesByFarmId: async (farmId: string | number): Promise<AnimalBatch[]> => {
    try {
      const lots = await lotService.getByFarmId(Number(farmId));
      return lots.map((l: LotDTO) => ({
        id: String(l.id ?? ''),
        farmId: String(farmId),
        name: l.name,
        species: 'POULET',
        quantity: l.quantity || l.effectif || 0,
        startDate: l.arrivalDate || l.startDate || new Date().toISOString().split('T')[0],
        status: (l.status === 'TERMINE' || l.status === 'ABATTAGE') ? 'TERMINEE' : 'ACTIVE',
        createdAt: l.arrivalDate || l.startDate || new Date().toISOString().split('T')[0],
      }));
    } catch (e) {
      console.warn(`Erreur lors du chargement des lots pour la ferme ${farmId}:`, e);
      return [];
    }
  },

  /**
   * Récupérer les animaux d'une ferme
   */
  getAnimalsByFarmId: async (farmId: string | number): Promise<Animal[]> => {
    try {
      const lots = await lotService.getByFarmId(Number(farmId));
      const allAnimals: Animal[] = [];
      for (const lot of lots) {
        if (lot.id) {
          const animals = await animalService.getByLotId(lot.id);
          for (const a of animals) {
            allAnimals.push({
              id: String(a.id ?? ''),
              farmId: String(farmId),
              batchId: String(lot.id),
              tagNumber: a.tag || `AN-${a.id}`,
              species: (a.type as any) || 'POULET',
              breed: a.race || 'Standard',
              birthDate: a.birthDate || '',
              gender: a.sexe === 'FEMELLE' ? 'FEMELLE' : 'MALE',
              status: 'SAIN',
              weight: a.weight,
              createdAt: a.birthDate || '',
            });
          }
        }
      }
      return allAnimals;
    } catch (e) {
      console.warn(`Erreur lors du chargement des animaux pour la ferme ${farmId}:`, e);
      return [];
    }
  },

  /**
   * Récupérer l'alimentation pour une ferme
   */
  getFeedByFarmId: async (farmId: string | number): Promise<Feed[]> => {
    try {
      const lots = await lotService.getByFarmId(Number(farmId));
      const allFeed: Feed[] = [];
      for (const lot of lots) {
        if (lot.id) {
          const feeds = await alimentationService.getByLotId(lot.id);
          for (const f of feeds) {
            allFeed.push({
              id: String(f.id ?? ''),
              farmId: String(farmId),
              name: f.feedType || f.type || 'Aliment volaille',
              type: f.feedType || f.type || 'Composé',
              quantity: f.quantity || 0,
              unit: 'KG',
              purchaseDate: f.feedDate || f.date || '',
              createdAt: f.feedDate || f.date || '',
            });
          }
        }
      }
      return allFeed;
    } catch (e) {
      console.warn(`Erreur lors du chargement de l'alimentation pour la ferme ${farmId}:`, e);
      return [];
    }
  },

  getHealthRecordsByAnimalId: async (_animalId: string): Promise<HealthRecord[]> => {
    return [];
  },
};
