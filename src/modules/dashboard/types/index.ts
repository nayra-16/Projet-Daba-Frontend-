
export interface DashboardStat {
  id: string;
  icon: string;
  value: string | number;
  title: string;
  variation: number;
  trend: 'up' | 'down';
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SalesChartData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
}

export interface ProductionChartData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
}

export interface RevenueExpenseData {
  labels: string[];
  revenue: number[];
  expenses: number[];
}

export interface ProductDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface StockItem {
  id: string;
  name: string;
  level: number;
  percentage: number;
  color: string;
  alert: boolean;
}

export interface ProductionItem {
  id: string;
  time: string;
  product: string;
  lot: string;
  quantity: string;
  responsible: string;
  status: 'Terminé' | 'En cours' | 'À venir';
}

export interface RecentOrder {
  id: string;
  client: string;
  date: string;
  amount: string;
  status: 'En attente' | 'En cours' | 'Livré' | 'Annulé';
}

export interface TimelineItem {
  id: string;
  type: 'Livraison' | 'Transformation' | 'Abattage' | 'Commande' | 'Réception' | 'Connexion utilisateur';
  title: string;
  time: string;
  icon: string;
  color: string;
}

export interface AlertItem {
  id: string;
  type: 'Stock faible' | 'Vaccination' | 'Commande urgente' | 'Livraison retardée' | 'Maintenance';
  priority: 'Haute' | 'Moyenne' | 'Basse';
  date: string;
  description: string;
  icon: string;
}

export interface RecentActivity {
  id: string;
  type: 'Connexion' | 'Création de commande' | 'Ajout d\'un lot' | 'Transformation' | 'Suppression' | 'Modification';
  description: string;
  time: string;
  user: string;
  icon: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  color: string;
}

