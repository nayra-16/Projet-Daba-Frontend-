import api from './api';
import { Order } from '../types';

export const orderService = {
  createOrder: async (order: Order): Promise<Order> => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};
