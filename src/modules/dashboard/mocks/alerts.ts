
import { AlertItem } from '../types';

export const alertsData: AlertItem[] = [
  {
    id: '1',
    type: 'Stock faible',
    priority: 'Haute',
    date: '20/07/2026',
    description: 'Stock de matières premières critique (34%)',
    icon: 'alert-triangle',
  },
  {
    id: '2',
    type: 'Vaccination',
    priority: 'Moyenne',
    date: '22/07/2026',
    description: 'Vaccination prévue pour poulailler 4',
    icon: 'syringe',
  },
  {
    id: '3',
    type: 'Commande urgente',
    priority: 'Haute',
    date: '21/07/2026',
    description: 'Commande urgente à préparer pour demain',
    icon: 'clock',
  },
  {
    id: '4',
    type: 'Maintenance',
    priority: 'Moyenne',
    date: '23/07/2026',
    description: 'Maintenance machine à découper',
    icon: 'wrench',
  },
];

