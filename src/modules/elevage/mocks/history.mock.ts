
import { HistoryEvent, LotStatus, TimelineEventType } from '../types';

export const MOCK_HISTORY: HistoryEvent[] = [
  {
    id: 'h1',
    lotId: '1',
    date: '2024-05-01',
    type: TimelineEventType.CREATION_LOT,
    status: LotStatus.ARRIVEE,
    title: 'Création du lot',
    description: 'Arrivée de 1000 poussins Ross 308',
    responsible: 'Koffi Mensah',
    createdAt: '2024-05-01'
  },
  {
    id: 'h2',
    lotId: '1',
    date: '2024-05-02',
    type: TimelineEventType.CHANGEMENT_STATUT,
    status: LotStatus.INSTALLE,
    title: 'Installation dans le poulailler 1',
    description: 'Installation des poussins dans le poulailler 1',
    responsible: 'Koffi Mensah',
    createdAt: '2024-05-02'
  },
  {
    id: 'h3',
    lotId: '1',
    date: '2024-05-15',
    type: TimelineEventType.VACCINATION,
    status: LotStatus.VACCINATION,
    title: 'Vaccination Newcastle',
    description: 'Vaccination des volailles contre la maladie de Newcastle',
    responsible: 'Dr Yao',
    createdAt: '2024-05-15'
  },
  {
    id: 'h4',
    lotId: '1',
    date: '2024-06-01',
    type: TimelineEventType.PESEE,
    status: LotStatus.CONTROLE_POIDS,
    title: 'Contrôle du poids',
    description: 'Poids moyen mesuré à 1.5 kg',
    responsible: 'Koffi Mensah',
    createdAt: '2024-06-01'
  },
  {
    id: 'h5',
    lotId: '1',
    date: '2024-06-20',
    type: TimelineEventType.CONTROLE_VETERINAIRE,
    status: LotStatus.CONTROLE_SANITAIRE,
    title: 'Contrôle sanitaire',
    description: 'Contrôle sanitaire final validé par le vétérinaire',
    responsible: 'Dr Yao',
    createdAt: '2024-06-20'
  },
  {
    id: 'h6',
    lotId: '1',
    date: '2024-06-25',
    type: TimelineEventType.CHANGEMENT_STATUT,
    status: LotStatus.PRET_ABATTAGE,
    title: 'Prêt pour l\'abattage',
    description: 'Lot prêt à être transféré vers l\'abattoir',
    responsible: 'Koffi Mensah',
    createdAt: '2024-06-25'
  }
];
