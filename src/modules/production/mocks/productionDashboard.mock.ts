export interface ProductionDashboardStats {
  receivedToday: number;
  waitingLots: number;
  inSlaughter: number;
  inCutting: number;
  inProcessing: number;
  inPackaging: number;
  inQualityCheck: number;
  finishedProducts: number;
  rejectedProducts: number;
  dailyProductionKg: number;
  monthlyProductionKg: number;
  averageProductionTimeHours: number;
  
  // Charts data
  dailyProduction: { date: string; value: number }[];
  monthlyProduction: { date: string; value: number }[];
  productDistribution: { name: string; value: number; color: string }[];
  averageTimePerStep: { step: string; hours: number }[];
  yieldRate: { date: string; rate: number }[];
}

export const MOCK_PRODUCTION_DASHBOARD: ProductionDashboardStats = {
  receivedToday: 3,
  waitingLots: 2,
  inSlaughter: 1,
  inCutting: 1,
  inProcessing: 1,
  inPackaging: 1,
  inQualityCheck: 1,
  finishedProducts: 1240,
  rejectedProducts: 12,
  dailyProductionKg: 850,
  monthlyProductionKg: 24500,
  averageProductionTimeHours: 4.8,

  dailyProduction: [
    { date: '14 Juil', value: 720 },
    { date: '15 Juil', value: 810 },
    { date: '16 Juil', value: 690 },
    { date: '17 Juil', value: 850 },
    { date: '18 Juil', value: 900 },
    { date: '19 Juil', value: 650 },
    { date: '20 Juil', value: 850 },
  ],

  monthlyProduction: [
    { date: 'Jan', value: 18000 },
    { date: 'Fév', value: 19500 },
    { date: 'Mar', value: 21000 },
    { date: 'Avr', value: 20500 },
    { date: 'Mai', value: 23000 },
    { date: 'Juin', value: 24500 },
  ],

  productDistribution: [
    { name: 'Poulet entier', value: 45, color: '#42B649' },
    { name: 'Cuisses & Pilons', value: 25, color: '#244A9B' },
    { name: 'Blancs de poulet', value: 15, color: '#F59E0B' },
    { name: 'Produits transformés', value: 10, color: '#8B5CF6' },
    { name: 'Abats & Autres', value: 5, color: '#EF4444' },
  ],

  averageTimePerStep: [
    { step: 'Réception & Attente', hours: 1.2 },
    { step: 'Abattage', hours: 0.8 },
    { step: 'Découpe', hours: 1.5 },
    { step: 'Transformation', hours: 2.0 },
    { step: 'Conditionnement', hours: 0.9 },
    { step: 'Contrôle qualité', hours: 0.5 },
  ],

  yieldRate: [
    { date: '14 Juil', rate: 94.5 },
    { date: '15 Juil', rate: 95.2 },
    { date: '16 Juil', rate: 93.8 },
    { date: '17 Juil', rate: 95.8 },
    { date: '18 Juil', rate: 96.0 },
    { date: '19 Juil', rate: 94.1 },
    { date: '20 Juil', rate: 95.5 },
  ]
};
