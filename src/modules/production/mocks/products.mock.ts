import { FinishedProduct } from '../types';

export const INITIAL_FINISHED_PRODUCTS: FinishedProduct[] = [
  {
    id: 'finished-1',
    productName: 'Merguez de Poulet',
    lotNumber: 'LOT-PROD-20260711-001',
    elevageLotNumber: 'LOT-2024-0101',
    dateFabrication: '2026-07-11',
    dateLimite: '2026-07-21',
    quantity: 150,
    weight: 75,
    status: 'En stock',
    stock: 150
  },
  {
    id: 'finished-2',
    productName: 'Poulet fumé',
    lotNumber: 'LOT-PROD-20260713-002',
    elevageLotNumber: 'LOT-2024-0202',
    dateFabrication: '2026-07-13',
    dateLimite: '2026-07-23',
    quantity: 80,
    weight: 160,
    status: 'En stock',
    stock: 80
  },
  {
    id: 'finished-3',
    productName: 'Poulet entier',
    lotNumber: 'LOT-PROD-20260710-003',
    elevageLotNumber: 'LOT-2024-0101',
    dateFabrication: '2026-07-10',
    dateLimite: '2026-07-20',
    quantity: 200,
    weight: 480,
    status: 'En stock',
    stock: 120 // some sold
  }
];
