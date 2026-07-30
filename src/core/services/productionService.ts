
import axiosInstance from '../api/axios';

export const productionService = {
  async getDashboardData() {
    console.log('productionService.getDashboardData called');
  },

  async getReceivedLots() {
    console.log('productionService.getReceivedLots called');
  },

  async getSlaughterRecords() {
    console.log('productionService.getSlaughterRecords called');
  },

  async getCuttingRecords() {
    console.log('productionService.getCuttingRecords called');
  },

  async getProcessingRecords() {
    console.log('productionService.getProcessingRecords called');
  },

  async getPackagingRecords() {
    console.log('productionService.getPackagingRecords called');
  },

  async getQualityControls() {
    console.log('productionService.getQualityControls called');
  },

  async getProducedProducts() {
    console.log('productionService.getProducedProducts called');
  },

  async getHistory() {
    console.log('productionService.getHistory called');
  },

  async getLotById(id: string) {
    console.log('productionService.getLotById called with', id);
  },
};
