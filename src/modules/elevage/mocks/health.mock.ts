
import { HealthEvent, HealthEventType } from '../types';

export const MOCK_HEALTH_EVENTS: HealthEvent[] = [
  {
    id: '1',
    date: '2024-05-15',
    lotId: '1',
    type: HealthEventType.VACCINATION,
    product: 'Vaccin Gumboro',
    responsible: 'Dr. Yao',
    comment: 'Vaccination de routine',
    createdAt: '2024-05-15'
  },
  {
    id: '2',
    date: '2024-05-30',
    lotId: '1',
    type: HealthEventType.VACCINATION,
    product: 'Vaccin Newcastle',
    responsible: 'Dr. Yao',
    comment: 'Vaccination booster',
    createdAt: '2024-05-30'
  },
  {
    id: '3',
    date: '2024-06-20',
    lotId: '1',
    type: HealthEventType.DECES,
    product: null,
    responsible: 'Koffi Mensah',
    comment: '15 décès, cause non identifiée',
    mortalityCount: 15,
    createdAt: '2024-06-20'
  },
  {
    id: '4',
    date: '2024-07-10',
    lotId: '1',
    type: HealthEventType.CONTROLE_VETERINAIRE,
    product: null,
    responsible: 'Dr. Yao',
    comment: 'Contrôle sanitaire satisfaisant',
    createdAt: '2024-07-10'
  },
  {
    id: '5',
    date: '2024-07-22',
    lotId: '2',
    type: HealthEventType.VACCINATION,
    product: 'Vaccin Gumboro',
    responsible: 'Dr. Yao',
    comment: 'Vaccination programmée',
    createdAt: '2024-07-15'
  }
];
