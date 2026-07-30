
import { TimelineEvent, TimelineEventType } from '../types';

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    date: '2024-07-15',
    type: TimelineEventType.DISTRIBUTION_ALIMENT,
    lotId: '1',
    description: 'Distribution de 50 kg d\'aliment croissance',
    responsible: 'Koffi Mensah',
    createdAt: '2024-07-15'
  },
  {
    id: '2',
    date: '2024-07-14',
    type: TimelineEventType.PESEE,
    lotId: '1',
    description: 'Pesée hebdomadaire: poids moyen 2.3 kg',
    responsible: 'Koffi Mensah',
    createdAt: '2024-07-14'
  },
  {
    id: '3',
    date: '2024-07-10',
    type: TimelineEventType.CONTROLE_VETERINAIRE,
    lotId: '1',
    description: 'Contrôle sanitaire par Dr. Yao',
    responsible: 'Dr. Yao',
    createdAt: '2024-07-10'
  },
  {
    id: '4',
    date: '2024-06-20',
    type: TimelineEventType.MORTALITE,
    lotId: '1',
    description: '15 décès enregistrés',
    responsible: 'Koffi Mensah',
    createdAt: '2024-06-20'
  },
  {
    id: '5',
    date: '2024-05-30',
    type: TimelineEventType.VACCINATION,
    lotId: '1',
    description: 'Vaccination Newcastle',
    responsible: 'Dr. Yao',
    createdAt: '2024-05-30'
  },
  {
    id: '6',
    date: '2024-05-01',
    type: TimelineEventType.CREATION_LOT,
    lotId: '1',
    description: 'Arrivée de 1000 poussins Ross 308',
    responsible: 'Koffi Mensah',
    createdAt: '2024-05-01'
  }
];
