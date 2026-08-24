
import { WorkflowStep, LotStatus } from '../types';

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: LotStatus.ARRIVEE,
    label: 'Arrivée des poussins',
    color: 'bg-blue-500',
    icon: '🐣',
    description: 'Arrivée des poussins à l\'exploitation',
    order: 1
  },
  {
    id: LotStatus.INSTALLE,
    label: 'Installation dans un poulailler',
    color: 'bg-purple-500',
    icon: '🏠',
    description: 'Installation des poussins dans leur poulailler',
    order: 2
  },
  {
    id: LotStatus.EN_ELEVAGE,
    label: 'Mise en élevage',
    color: 'bg-green-500',
    icon: '🌾',
    description: 'Élevage quotidien des volailles',
    order: 3
  },
  {
    id: LotStatus.SUIVI_ALIMENTAIRE,
    label: 'Suivi alimentaire',
    color: 'bg-amber-500',
    icon: '🍽️',
    description: 'Suivi de la consommation alimentaire',
    order: 4
  },
  {
    id: LotStatus.VACCINATION,
    label: 'Vaccination',
    color: 'bg-yellow-500',
    icon: '💉',
    description: 'Vaccination des volailles',
    order: 5
  },
  {
    id: LotStatus.TRAITEMENT,
    label: 'Traitements',
    color: 'bg-orange-500',
    icon: '🩺',
    description: 'Traitements médicaux si nécessaire',
    order: 6
  },
  {
    id: LotStatus.CONTROLE_POIDS,
    label: 'Contrôle du poids',
    color: 'bg-teal-500',
    icon: '⚖️',
    description: 'Contrôle du poids moyen des volailles',
    order: 7
  },
  {
    id: LotStatus.CONTROLE_SANITAIRE,
    label: 'Contrôle sanitaire',
    color: 'bg-indigo-500',
    icon: '✅',
    description: 'Contrôle sanitaire final avant abattage',
    order: 8
  },
  {
    id: LotStatus.PRET_ABATTAGE,
    label: 'Prêt pour l\'abattage',
    color: 'bg-brand-green',
    icon: '🔪',
    description: 'Lot prêt pour l\'abattage',
    order: 9
  },
  {
    id: LotStatus.TRANSFERE_PRODUCTION,
    label: 'Transféré vers le module Production',
    color: 'bg-brand-blue',
    icon: '🏭',
    description: 'Lot transféré vers le module Production',
    order: 10
  },
  {
    id: LotStatus.TERMINE,
    label: 'Terminé',
    color: 'bg-gray-500',
    icon: '🏁',
    description: 'Cycle terminé',
    order: 11
  },
  {
    id: LotStatus.ARCHIVE,
    label: 'Archivé',
    color: 'bg-gray-400',
    icon: '📁',
    description: 'Lot archivé',
    order: 12
  }
];
