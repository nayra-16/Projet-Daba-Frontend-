import { ProcessingDetails } from '../types';

export const MOCK_PROCESSINGS: (ProcessingDetails & { lotId: string; elevageLotNumber: string })[] = [
  {
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    productName: 'Merguez de Poulet',
    quantity: 150,
    weight: 75, // 75 kg (0.5kg per sachet)
    date: '2026-07-11',
    responsible: 'Awa Sy',
    observations: 'Mélange d\'épices doux, boyaux naturels, lot très homogène.'
  },
  {
    lotId: 'prod-lot-2',
    elevageLotNumber: 'LOT-2024-0202',
    productName: 'Poulet fumé',
    quantity: 80,
    weight: 160, // 2kg average per chicken
    date: '2026-07-13',
    responsible: 'Awa Sy',
    observations: 'Fumage traditionnel au bois de hêtre effectué sur 12h.'
  }
];
