
import { StockItem } from '../types';

export const stocksData: StockItem[] = [
  {
    id: '1',
    name: 'Stock alimentaire',
    level: 1500,
    percentage: 75,
    color: 'bg-brand-green',
    alert: false,
  },
  {
    id: '2',
    name: 'Matières premières',
    level: 850,
    percentage: 34,
    color: 'bg-yellow-500',
    alert: true,
  },
  {
    id: '3',
    name: 'Produits finis',
    level: 342,
    percentage: 68,
    color: 'bg-brand-blue',
    alert: false,
  },
];

