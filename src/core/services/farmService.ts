
import axiosInstance from '../api/axios';

export const farmService = {
  async getFarms() {
    // TODO: Replace with actual API call
    console.log('farmService.getFarms called');
    // const response = await axiosInstance.get('/farms');
    // return response.data;
  },

  async getFarmById(id: string) {
    console.log('farmService.getFarmById called with', id);
  },

  async createFarm() {
    // TODO: Implement
  },

  async updateFarm() {
    // TODO: Implement
  },

  async deleteFarm() {
    // TODO: Implement
  },
};
