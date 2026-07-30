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
