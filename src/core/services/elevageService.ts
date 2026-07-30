
import axiosInstance from '../api/axios';

export const elevageService = {
  async getDashboardData() {
    // TODO: Replace with actual API call
    console.log('elevageService.getDashboardData called');
  },

  async getLots() {
    console.log('elevageService.getLots called');
  },

  async getLotById(id: string) {
    console.log('elevageService.getLotById called with', id);
  },

  async createLot() {
    // TODO: Implement
  },

  async getPoulailers() {
    console.log('elevageService.getPoulailers called');
  },

  async getHealthRecords() {
    console.log('elevageService.getHealthRecords called');
  },

  async getFeedRecords() {
    console.log('elevageService.getFeedRecords called');
  },

  async getHistory() {
    console.log('elevageService.getHistory called');
  },
};
