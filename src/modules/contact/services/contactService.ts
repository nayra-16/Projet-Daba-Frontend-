import api from '../../../core/services/api';
import { ContactForm } from '../../../shared/types/common';

export const contactService = {
  submitForm: async (data: ContactForm): Promise<void> => {
    await api.post('/contact', data);
  }
};
