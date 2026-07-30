
import { FeedRecord } from '../types';

export const MOCK_FEED_RECORDS: FeedRecord[] = [
  {
    id: '1',
    date: '2024-07-15',
    lotId: '1',
    feedType: 'Aliment croissance',
    quantity: 50,
    responsible: 'Koffi Mensah',
    cost: 25000,
    createdAt: '2024-07-15'
  },
  {
    id: '2',
    date: '2024-07-14',
    lotId: '1',
    feedType: 'Aliment croissance',
    quantity: 48,
    responsible: 'Koffi Mensah',
    cost: 24000,
    createdAt: '2024-07-14'
  },
  {
    id: '3',
    date: '2024-07-15',
    lotId: '2',
    feedType: 'Aliment démarrage',
    quantity: 35,
    responsible: 'Ama Asamoah',
    cost: 19250,
    createdAt: '2024-07-15'
  },
  {
    id: '4',
    date: '2024-07-15',
    lotId: '3',
    feedType: 'Aliment finition',
    quantity: 60,
    responsible: 'Kofi Mensah',
    cost: 33000,
    createdAt: '2024-07-15'
  }
];
