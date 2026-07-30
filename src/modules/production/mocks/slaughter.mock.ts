import { SlaughterDetails } from '../types';

export const MOCK_SLAUGHTERS: (SlaughterDetails & { lotId: string; elevageLotNumber: string })[] = [
  {
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-10',
    time: '06:00',
    responsible: 'Amadou Koné',
    quantityReceived: 1000,
    quantitySlaughtered: 992,
    losses: 8,
    lossesReason: 'Stress de transport et étouffement léger',
    observations: 'Rendement carcasse excellent, poids moyen de 2.4 kg'
  },
  {
    lotId: 'prod-lot-2',
    elevageLotNumber: 'LOT-2024-0202',
    date: '2026-07-12',
    time: '06:30',
    responsible: 'Amadou Koné',
    quantityReceived: 800,
    quantitySlaughtered: 795,
    losses: 5,
    lossesReason: 'Faiblesse cardiaque',
    observations: 'Plumage facile, aucun signe de maladie'
  }
];
