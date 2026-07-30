import { ProductionHistoryEvent, ProductionStep } from '../types';

export interface TimelineEventWithLot extends ProductionHistoryEvent {
  lotId: string;
  elevageLotNumber: string;
}

export const MOCK_TIMELINE_EVENTS: TimelineEventWithLot[] = [
  {
    id: 't-1',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-10',
    time: '08:00',
    step: ProductionStep.RECEPTION,
    responsible: 'Ama Asamoah',
    comment: 'Réception du lot et vérification du poids initial.'
  },
  {
    id: 't-2',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-10',
    time: '09:30',
    step: ProductionStep.ABATTAGE_TERMINE,
    responsible: 'Amadou Koné',
    comment: 'Abattage terminé. 992 volailles abattues, 8 pertes enregistrées.'
  },
  {
    id: 't-3',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-10',
    time: '14:00',
    step: ProductionStep.DECOUPE_TERMINEE,
    responsible: 'Amadou Koné',
    comment: 'Découpe effectuée : poulet entier, cuisses, pilons, blancs, abats.'
  },
  {
    id: 't-4',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-11',
    time: '09:00',
    step: ProductionStep.TRANSFORMATION,
    responsible: 'Awa Sy',
    comment: 'Transformation en 150 sachets de Merguez (75 kg total).'
  },
  {
    id: 't-5',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-11',
    time: '14:00',
    step: ProductionStep.CONDITIONNEMENT,
    responsible: 'Fatou Diop',
    comment: 'Conditionnement sous atmosphère protectrice. Code de lot généré.'
  },
  {
    id: 't-6',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-11',
    time: '16:30',
    step: ProductionStep.CONTROLE_QUALITE,
    responsible: 'Moussa Sow',
    comment: 'Contrôle qualité validé. Température, poids et visuel conformes.'
  },
  {
    id: 't-7',
    lotId: 'prod-lot-1',
    elevageLotNumber: 'LOT-2024-0101',
    date: '2026-07-11',
    time: '17:00',
    step: ProductionStep.STOCK,
    responsible: 'Moussa Sow',
    comment: 'Transfert automatique vers les stocks de produits finis.'
  }
];
