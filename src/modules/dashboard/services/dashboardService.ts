import { stockService } from '../../../core/services/stockService';
import { productionService } from '../../../core/services/productionService';
import { elevageService } from '../../elevage/services/elevageService';
import { farmService } from '../../../core/services/farmService';
import {
  DashboardStat,
  ProductionChartData,
  ProductDistributionData,
  StockItem,
  ProductionItem,
  RecentOrder,
  TimelineItem,
  AlertItem,
  RecentActivity,
  CalendarEvent,
  SalesChartData,
  RevenueExpenseData,
} from '../types';

/**
 * Service Dashboard ERP Réel
 * Agrège les données réelles des modules Élevage, Production, Stock et Ferme.
 * Ne présente aucune statistique fictive.
 */
export const dashboardService = {
  /**
   * Récupère les 10 KPIs consolidés réels
   */
  async getDashboardStats(): Promise<DashboardStat[]> {
    try {
      const [elevageStats, prodStats, stockStats, farms] = await Promise.all([
        elevageService.getDashboardStats().catch(() => ({
          lotsArrivee: 0,
          lotsEnElevage: 0,
          lotsEnVaccination: 0,
          lotsEnTraitement: 0,
          lotsPretsAbattage: 0,
          lotsTransferes: 0,
          totalBirds: 0,
          poulailersCount: 0,
          capacityUsed: 0,
          monthlyMortality: 0,
          monthlyFeedConsumption: 0,
          upcomingVaccinations: [],
          lotsReadyForSlaughter: [],
          activeLotsCount: 0,
          birdEvolution: [],
          feedEvolution: [],
          mortalityEvolution: [],
          weightEvolution: [],
        })),
        productionService.getDashboardStats().catch(() => ({
          lotsEnCours: 0,
          poidsTraite: 0,
          produitsFinis: 0,
          rendementMoyen: 0,
          controlesReussis: 0,
          rejets: 0,
        })),
        stockService.getDashboardStats().catch(() => ({
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalMovements: 0,
          criticalAlerts: 0,
        })),
        farmService.getAllWithoutPagination().catch(() => []),
      ]);

      const finishedProducts = await productionService.getFinishedProducts().catch(() => []);

      return [
        {
          id: 'kpi-elevage-lots',
          icon: 'package',
          value: elevageStats.activeLotsCount ?? 0,
          title: 'Lots en Élevage',
          color: 'bg-brand-green',
          route: '/admin/elevage?tab=lots',
          module: 'Élevage',
          badge: 'Actifs',
        },
        {
          id: 'kpi-elevage-poulaillers',
          icon: 'home',
          value: elevageStats.poulailersCount ?? 0,
          title: 'Poulaillers',
          color: 'bg-brand-blue',
          route: '/admin/elevage?tab=poulaillers',
          module: 'Élevage',
          badge: `${elevageStats.capacityUsed ?? 0}% occup.`,
        },
        {
          id: 'kpi-fermes',
          icon: 'building',
          value: farms.length,
          title: 'Fermes & Sites',
          color: 'bg-brand-green',
          route: '/admin/farms?tab=farms',
          module: 'Ferme',
          badge: 'Exploitations',
        },
        {
          id: 'kpi-prod-lots',
          icon: 'factory',
          value: Number(prodStats.lotsEnCours) || 0,
          title: 'Lots en Production',
          color: 'bg-brand-blue',
          route: '/admin/production?tab=overview',
          module: 'Production',
          badge: `${Number(prodStats.lotsEnCours) || 0} en cours`,
        },
        {
          id: 'kpi-prod-volume',
          icon: 'activity',
          value: `${(Number(prodStats.poidsTraite) || 0).toLocaleString('fr-FR')} kg`,
          title: 'Poids en Traitement',
          color: 'bg-brand-blue',
          route: '/admin/production?tab=overview',
          module: 'Production',
        },
        {
          id: 'kpi-prod-finis',
          icon: 'package-check',
          value: finishedProducts.length,
          title: 'Produits Fabriqués',
          color: 'bg-brand-green',
          route: '/admin/production?tab=produits',
          module: 'Production',
        },
        {
          id: 'kpi-stock-articles',
          icon: 'package',
          value: Number(stockStats.totalProducts) || 0,
          title: 'Articles en Stock',
          color: 'bg-brand-blue',
          route: '/admin/stock?tab=products',
          module: 'Stock',
        },
        {
          id: 'kpi-stock-alertes',
          icon: 'alert-triangle',
          value: Number(stockStats.lowStockCount) || 0,
          title: 'Alertes Stock Faible',
          color: (Number(stockStats.lowStockCount) || 0) > 0 ? 'bg-brand-red' : 'bg-brand-green',
          route: '/admin/stock?tab=alerts',
          module: 'Stock',
          badge: (Number(stockStats.lowStockCount) || 0) > 0 ? `${Number(stockStats.lowStockCount) || 0} alertes` : 'Normal',
        },
        {
          id: 'kpi-stock-valeur',
          icon: 'wallet',
          value: `${(Number(stockStats.totalValue) || 0).toLocaleString('fr-FR')} FCFA`,
          title: 'Valeur Stock',
          color: 'bg-brand-blue',
          route: '/admin/stock?tab=products',
          module: 'Stock',
        },
        {
          id: 'kpi-elevage-vaccins',
          icon: 'clock',
          value: elevageStats.upcomingVaccinations?.length ?? 0,
          title: 'Vaccinations à Venir',
          color: 'bg-brand-red',
          route: '/admin/elevage?tab=sante',
          module: 'Élevage',
        },
      ];
    } catch (e) {
      console.error('Erreur getDashboardStats:', e);
      return [];
    }
  },

  /**
   * Répartition des étapes du module Élevage
   */
  async getElevagePhasesChartData(): Promise<ProductionChartData> {
    try {
      const elevageStats = await elevageService.getDashboardStats();
      return {
        daily: [
          { label: 'Arrivée', value: elevageStats.lotsArrivee || 0 },
          { label: 'En élevage', value: elevageStats.lotsEnElevage || 0 },
          { label: 'En vaccination', value: elevageStats.lotsEnVaccination || 0 },
          { label: 'Sous traitement', value: elevageStats.lotsEnTraitement || 0 },
          { label: 'Prêts abattage', value: elevageStats.lotsPretsAbattage || 0 },
        ],
        weekly: [],
        monthly: [],
      };
    } catch {
      return { daily: [], weekly: [], monthly: [] };
    }
  },

  /**
   * Avancement du workflow de Production
   */
  async getProductionWorkflowChartData(): Promise<ProductionChartData> {
    try {
      const lots = await productionService.getAllLots();
      const statusCounts: Record<string, number> = {};
      lots.forEach((l) => {
        const s = l.status || 'Non défini';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      return {
        daily: Object.entries(statusCounts).map(([label, value]) => ({
          label,
          value,
        })),
        weekly: [],
        monthly: [],
      };
    } catch {
      return { daily: [], weekly: [], monthly: [] };
    }
  },

  /**
   * Répartition réelle des produits en stock
   */
  async getProductDistributionData(): Promise<ProductDistributionData[]> {
    try {
      const stockItems = await stockService.getAll();
      // Palette DABA — accents sobres, pas de couleurs criardes
      const colors = ['#42B649', '#244A9B', '#036EB1', '#3CAF50', '#E11D2E', '#AE151E'];

      return stockItems.slice(0, 6).map((item, index) => ({
        name: item.productName || `Produit #${item.productId}`,
        value: Number(item.quantity) || 0,
        color: colors[index % colors.length],
      }));
    } catch {
      return [];
    }
  },

  /**
   * Niveaux de stocks réels (avec alertes réelles)
   */
  async getStocksData(): Promise<StockItem[]> {
    try {
      const stockItems = await stockService.getAll();
      const colors = ['bg-brand-green', 'bg-brand-blue', 'bg-yellow-500', 'bg-purple-500', 'bg-brand-red'];

      return stockItems.slice(0, 6).map((s, index) => {
        const qty = Number(s.quantity) || 0;
        const min = Number(s.minStock) || 10;
        const max = Number(s.maxStock) || (min * 3) || 100;
        const pct = Math.min(100, Math.max(0, Math.round((qty / max) * 100)));
        const isAlert = qty <= min;

        return {
          id: String(s.id),
          name: s.productName || `Article #${s.productId}`,
          level: qty,
          percentage: pct,
          color: isAlert ? 'bg-brand-red' : colors[index % colors.length],
          alert: isAlert,
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Lots récents de production
   */
  async getProductionItems(): Promise<ProductionItem[]> {
    try {
      const lots = await productionService.getAllLots();
      return lots.slice(0, 5).map((lot) => ({
        id: String(lot.id),
        time: lot.updatedAt ? new Date(lot.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
        product: lot.lotNumber || `Lot #${lot.id}`,
        lot: lot.elevageLotNumber || `EL-${lot.elevageLotId}`,
        quantity: `${lot.quantity} sujets`,
        responsible: lot.status || 'En cours',
        status: (lot.status === 'STOCK' || lot.status === 'PRODUIT_TERMINE' ? 'Terminé' : 'En cours') as ProductionItem['status'],
      }));
    } catch {
      return [];
    }
  },

  /**
   * Alertes réelles consolidées (Stock + Santé Élevage)
   */
  async getAlertsData(): Promise<AlertItem[]> {
    try {
      const [stockAlerts, healthEvents] = await Promise.all([
        stockService.getAlerts().catch(() => []),
        elevageService.getHealthEvents().catch(() => []),
      ]);

      const alerts: AlertItem[] = [];

      // Alertes de stock réelles
      (stockAlerts as any[]).forEach((a: any) => {
        alerts.push({
          id: `stock-${a.id}`,
          type: 'Stock faible',
          priority: a.alertLevel === 'CRITICAL' ? 'Haute' : 'Moyenne',
          date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
          description: `${a.productName} : seuil critique (${a.currentStock} ${a.unit || 'unités'} restantes)`,
          icon: 'alert-triangle',
        });
      });

      // Alertes sanitaires / vaccinations à venir
      const today = new Date().toISOString().split('T')[0];
      (healthEvents as any[])
        .filter((h: any) => (h.date || '') >= today)
        .slice(0, 3)
        .forEach((h: any) => {
          alerts.push({
            id: `health-${h.id}`,
            type: 'Vaccination',
            priority: 'Moyenne',
            date: h.date || today,
            description: `${h.type || 'Vaccination'} programmée pour le lot #${h.lotId} : ${h.treatment || h.product || 'Traitement'}`,
            icon: 'syringe',
          });
        });

      return alerts.slice(0, 6);
    } catch {
      return [];
    }
  },

  /**
   * Journal d'audit et activités récentes consolidées
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const [prodHistory, elevageHistory, stockMovements] = await Promise.all([
        productionService.getHistory().catch(() => []),
        elevageService.getHistory().catch(() => []),
        stockService.getAllMovements().catch(() => []),
      ]);

      const activities: RecentActivity[] = [];

      prodHistory.slice(0, 4).forEach((ph) => {
        activities.push({
          id: `ph-${ph.id}`,
          type: 'Transformation',
          description: `Production : ${ph.action} (Lot #${ph.lotId})`,
          time: ph.createdAt ? new Date(ph.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Récemment',
          user: ph.operator || 'Opérateur',
          icon: 'factory',
        });
      });

      elevageHistory.slice(0, 4).forEach((eh) => {
        activities.push({
          id: `eh-${eh.id}`,
          type: 'Ajout d\'un lot',
          description: `Élevage : ${eh.description}`,
          time: eh.date || 'Récemment',
          user: eh.responsible || 'Responsable élevage',
          icon: 'package',
        });
      });

      stockMovements.slice(0, 4).forEach((sm) => {
        activities.push({
          id: `sm-${sm.id}`,
          type: sm.type === 'IN' ? 'Entrée Stock' : 'Sortie Stock',
          description: `Stock : ${sm.quantity} ${sm.unit} de ${sm.productName}`,
          time: sm.movementDate ? new Date(sm.movementDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Récemment',
          user: sm.operator || 'Responsable Stock',
          icon: 'package-check',
        });
      });

      // Trier les activités par heure/date théoriquement (ici limité et concaténé)
      return activities.slice(0, 6);
    } catch {
      return [];
    }
  },

  /**
   * Timeline chronologique des événements
   */
  async getTimelineData(): Promise<TimelineItem[]> {
    try {
      const elevageHistory = await elevageService.getTimelineEvents();
      return elevageHistory.slice(0, 6).map((e) => ({
        id: String(e.id),
        type: (e.type === 'Abattage' ? 'Abattage' : e.type === 'Transfert' ? 'Transformation' : 'Réception') as TimelineItem['type'],
        title: e.description,
        time: e.date,
        icon: 'package',
        color: 'bg-brand-green',
      }));
    } catch {
      return [];
    }
  },

  /**
   * Données non connectées (Commercial / Ventes / Finances non encore intégrés)
   */
  async getRecentOrders(): Promise<RecentOrder[]> {
    // Aucune API de commandes disponible actuellement -> tableau vide pour ne pas afficher de fake data
    return [];
  },

  async getSalesChartData(): Promise<SalesChartData | null> {
    // Données de ventes indisponibles sans module commercial connecté
    return null;
  },

  async getProductionChartData(): Promise<ProductionChartData | null> {
    return this.getProductionWorkflowChartData();
  },

  async getRevenueExpenseData(): Promise<RevenueExpenseData | null> {
    // Données financières indisponibles sans module finance connecté
    return null;
  },

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return [];
  },
};
