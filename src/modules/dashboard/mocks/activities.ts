
import { RecentActivity } from '../types';

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'Connexion',
    description: 'a effectué une connexion',
    time: 'Il y a 5 min',
    user: 'Admin',
    icon: 'user',
  },
  {
    id: '2',
    type: 'Création de commande',
    description: 'a créé une commande',
    time: 'Il y a 30 min',
    user: 'Marie',
    icon: 'shopping-cart',
  },
  {
    id: '3',
    type: 'Ajout d\'un lot',
    description: 'a ajouté un nouveau lot',
    time: 'Il y a 1h',
    user: 'Jean',
    icon: 'package',
  },
  {
    id: '4',
    type: 'Transformation',
    description: 'a validé une transformation',
    time: 'Il y a 2h',
    user: 'Koffi',
    icon: 'check-circle',
  },
  {
    id: '5',
    type: 'Modification',
    description: 'a modifié un produit',
    time: 'Il y a 3h',
    user: 'Aya',
    icon: 'edit',
  },
];

