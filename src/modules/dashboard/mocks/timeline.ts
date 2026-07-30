
import { TimelineItem } from '../types';

export const timelineData: TimelineItem[] = [
  {
    id: '1',
    type: 'Connexion utilisateur',
    title: 'Connexion admin',
    time: '15h30',
    icon: 'user',
    color: 'bg-brand-blue',
  },
  {
    id: '2',
    type: 'Commande',
    title: 'Nouvelle commande reçue',
    time: '14h45',
    icon: 'shopping-cart',
    color: 'bg-brand-green',
  },
  {
    id: '3',
    type: 'Transformation',
    title: 'Transformation LOT-001 terminée',
    time: '12h30',
    icon: 'factory',
    color: 'bg-purple-500',
  },
  {
    id: '4',
    type: 'Abattage',
    title: 'Abattage poulailler 3',
    time: '10h15',
    icon: 'scissors',
    color: 'bg-orange-500',
  },
  {
    id: '5',
    type: 'Réception',
    title: 'Réception maïs',
    time: '08h30',
    icon: 'truck',
    color: 'bg-teal-500',
  },
];

