import axiosInstance from '../api/axios';
import type {
  ApiResponse,
  PoulaillerDTO,
  VaccinationDTO,
  AlimentationDTO,
  AnimalDTO,
  HistoriqueDTO,
} from '../types/api';

/**
 * Service Poulaillers — aligné 1:1 avec com.oseor.daba.elevage.controller.PoulaillerController.
 */
export const poulaillerService = {
  async getAll(): Promise<PoulaillerDTO[]> {
    const r = await axiosInstance.get<ApiResponse<PoulaillerDTO[]>>('/poulaillers');
    return r.data.data ?? [];
  },
  async getByFarmId(farmId: number): Promise<PoulaillerDTO[]> {
    const r = await axiosInstance.get<ApiResponse<PoulaillerDTO[]>>(`/poulaillers/farm/${farmId}`);
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<PoulaillerDTO> {
    const r = await axiosInstance.get<ApiResponse<PoulaillerDTO>>(`/poulaillers/${id}`);
    return r.data.data;
  },
  async create(payload: PoulaillerDTO): Promise<PoulaillerDTO> {
    const r = await axiosInstance.post<ApiResponse<PoulaillerDTO>>('/poulaillers', payload);
    return r.data.data;
  },
  async update(id: number, payload: PoulaillerDTO): Promise<PoulaillerDTO> {
    const r = await axiosInstance.put<ApiResponse<PoulaillerDTO>>(`/poulaillers/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/poulaillers/${id}`);
  },
};

/**
 * Service Vaccinations — aligné 1:1 avec com.oseor.daba.elevage.controller.VaccinationController.
 */
export const vaccinationService = {
  async getAll(): Promise<VaccinationDTO[]> {
    const r = await axiosInstance.get<ApiResponse<VaccinationDTO[]>>('/vaccinations');
    return r.data.data ?? [];
  },
  async getByLotId(lotId: number): Promise<VaccinationDTO[]> {
    const r = await axiosInstance.get<ApiResponse<VaccinationDTO[]>>(`/vaccinations/lot/${lotId}`);
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<VaccinationDTO> {
    const r = await axiosInstance.get<ApiResponse<VaccinationDTO>>(`/vaccinations/${id}`);
    return r.data.data;
  },
  async create(payload: VaccinationDTO): Promise<VaccinationDTO> {
    const r = await axiosInstance.post<ApiResponse<VaccinationDTO>>('/vaccinations', payload);
    return r.data.data;
  },
  async update(id: number, payload: VaccinationDTO): Promise<VaccinationDTO> {
    const r = await axiosInstance.put<ApiResponse<VaccinationDTO>>(`/vaccinations/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/vaccinations/${id}`);
  },
};

/**
 * Service Alimentations — aligné 1:1 avec com.oseor.daba.elevage.controller.AlimentationController.
 */
export const alimentationService = {
  async getAll(): Promise<AlimentationDTO[]> {
    const r = await axiosInstance.get<ApiResponse<AlimentationDTO[]>>('/alimentations');
    return r.data.data ?? [];
  },
  async getByLotId(lotId: number): Promise<AlimentationDTO[]> {
    const r = await axiosInstance.get<ApiResponse<AlimentationDTO[]>>(`/alimentations/lot/${lotId}`);
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<AlimentationDTO> {
    const r = await axiosInstance.get<ApiResponse<AlimentationDTO>>(`/alimentations/${id}`);
    return r.data.data;
  },
  async create(payload: AlimentationDTO): Promise<AlimentationDTO> {
    const r = await axiosInstance.post<ApiResponse<AlimentationDTO>>('/alimentations', payload);
    return r.data.data;
  },
  async update(id: number, payload: AlimentationDTO): Promise<AlimentationDTO> {
    const r = await axiosInstance.put<ApiResponse<AlimentationDTO>>(`/alimentations/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/alimentations/${id}`);
  },
};

/**
 * Service Animaux — aligné 1:1 avec com.oseor.daba.elevage.controller.AnimalController.
 */
export const animalService = {
  async getAll(): Promise<AnimalDTO[]> {
    const r = await axiosInstance.get<ApiResponse<AnimalDTO[]>>('/animals');
    return r.data.data ?? [];
  },
  async getByLotId(lotId: number): Promise<AnimalDTO[]> {
    const r = await axiosInstance.get<ApiResponse<AnimalDTO[]>>(`/animals/lot/${lotId}`);
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<AnimalDTO> {
    const r = await axiosInstance.get<ApiResponse<AnimalDTO>>(`/animals/${id}`);
    return r.data.data;
  },
  async create(payload: AnimalDTO): Promise<AnimalDTO> {
    const r = await axiosInstance.post<ApiResponse<AnimalDTO>>('/animals', payload);
    return r.data.data;
  },
  async update(id: number, payload: AnimalDTO): Promise<AnimalDTO> {
    const r = await axiosInstance.put<ApiResponse<AnimalDTO>>(`/animals/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/animals/${id}`);
  },
};

/**
 * Service Historiques — aligné 1:1 avec com.oseor.daba.elevage.controller.HistoriqueController.
 */
export const historiqueService = {
  async getAll(): Promise<HistoriqueDTO[]> {
    const r = await axiosInstance.get<ApiResponse<HistoriqueDTO[]>>('/historiques');
    return r.data.data ?? [];
  },
  async getByLotId(lotId: number): Promise<HistoriqueDTO[]> {
    const r = await axiosInstance.get<ApiResponse<HistoriqueDTO[]>>(`/historiques/lot/${lotId}`);
    return r.data.data ?? [];
  },
  async getByAnimalId(animalId: number): Promise<HistoriqueDTO[]> {
    const r = await axiosInstance.get<ApiResponse<HistoriqueDTO[]>>(`/historiques/animal/${animalId}`);
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<HistoriqueDTO> {
    const r = await axiosInstance.get<ApiResponse<HistoriqueDTO>>(`/historiques/${id}`);
    return r.data.data;
  },
  async create(payload: HistoriqueDTO): Promise<HistoriqueDTO> {
    const r = await axiosInstance.post<ApiResponse<HistoriqueDTO>>('/historiques', payload);
    return r.data.data;
  },
  async update(id: number, payload: HistoriqueDTO): Promise<HistoriqueDTO> {
    const r = await axiosInstance.put<ApiResponse<HistoriqueDTO>>(`/historiques/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/historiques/${id}`);
  },
};
