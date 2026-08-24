import { Product } from '../../products/types';

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  customerName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  city?: string;
  address: string;
  deliveryMethod?: 'home' | 'pickup' | string;
  paymentMethod?: 'delivery' | 'om' | 'momo' | 'wave' | 'card' | string;
  items?: CartItem[];
  total?: number;
  [key: string]: any;
}
