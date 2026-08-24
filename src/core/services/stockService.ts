import axiosInstance from '../api/axios';
import type { ApiResponse } from '../types/api';
import type {
  StockDashboardDTO,
  StockResponse,
  StockCreateRequest,
  StockMovementResponse,
  StockMovementRequest,
  StockAlertResponse,
  RawMaterialResponse,
  RawMaterialCreateRequest,
  InventoryResponse,
  InventoryCreateRequest,
} from '../types/api';

/**
 * Service Stock — aligné 1:1 avec com.oseor.daba.stock.controller.StockController.
 */
export const stockService = {
  // Dashboard
  async getDashboard(): Promise<StockDashboardDTO> {
    const r = await axiosInstance.get<ApiResponse<StockDashboardDTO>>('/stocks/dashboard');
    return r.data.data;
  },

  // Stocks (produits finis)
  async getAll(): Promise<StockResponse[]> {
    const r = await axiosInstance.get<ApiResponse<StockResponse[]>>('/stocks');
    return r.data.data ?? [];
  },
  async getById(id: number): Promise<StockResponse> {
    const r = await axiosInstance.get<ApiResponse<StockResponse>>(`/stocks/${id}`);
    return r.data.data;
  },
  async create(payload: StockCreateRequest): Promise<StockResponse> {
    const r = await axiosInstance.post<ApiResponse<StockResponse>>('/stocks', payload);
    return r.data.data;
  },
  async update(id: number, payload: StockCreateRequest): Promise<StockResponse> {
    const r = await axiosInstance.put<ApiResponse<StockResponse>>(`/stocks/${id}`, payload);
    return r.data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/stocks/${id}`);
  },

  // Movements
  async getAllMovements(): Promise<StockMovementResponse[]> {
    const r = await axiosInstance.get<ApiResponse<StockMovementResponse[]>>('/stocks/movements');
    return r.data.data ?? [];
  },
  async stockIn(payload: StockMovementRequest): Promise<StockMovementResponse> {
    const r = await axiosInstance.post<ApiResponse<StockMovementResponse>>('/stocks/in', payload);
    return r.data.data;
  },
  async stockOut(payload: StockMovementRequest): Promise<StockMovementResponse> {
    const r = await axiosInstance.post<ApiResponse<StockMovementResponse>>('/stocks/out', payload);
    return r.data.data;
  },

  // Inventory
  async getAllInventories(): Promise<InventoryResponse[]> {
    const r = await axiosInstance.get<ApiResponse<InventoryResponse[]>>('/stocks/inventory');
    return r.data.data ?? [];
  },
  async createInventory(payload: InventoryCreateRequest): Promise<InventoryResponse> {
    const r = await axiosInstance.post<ApiResponse<InventoryResponse>>('/stocks/inventory', payload);
    return r.data.data;
  },

  // Alerts
  async getAllAlerts(): Promise<StockAlertResponse[]> {
    const r = await axiosInstance.get<ApiResponse<StockAlertResponse[]>>('/stocks/alerts');
    return r.data.data ?? [];
  },

  // Raw materials
  async getAllRawMaterials(): Promise<RawMaterialResponse[]> {
    const r = await axiosInstance.get<ApiResponse<RawMaterialResponse[]>>('/stocks/raw-materials');
    return r.data.data ?? [];
  },
  async createRawMaterial(payload: RawMaterialCreateRequest): Promise<RawMaterialResponse> {
    const r = await axiosInstance.post<ApiResponse<RawMaterialResponse>>(
      '/stocks/raw-materials',
      payload
    );
    return r.data.data;
  },

  // Aliases
  async getDashboardStats(): Promise<StockDashboardDTO> {
    return this.getDashboard();
  },
  async getAlerts(): Promise<StockAlertResponse[]> {
    return this.getAllAlerts();
  },
  async getMovements(): Promise<StockMovementResponse[]> {
    return this.getAllMovements();
  },
};
