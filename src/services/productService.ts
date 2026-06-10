import api from './api';
import { Product, Category } from '../types';
import pouletImg from '../assets/products/poulet-entier.jpeg';
import decoupeImg from '../assets/products/decoupe.jpeg';
import fraisImg from '../assets/products/frais-emballes.png';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    // For now, return mock data since we don't have a backend yet
    // return (await api.get('/products')).data;
    return MOCK_PRODUCTS;
  },
  getProductById: async (id: string): Promise<Product> => {
    // return (await api.get(`/products/${id}`)).data;
    return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  },
  getCategories: async (): Promise<Category[]> => {
    // return (await api.get('/categories')).data;
    return MOCK_CATEGORIES;
  }
};

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Poulets', slug: 'poulets' },
  { id: '2', name: 'Viandes', slug: 'viandes' },
  { id: '3', name: 'Produits transformés', slug: 'transformes' },
  { id: '4', name: 'Produits frais', slug: 'frais' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Poulet entier frais',
    description: 'Poulet entier prêt à cuire, élevé localement dans le respect des normes.',
    price: 3500,
    image: pouletImg,
    category: '1',
    availability: true,
    unit: 'kg'
  },
  {
    id: '2',
    name: 'Découpe de volaille',
    description: 'Cuisses, ailes et blancs de poulet soigneusement découpés.',
    price: 2500,
    image: decoupeImg,
    category: '1',
    availability: true,
    unit: 'kg'
  },
  {
    id: '3',
    name: 'Produits frais emballés',
    description: 'Assortiment de légumes et viandes fraîches emballés sous vide.',
    price: 4500,
    image: fraisImg,
    category: '4',
    availability: true,
    unit: 'paquet'
  }
];
