import axiosInstance from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { LotDTO } from '../types/api';

/**
 * Service Lots — aligné 1:1 avec com.oseor.daba.elevage.controller.LotController.
 */
export const lotService = {
  async getAll(): Promise<LotDTO[]> {
    const r = await axiosInstance.get<ApiResponse<LotDTO[]>>('/lots');
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<LotDTO> {
    const r = await axiosInstance.get<ApiResponse<LotDTO>>(`/lots/${id}`);
    return r.data.data;
  },
  async getByFarmId(farmId: number): Promise<LotDTO[]> {
    const r = await axiosInstance.get<ApiResponse<LotDTO[]>>(`/lots/farm/${farmId}`);
    return r.data.data ?? [];
  },
  async create(payload: LotDTO): Promise<LotDTO> {
    const r = await axiosInstance.post<ApiResponse<LotDTO>>('/lots', payload);
    return r.data.data;
  },
  async update(id: number, payload: LotDTO): Promise<LotDTO> {
    const r = await axiosInstance.put<ApiResponse<LotDTO>>(`/lots/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/lots/${id}`);
  },
};
