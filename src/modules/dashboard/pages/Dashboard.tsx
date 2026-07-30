
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import DashboardCard from '../components/DashboardCard';
import BarChart from '../components/BarChart';
import RevenueExpenseChart from '../components/RevenueExpenseChart';
import ProductDistributionChart from '../components/ProductDistributionChart';
import StockCard from '../components/StockCard';
import ProductionTable from '../components/ProductionTable';
import OrdersTable from '../components/OrdersTable';
import Timeline from '../components/Timeline';
import AlertCard from '../components/AlertCard';
import ActivityCard from '../components/ActivityCard';
import CalendarCard from '../components/CalendarCard';
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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [salesData, setSalesData] = useState<SalesChartData | null>(null);
  const [productionData, setProductionData] = useState<ProductionChartData | null>(null);
  const [revenueExpenseData, setRevenueExpenseData] = useState<RevenueExpenseData | null>(null);
  const [productDistribution, setProductDistribution] = useState<ProductDistributionData[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          statsData,
          sales,
          production,
          revExp,
          productDist,
          stocksData,
          prodItems,
          orders,
          timelineData,
          alertsData,
          activitiesData,
          calendar,
        ] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getSalesChartData(),
          dashboardService.getProductionChartData(),
          dashboardService.getRevenueExpenseData(),
          dashboardService.getProductDistributionData(),
          dashboardService.getStocksData(),
          dashboardService.getProductionItems(),
          dashboardService.getRecentOrders(),
          dashboardService.getTimelineData(),
          dashboardService.getAlertsData(),
          dashboardService.getRecentActivities(),
          dashboardService.getCalendarEvents(),
        ]);

        setStats(statsData);
        setSalesData(sales);
        setProductionData(production);
        setRevenueExpenseData(revExp);
        setProductDistribution(productDist);
        setStocks(stocksData);
        setProductionItems(prodItems);
        setRecentOrders(orders);
        setTimeline(timelineData);
        setAlerts(alertsData);
        setActivities(activitiesData);
        setCalendarEvents(calendar);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-brand-text mb-2">Dashboard ERP</h1>
          <p className="text-gray-600">Vue d'ensemble des activités de DABA</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <DashboardCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {salesData && <BarChart data={salesData.daily} title="Ventes quotidiennes" color="#42B649" />}
          {productionData && <BarChart data={productionData.daily} title="Production quotidienne" color="#244A9B" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {revenueExpenseData && <RevenueExpenseChart data={revenueExpenseData} />}
          {productDistribution.length > 0 && <ProductDistributionChart data={productDistribution} />}
        </div>

        {/* Stocks Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stocks.map((stock) => (
            <StockCard key={stock.id} item={stock} />
          ))}
        </div>

        {/* Production & Orders */}
        <div className="space-y-6 mb-8">
          {productionItems.length > 0 && <ProductionTable items={productionItems} />}
          {recentOrders.length > 0 && <OrdersTable orders={recentOrders} />}
        </div>

        {/* Timeline, Alerts, Activities, Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {timeline.length > 0 && <Timeline items={timeline} />}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-brand-text mb-4">Alertes</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-brand-text mb-4">Activités récentes</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-8">
          {calendarEvents.length > 0 && <CalendarCard events={calendarEvents} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

