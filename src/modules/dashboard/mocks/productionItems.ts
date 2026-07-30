
import { ProductionItem } from '../types';

export const productionItems: ProductionItem[] = [
  {
    id: '1',
    time: '08h00',
    product: 'Saucisses',
    lot: 'LOT-001',
    quantity: '150 Kg',
    responsible: 'Jean',
    status: 'Terminé',
  },
  {
    id: '2',
    time: '09h30',
    product: 'Poulet entier',
    lot: 'LOT-002',
    quantity: '300 Kg',
    responsible: 'Marie',
    status: 'En cours',
  },
  {
    id: '3',
    time: '11h00',
    product: 'Blanc de poulet',
    lot: 'LOT-003',
    quantity: '200 Kg',
    responsible: 'Koffi',
    status: 'À venir',
  },
  {
    id: '4',
    time: '14h00',
    product: 'Cuisses marinées',
    lot: 'LOT-004',
    quantity: '180 Kg',
    responsible: 'Aya',
    status: 'À venir',
  },
];

