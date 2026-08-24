import axiosInstance from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { FarmDTO, PaginationResponse } from '../types/api';

/**
 * Service Ferme — aligné 1:1 avec com.oseor.daba.farm.controller.FarmController.
 */
export const farmService = {
  async getAll(page = 0, size = 50, sortBy = 'id', sortDir = 'asc') {
    const r = await axiosInstance.get<ApiResponse<PaginationResponse<FarmDTO>>>(
      '/farms',
      { params: { page, size, sortBy, sortDir } }
    );
    return r.data.data;
  },

  async getAllWithoutPagination(): Promise<FarmDTO[]> {
    const r = await axiosInstance.get<ApiResponse<FarmDTO[]>>('/farms/all');
    return r.data.data ?? [];
  },

  async getById(id: number): Promise<FarmDTO> {
    const r = await axiosInstance.get<ApiResponse<FarmDTO>>(`/farms/${id}`);
    return r.data.data;
  },

  async create(payload: FarmDTO): Promise<FarmDTO> {
    const r = await axiosInstance.post<ApiResponse<FarmDTO>>('/farms', payload);
    return r.data.data;
  },

  async update(id: number, payload: FarmDTO): Promise<FarmDTO> {
    const r = await axiosInstance.put<ApiResponse<FarmDTO>>(`/farms/${id}`, payload);
    return r.data.data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/farms/${id}`);
  },
};
