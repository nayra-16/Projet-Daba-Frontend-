import { ProductionLot, ProductionStep, QualityStatus } from '../types';

// This file exports the initial mock state for received lots.
// The actual state will be managed in-memory by the productionService to allow live demo additions.
export const INITIAL_RECEIVED_LOTS: ProductionLot[] = [
  {
    id: 'prod-lot-recu-1',
    elevageLotId: '4',
    elevageLotNumber: 'LOT-2024-0301',
    name: 'Lot Mars 2024 - Poulailler 1',
    quantity: 900,
    weight: 3150, // 900 * 3.5 kg
    dateFabrication: '2026-07-15',
    dateLimite: '2026-07-25',
    responsible: 'Ama Asamoah',
    status: ProductionStep.RECEPTION,
    qualityStatus: QualityStatus.PENDING,
    observations: 'Transféré de l\'élevage le 15/07/2026. Prêt pour prise en charge.',
    createdAt: '2026-07-15',
    updatedAt: '2026-07-15',
    history: [
      {
        id: 'h-init-1',
        date: '2026-07-15',
        time: '08:30',
        step: ProductionStep.RECEPTION,
        responsible: 'Ama Asamoah',
        comment: 'Lot transféré automatiquement depuis le module Élevage'
      }
    ]
  },
  {
    id: 'prod-lot-recu-2',
    elevageLotId: '3',
    elevageLotNumber: 'LOT-2024-0401',
    name: 'Lot Avril 2024 - Poulailler 3',
    quantity: 1200,
    weight: 3840, // 1200 * 3.2 kg
    dateFabrication: '2026-07-18',
    dateLimite: '2026-07-28',
    responsible: 'Kofi Mensah',
    status: ProductionStep.ATTENTE_ABATTAGE,
    qualityStatus: QualityStatus.PENDING,
    observations: 'Prêt pour l\'abattage, poids cible atteint.',
    createdAt: '2026-07-18',
    updatedAt: '2026-07-18',
    history: [
      {
        id: 'h-init-2',
        date: '2026-07-18',
        time: '09:00',
        step: ProductionStep.RECEPTION,
        responsible: 'Kofi Mensah',
        comment: 'Lot transféré automatiquement depuis le module Élevage'
      },
      {
        id: 'h-step-2',
        date: '2026-07-18',
        time: '10:00',
        step: ProductionStep.ATTENTE_ABATTAGE,
        responsible: 'Kofi Mensah',
        comment: 'Mis en attente d\'abattage'
      }
    ]
  }
];
