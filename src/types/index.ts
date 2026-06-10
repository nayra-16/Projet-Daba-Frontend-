export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  availability: boolean;
  unit: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

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

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  image?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}
