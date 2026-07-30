import { PackagingDetails } from '../types';

export const MOCK_PACKAGINGS: (PackagingDetails & { lotId: string; elevageLotNumber: string })[] = [
  {
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    packagingType: 'Barquette sous atmosphère',
    quantity: 150,
    weight: 75,
    date: '2026-07-11',
    responsible: 'Fatou Diop',
    productionLotNumber: 'LOT-PROD-20260711-001'
  },
  {
    lotId: 'prod-lot-2',
    elevageLotNumber: 'LOT-2024-0202',
    packagingType: 'Film rétractable & étiquette',
    quantity: 80,
    weight: 160,
    date: '2026-07-13',
    responsible: 'Fatou Diop',
    productionLotNumber: 'LOT-PROD-20260713-002'
  }
];
