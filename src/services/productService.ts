import api from './api';
import { Product, Category } from '../types';
import pouletEntierImg from '../assets/products/poulet-entier.jpeg';
import pouletFumeImg from '../assets/products/poulet-fume.jpeg';
import cuissePouletImg from '../assets/products/cuisse-poulet.jpeg';
import ailesPouletImg from '../assets/products/ailes-poulet.jpeg';
import blancPouletImg from '../assets/products/blanc-poulet.jpeg';
import merguezImg from '../assets/products/merguez.jpeg';
import chipolatasImg from '../assets/products/chipolatas.jpeg';
import pateFoieImg from '../assets/products/pate-foie.jpeg';
import saucissonImg from '../assets/products/saucisson.jpeg';
import saucisseFumeeImg from '../assets/products/saucisse-fumee.jpeg';
import saucisseGrillerNatureImg from '../assets/products/Saucisse à griller nature .jpeg';
import cuissesMarineesImg from '../assets/products/Cuisses-marinees.jpeg';
import hautCuissesImg from '../assets/products/Haut de cuisses.jpeg';
import pilonMarineImg from '../assets/products/pilon-mariné.jpeg';
import ailesMarineesImg from '../assets/products/Ailes-marinées.jpeg';
import brochettesBlancImg from '../assets/products/Brochettes de blanc.jpeg';
import brochettesGesiersImg from '../assets/products/Brochettes de gésiers.jpeg';
import pouletPaneImg from '../assets/products/Poulet-pané.jpeg';
import gesiersImg from '../assets/products/gésiers.jpeg';
import decoupeImg from '../assets/products/decoupe.jpeg';

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
  { id: '2', name: 'Découpes', slug: 'decoupes' },
  { id: '3', name: 'Charcuteries', slug: 'charcuteries' },
  { id: '4', name: 'Produits marinés', slug: 'produits-marines' },
  { id: '5', name: 'Produits transformés', slug: 'produits-transformes' },
];

const MOCK_PRODUCTS: Product[] = [
  // Poulets
  {
    id: '1',
    name: 'Poulet entier',
    description: 'Poulet entier frais de qualité supérieure.',
    price: 2600,
    image: pouletEntierImg,
    category: '1',
    availability: true,
    unit: 'Sachet'
  },
  {
    id: '2',
    name: 'Poulet fumé',
    description: 'Poulet entier fumé selon un procédé traditionnel.',
    price: 3400,
    image: pouletFumeImg,
    category: '1',
    availability: true,
    unit: 'Sachet'
  },
  // Découpes
  {
    id: '3',
    name: 'Cuisse de poulet',
    description: '3 à 4 cuisses par sachet.',
    price: 2200,
    image: cuissePouletImg,
    category: '2',
    availability: true,
    unit: 'Sachet'
  },
  {
    id: '4',
    name: 'Ailes de poulet',
    description: '10 à 15 ailes par sachet.',
    price: 2000,
    image: ailesPouletImg,
    category: '2',
    availability: true,
    unit: 'Sachet'
  },
  {
    id: '5',
    name: 'Blanc de poulet',
    description: 'Tranches de poitrine de poulet sans os.',
    price: 6000,
    image: blancPouletImg,
    category: '2',
    availability: true,
    unit: 'Sachet'
  },
  // Charcuteries
  {
    id: '6',
    name: 'Saucisse',
    description: '10 unités par paquet.',
    price: 1000,
    image: saucisseFumeeImg,
    category: '3',
    availability: true,
    unit: 'Sachet'
  },
  {
    id: '7',
    name: 'Saucisse fumée',
    description: '10 unités par paquet.',
    price: 1000,
    image: saucisseFumeeImg,
    category: '3',
    availability: true,
    unit: 'Sachet'
  },
  {
    id: '8',
    name: 'Pâté de foie',
    description: 'Boîte de 200 g.',
    price: 1000,
    image: pateFoieImg,
    category: '3',
    availability: true,
    unit: 'Boîte'
  },
  {
    id: '9',
    name: 'Merguez',
    description: '500 grammes.',
    price: 6000,
    image: merguezImg,
    category: '3',
    availability: true,
    unit: 'kg'
  },
  {
    id: '10',
    name: 'Chipolatas',
    description: '500 grammes.',
    price: 6000,
    image: chipolatasImg,
    category: '3',
    availability: true,
    unit: 'kg'
  },
  {
    id: '11',
    name: 'Saucisses cuites',
    description: '410 g.',
    price: 1000,
    image: saucisseFumeeImg,
    category: '3',
    availability: true,
    unit: 'Paquet'
  },
  {
    id: '12',
    name: 'Saucissons',
    description: 'Saucisson sec de qualité.',
    price: 2000,
    image: saucissonImg,
    category: '3',
    availability: true,
    unit: 'Pièce'
  },
  {
    id: '13',
    name: 'Saucisse à griller nature',
    description: 'Paquet de saucisses à griller nature.',
    price: 2000,
    image: saucisseGrillerNatureImg,
    category: '3',
    availability: true,
    unit: 'Paquet'
  },
  {
    id: '14',
    name: 'Saucisse à griller aux fines herbes',
    description: 'Paquet de saucisses à griller aux fines herbes.',
    price: 2000,
    image: saucisseGrillerNatureImg,
    category: '3',
    availability: true,
    unit: 'Paquet'
  },
  {
    id: '15',
    name: 'Saucisse à griller au curry',
    description: 'Paquet de saucisses à griller au curry.',
    price: 2000,
    image: saucisseGrillerNatureImg,
    category: '3',
    availability: true,
    unit: 'Paquet'
  },
  // Produits marinés
  {
    id: '16',
    name: 'Cuisses marinées',
    description: 'Cuisses de poulet marinées prêtes à cuisiner.',
    price: 5500,
    image: cuissesMarineesImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  {
    id: '17',
    name: 'Haut de cuisses',
    description: 'Hauts de cuisses de poulet marinés.',
    price: 5500,
    image: hautCuissesImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  {
    id: '18',
    name: 'Pilon mariné',
    description: 'Pilons de poulet marinés.',
    price: 5500,
    image: pilonMarineImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  {
    id: '19',
    name: 'Ailes marinées',
    description: 'Ailes de poulet marinées.',
    price: 4500,
    image: ailesMarineesImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  {
    id: '20',
    name: 'Brochettes de blanc',
    description: 'Brochettes de blanc de poulet mariné.',
    price: 7500,
    image: brochettesBlancImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  {
    id: '21',
    name: 'Brochettes de gésiers',
    description: 'Brochettes de gésiers de poulet marinés.',
    price: 5000,
    image: brochettesGesiersImg,
    category: '4',
    availability: true,
    unit: 'kg'
  },
  // Produits transformés
  {
    id: '22',
    name: 'Poulet pané',
    description: 'Poulet pané prêt à cuisiner.',
    price: 2000,
    image: pouletPaneImg,
    category: '5',
    availability: true,
    unit: 'Paquet'
  }
];
