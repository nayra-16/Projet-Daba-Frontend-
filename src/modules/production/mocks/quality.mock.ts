import { QualityDetails } from '../types';

export const MOCK_QUALITIES: (QualityDetails & { lotId: string; elevageLotNumber: string })[] = [
  {
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    visualControl: 'CONFORME',
    weightControl: 'CONFORME',
    temperatureControl: 'CONFORME',
    conformity: 'CONFORME',
    comments: 'Lot 100% conforme. Étiquetage propre, poids respectés.',
    date: '2026-07-11',
    responsible: 'Moussa Sow'
  },
  {
    lotId: 'prod-lot-2',
    elevageLotNumber: 'LOT-2024-0202',
    visualControl: 'CONFORME',
    weightControl: 'CONFORME',
    temperatureControl: 'CONFORME',
    conformity: 'CONFORME',
    comments: 'Contrôle bactériologique et température OK (4°C à coeur).',
    date: '2026-07-13',
    responsible: 'Moussa Sow'
  }
];
