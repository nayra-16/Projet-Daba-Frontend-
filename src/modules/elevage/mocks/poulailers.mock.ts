
import { Poulailer, PoulailerStatus } from '../types';

export const MOCK_POULAILERS: Poulailer[] = [
  {
    id: '1',
    name: 'Poulailler 1',
    capacity: 1500,
    currentCount: 1000,
    responsible: 'Koffi Mensah',
    status: PoulailerStatus.ACTIF,
    location: 'Agoè, Togo',
    createdAt: '2023-01-15',
    description: 'Poulailler de production principale'
  },
  {
    id: '2',
    name: 'Poulailler 2',
    capacity: 1000,
    currentCount: 800,
    responsible: 'Ama Asamoah',
    status: PoulailerStatus.ACTIF,
    location: 'Agoè, Togo',
    createdAt: '2023-03-20',
    description: null
  },
  {
    id: '3',
    name: 'Poulailler 3',
    capacity: 1500,
    currentCount: 1200,
    responsible: 'Kofi Mensah',
    status: PoulailerStatus.ACTIF,
    location: 'Agoè, Togo',
    createdAt: '2023-06-10',
    description: 'Poulailler de finition'
  },
  {
    id: '4',
    name: 'Poulailler 4',
    capacity: 800,
    currentCount: 0,
    responsible: 'Yao Amegbe',
    status: PoulailerStatus.EN_MAINTENANCE,
    location: 'Agoè, Togo',
    createdAt: '2023-09-05',
    description: 'Nettoyage et maintenance en cours'
  }
];
