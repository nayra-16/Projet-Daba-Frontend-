
import axiosInstance from '../api/axios';

export const dashboardService = {
  async getStats() {
    console.log('dashboardService.getStats called');
  },

  async getRevenueExpenses() {
    console.log('dashboardService.getRevenueExpenses called');
  },

  async getRecentActivity() {
    console.log('dashboardService.getRecentActivity called');
  },

  async getAlerts() {
    console.log('dashboardService.getAlerts called');
  },

  async getOrders() {
    console.log('dashboardService.getOrders called');
  },

  async getProductionData() {
    console.log('dashboardService.getProductionData called');
  },

  async getTopProducts() {
    console.log('dashboardService.getTopProducts called');
  },

  async getCalendarEvents() {
    console.log('dashboardService.getCalendarEvents called');
  },
};
