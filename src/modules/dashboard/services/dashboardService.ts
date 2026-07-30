
import {
  DashboardStat,
  SalesChartData,
  ProductionChartData,
  RevenueExpenseData,
  ProductDistributionData,
  StockItem,
  ProductionItem,
  RecentOrder,
  TimelineItem,
  AlertItem,
  RecentActivity,
  CalendarEvent,
} from '../types';
import { dashboardStats } from '../mocks/dashboardStats';
import { salesChartData } from '../mocks/salesChart';
import { productionChartData } from '../mocks/productionChart';
import { revenueExpenseData } from '../mocks/revenueExpense';
import { productDistributionData } from '../mocks/productDistribution';
import { stocksData } from '../mocks/stocks';
import { productionItems } from '../mocks/productionItems';
import { recentOrders } from '../mocks/orders';
import { timelineData } from '../mocks/timeline';
import { alertsData } from '../mocks/alerts';
import { recentActivities } from '../mocks/activities';
import { calendarEvents } from '../mocks/calendar';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStat[]> {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300));
    return dashboardStats;
  },

  async getSalesChartData(): Promise<SalesChartData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return salesChartData;
  },

  async getProductionChartData(): Promise<ProductionChartData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return productionChartData;
  },

  async getRevenueExpenseData(): Promise<RevenueExpenseData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return revenueExpenseData;
  },

  async getProductDistributionData(): Promise<ProductDistributionData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return productDistributionData;
  },

  async getStocksData(): Promise<StockItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return stocksData;
  },

  async getProductionItems(): Promise<ProductionItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return productionItems;
  },

  async getRecentOrders(): Promise<RecentOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return recentOrders;
  },

  async getTimelineData(): Promise<TimelineItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return timelineData;
  },

  async getAlertsData(): Promise<AlertItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return alertsData;
  },

  async getRecentActivities(): Promise<RecentActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return recentActivities;
  },

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return calendarEvents;
  },
};

