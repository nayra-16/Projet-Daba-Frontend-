
import { ElevageDashboardStats, Lot, LotStatus, HealthEvent, HealthEventType } from '../types';
import { MOCK_LOTS } from './lots.mock';
import { MOCK_POULAILERS } from './poulailers.mock';
import { MOCK_HEALTH_EVENTS } from './health.mock';

// Create derived dashboard stats from existing mocks
const totalCapacity = MOCK_POULAILERS.reduce((sum, p) => sum + p.capacity, 0);
const totalBirds = MOCK_LOTS.filter(l => l.status !== LotStatus.TERMINE && l.status !== LotStatus.ARCHIVE).reduce((sum, l) => sum + l.chickCount, 0);
const activeLots = MOCK_LOTS.filter(l => l.status !== LotStatus.TERMINE && l.status !== LotStatus.ARCHIVE);
const lotsReady = MOCK_LOTS.filter(l => l.status === LotStatus.PRET_ABATTAGE);
const upcomingVaccinations = MOCK_HEALTH_EVENTS.filter(h => h.type === HealthEventType.VACCINATION && new Date(h.date) > new Date());

export const MOCK_DASHBOARD_STATS: ElevageDashboardStats = {
  lotsArrivee: MOCK_LOTS.filter(l => l.status === LotStatus.ARRIVEE).length,
  lotsEnElevage: MOCK_LOTS.filter(l => l.status === LotStatus.EN_ELEVAGE).length,
  lotsEnVaccination: MOCK_LOTS.filter(l => l.status === LotStatus.VACCINATION).length,
  lotsEnTraitement: MOCK_LOTS.filter(l => l.status === LotStatus.TRAITEMENT).length,
  lotsPretsAbattage: lotsReady.length,
  lotsTransferes: MOCK_LOTS.filter(l => l.status === LotStatus.TRANSFERE_PRODUCTION).length,
  totalBirds: totalBirds,
  poulailersCount: MOCK_POULAILERS.length,
  capacityUsed: totalCapacity > 0 ? Math.round((totalBirds / totalCapacity) * 100) : 0,
  monthlyMortality: 25,
  monthlyFeedConsumption: 1200,
  upcomingVaccinations: upcomingVaccinations,
  lotsReadyForSlaughter: lotsReady,
  birdEvolution: [
    { date: '2024-05-01', count: 1000 },
    { date: '2024-05-15', count: 995 },
    { date: '2024-06-01', count: 990 },
    { date: '2024-06-15', count: 985 },
    { date: '2024-07-01', count: 975 },
    { date: '2024-07-15', count: 960 }
  ],
  feedEvolution: [
    { date: '2024-05-01', quantity: 20 },
    { date: '2024-05-15', quantity: 30 },
    { date: '2024-06-01', quantity: 40 },
    { date: '2024-06-15', quantity: 45 },
    { date: '2024-07-01', quantity: 48 },
    { date: '2024-07-15', quantity: 50 }
  ],
  mortalityEvolution: [
    { date: '2024-05-01', count: 0 },
    { date: '2024-05-15', count: 5 },
    { date: '2024-06-01', count: 10 },
    { date: '2024-06-15', count: 15 },
    { date: '2024-07-01', count: 20 },
    { date: '2024-07-15', count: 25 }
  ],
  weightEvolution: [
    { date: '2024-05-01', weight: 0.05 },
    { date: '2024-05-15', weight: 0.3 },
    { date: '2024-06-01', weight: 0.9 },
    { date: '2024-06-15', weight: 1.5 },
    { date: '2024-07-01', weight: 2.0 },
    { date: '2024-07-15', weight: 2.3 }
  ]
};
