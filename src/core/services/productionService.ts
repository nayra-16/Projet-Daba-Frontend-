import axiosInstance from '../api/axios';
import type { ApiResponse } from '../types/api';
import type {
  ProductionDashboardDTO,
  ProductionLotResponse,
  ProductionStatus,
  SlaughterCreateRequest,
  CuttingCreateRequest,
  ProcessingCreateRequest,
  PackagingCreateRequest,
  QualityCheckCreateRequest,
  UpdateStatusRequest,
  FinishedProductResponse,
  HistoryEventResponse,
} from '../types/api';

/**
 * Service Production — aligné 1:1 avec com.oseor.daba.production.controller.ProductionController.
 */
export const productionService = {
  async getDashboardStats(): Promise<ProductionDashboardDTO> {
    const r = await axiosInstance.get<ApiResponse<ProductionDashboardDTO>>(
      '/production/dashboard/stats'
    );
    return r.data.data;
  },

  async getAllLots(status?: ProductionStatus): Promise<ProductionLotResponse[]> {
    const r = await axiosInstance.get<ApiResponse<ProductionLotResponse[]>>('/production/lots', {
      params: status ? { status } : undefined,
    });
    return r.data.data ?? [];
  },

  async getReceivedLots(): Promise<ProductionLotResponse[]> {
    const r = await axiosInstance.get<ApiResponse<ProductionLotResponse[]>>(
      '/production/lots/received'
    );
    return r.data.data ?? [];
  },

  async getLotById(id: number): Promise<ProductionLotResponse> {
    const r = await axiosInstance.get<ApiResponse<ProductionLotResponse>>(
      `/production/lots/${id}`
    );
    return r.data.data;
  },

  async updateStatus(id: number, payload: UpdateStatusRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.put<ApiResponse<ProductionLotResponse>>(
      `/production/lots/${id}/status`,
      payload
    );
    return r.data.data;
  },

  async syncFromElevage(): Promise<ProductionLotResponse[]> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse[]>>(
      '/production/lots/sync-from-elevage'
    );
    return r.data.data ?? [];
  },

  // Workflow write
  async slaughter(payload: SlaughterCreateRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse>>(
      '/production/slaughter',
      payload
    );
    return r.data.data;
  },

  async cutting(payload: CuttingCreateRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse>>(
      '/production/cutting',
      payload
    );
    return r.data.data;
  },

  async processing(payload: ProcessingCreateRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse>>(
      '/production/processing',
      payload
    );
    return r.data.data;
  },

  async packaging(payload: PackagingCreateRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse>>(
      '/production/packaging',
      payload
    );
    return r.data.data;
  },

  async quality(payload: QualityCheckCreateRequest): Promise<ProductionLotResponse> {
    const r = await axiosInstance.post<ApiResponse<ProductionLotResponse>>(
      '/production/quality',
      payload
    );
    return r.data.data;
  },

  async transferToStock(id: number): Promise<FinishedProductResponse> {
    const r = await axiosInstance.post<ApiResponse<FinishedProductResponse>>(
      `/production/lots/${id}/transfer-to-stock`
    );
    return r.data.data;
  },

  // Reads
  async getFinishedProducts(): Promise<FinishedProductResponse[]> {
    const r = await axiosInstance.get<ApiResponse<FinishedProductResponse[]>>(
      '/production/finished-products'
    );
    return r.data.data ?? [];
  },

  async getHistory(): Promise<HistoryEventResponse[]> {
    const r = await axiosInstance.get<ApiResponse<HistoryEventResponse[]>>('/production/history');
    return r.data.data ?? [];
  },

  async getAllHistoryEvents(): Promise<HistoryEventResponse[]> {
    return this.getHistory();
  },
};
