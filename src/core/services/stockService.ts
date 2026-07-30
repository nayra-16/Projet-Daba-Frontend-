
import axiosInstance from '../api/axios';

export const stockService = {
  async getStockLevels() {
    console.log('stockService.getStockLevels called');
  },

  async getStockMovements() {
    console.log('stockService.getStockMovements called');
  },

  async updateStock() {
    // TODO: Implement
  },

  async getStockById(id: string) {
    console.log('stockService.getStockById called with', id);
  },
};
