export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  email: string;
  paymentMethod: 'delivery' | 'flooz' | 'tmoney' | 'card';
  deliveryMethod: 'pickup' | 'home';
  items: OrderItem[];
  total: number;
  status?: 'pending' | 'confirmed' | 'delivered';
  createdAt?: string;
}
