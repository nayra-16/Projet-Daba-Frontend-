
import axiosInstance from '../api/axios';

export const userService = {
  async getUsers() {
    // TODO: Replace with actual API call
    console.log('userService.getUsers called');
    // const response = await axiosInstance.get('/users');
    // return response.data;
  },

  async getUserById(id: string) {
    console.log('userService.getUserById called with', id);
  },

  async createUser() {
    // TODO: Implement
  },

  async updateUser() {
    // TODO: Implement
  },

  async deleteUser() {
    // TODO: Implement
  },
};
