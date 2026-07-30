export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
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
