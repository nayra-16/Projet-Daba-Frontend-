import api from './api';
import { ContactForm } from '../types';

export const contactService = {
  submitForm: async (data: ContactForm): Promise<void> => {
    await api.post('/contact', data);
  }
};
