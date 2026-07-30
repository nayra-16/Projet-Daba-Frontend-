import { CuttingDetails } from '../types';

export const MOCK_CUTTINGS: (CuttingDetails & { lotId: string; elevageLotNumber: string })[] = [
  {
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-10',
    responsible: 'Amadou Koné',
    pieces: {
      pouletEntier: { quantity: 200, weight: 480 },
      cuisses: { quantity: 400, weight: 120 },
      pilons: { quantity: 400, weight: 80 },
      ailes: { quantity: 800, weight: 100 },
      blancs: { quantity: 400, weight: 160 },
      foies: { quantity: 992, weight: 20 },
      gesiers: { quantity: 992, weight: 25 },
      autres: { quantity: 200, weight: 50 }
    }
  },
  {
    lotId: 'prod-lot-2',
    elevageLotNumber: 'LOT-2024-0202',
    date: '2026-07-12',
    responsible: 'Amadou Koné',
    pieces: {
      pouletEntier: { quantity: 150, weight: 360 },
      cuisses: { quantity: 300, weight: 90 },
      pilons: { quantity: 300, weight: 60 },
      ailes: { quantity: 600, weight: 75 },
      blancs: { quantity: 300, weight: 120 },
      foies: { quantity: 795, weight: 16 },
      gesiers: { quantity: 795, weight: 20 },
      autres: { quantity: 150, weight: 38 }
    }
  }
];
