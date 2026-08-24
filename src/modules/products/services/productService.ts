import api from '../../../core/services/api';
import { Product, Category } from '../types';
import pouletEntierImg from '../assets/poulet-entier.webp';
import pouletFumeImg from '../assets/poulet-fume.jpeg';
import cuissePouletImg from '../assets/cuisse-poulet.jpeg';
import ailesPouletImg from '../assets/ailes-poulet.jpeg';
import blancPouletImg from '../assets/blanc-poulet.jpeg';
import merguezImg from '../assets/merguez.jpeg';
import chipolatasImg from '../assets/chipolatas.jpeg';
import pateFoieImg from '../assets/pate-foie.jpeg';
import saucissonImg from '../assets/saucisson.jpeg';
import saucisseFumeeImg from '../assets/saucisse-fumee.jpeg';
import saucisseGrillerNatureImg from '../assets/Saucisse à griller nature .jpeg';
import cuissesMarineesImg from '../assets/Cuisses-marinees.jpeg';
import hautCuissesImg from '../assets/Haut de cuisses.jpeg';
import pilonMarineImg from '../assets/pilon-mariné.jpeg';
import ailesMarineesImg from '../assets/Ailes-marinées.jpeg';
import brochettesBlancImg from '../assets/Brochettes de blanc.jpeg';
import brochettesGesiersImg from '../assets/Brochettes de gésiers.jpeg';
import pouletPaneImg from '../assets/Poulet-pané.jpeg';
import gesiersImg from '../assets/gésiers.jpeg';
import decoupeImg from '../assets/decoupe.webp';

const MOCK_CATEGORIES: Category[] = [
  { id: 'poulets', name: 'Poulets', slug: 'poulets' },
  { id: 'decoupes', name: 'Découpes', slug: 'decoupes' },
  { id: 'charcuteries', name: 'Charcuteries', slug: 'charcuteries' },
  { id: 'marines', name: 'Produits marinés', slug: 'produits-marines' },
  { id: 'transformes', name: 'Produits transformés', slug: 'produits-transformes' }
];

const MOCK_PRODUCTS: Product[] = [
  // Poulets
  { id: 'p1', name: 'Poulet Entier', description: 'Poulet frais, élevé en plein air. Poids moyen 1.2kg - 1.5kg.', price: 2500, image: pouletEntierImg, category: 'poulets', availability: true, unit: 'Kg' },
  { id: 'p5', name: 'Poulet Fumé Entier', description: 'Poulet entier fumé traditionnellement au bois de hêtre.', price: 3500, image: pouletFumeImg, category: 'poulets', availability: true, unit: 'Pièce' },
  
  // Découpes
  { id: 'p2', name: 'Cuisse de Poulet', description: 'Cuisses de poulet charnues et tendres. Idéales pour le four ou le barbecue.', price: 2800, image: cuissePouletImg, category: 'decoupes', availability: true, unit: 'Kg' },
  { id: 'p3', name: 'Ailes de Poulet', description: 'Ailes de poulet fraîches. Parfaites pour vos apéritifs et grillades.', price: 2200, image: ailesPouletImg, category: 'decoupes', availability: true, unit: 'Kg' },
  { id: 'p4', name: 'Blanc de Poulet', description: 'Filets de poulet sans os ni peau, très tendres.', price: 3500, image: blancPouletImg, category: 'decoupes', availability: true, unit: 'Kg' },
  { id: 'p20', name: 'Gésiers de Volaille', description: 'Gésiers frais nettoyés.', price: 1800, image: gesiersImg, category: 'decoupes', availability: true, unit: 'Kg' },
  
  // Charcuteries
  { id: 'p7', name: 'Merguez de Volaille', description: 'Merguez 100% volaille, épicées juste ce qu\'il faut.', price: 3000, image: merguezImg, category: 'charcuteries', availability: true, unit: 'Kg' },
  { id: 'p8', name: 'Chipolatas', description: 'Saucisses fines de volaille aux herbes.', price: 3000, image: chipolatasImg, category: 'charcuteries', availability: true, unit: 'Kg' },
  { id: 'p9', name: 'Saucisse à Griller Nature', description: 'Saucisses de volaille nature pour barbecue.', price: 2800, image: saucisseGrillerNatureImg, category: 'charcuteries', availability: true, unit: 'Kg' },
  { id: 'p10', name: 'Saucisse Fumée', description: 'Saucisses de volaille légèrement fumées.', price: 3200, image: saucisseFumeeImg, category: 'charcuteries', availability: true, unit: 'Kg' },
  { id: 'p11', name: 'Saucisson de Volaille', description: 'Saucisson sec 100% volaille, idéal pour l\'apéritif.', price: 2500, image: saucissonImg, category: 'charcuteries', availability: true, unit: 'Pièce' },
  { id: 'p12', name: 'Pâté de Foie', description: 'Pâté onctueux au foie de volaille.', price: 1500, image: pateFoieImg, category: 'charcuteries', availability: true, unit: 'Boîte' },
  
  // Produits marinés
  { id: 'p13', name: 'Cuisses Marinées', description: 'Cuisses de poulet marinées aux épices douces.', price: 3200, image: cuissesMarineesImg, category: 'marines', availability: true, unit: 'Kg' },
  { id: 'p14', name: 'Ailes Marinées', description: 'Ailes de poulet marinées façon BBQ.', price: 2800, image: ailesMarineesImg, category: 'marines', availability: true, unit: 'Kg' },
  { id: 'p15', name: 'Pilons Marinés', description: 'Pilons de poulet tendres avec une marinade spéciale.', price: 3000, image: pilonMarineImg, category: 'marines', availability: true, unit: 'Kg' },
  { id: 'p16', name: 'Brochettes de Blanc', description: 'Brochettes de filet de poulet prêtes à griller.', price: 3800, image: brochettesBlancImg, category: 'marines', availability: true, unit: 'Kg' },
  { id: 'p17', name: 'Brochettes de Gésiers', description: 'Brochettes savoureuses de gésiers de volaille.', price: 2500, image: brochettesGesiersImg, category: 'marines', availability: true, unit: 'Kg' },
  { id: 'p18', name: 'Haut de Cuisses', description: 'Hauts de cuisses charnus avec leur marinade maison.', price: 3000, image: hautCuissesImg, category: 'marines', availability: true, unit: 'Kg' },
  
  // Produits transformés
  { id: 'p19', name: 'Poulet Pané', description: 'Morceaux de poulet tendres avec une panure croustillante.', price: 4000, image: pouletPaneImg, category: 'transformes', availability: true, unit: 'Kg' }
];

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      const data = response.data;
      
      let backendProducts: Product[] = [];
      if (data?.data && Array.isArray(data.data)) {
        backendProducts = data.data.map(mapBackendToFrontendProduct);
      } else if (Array.isArray(data)) {
        backendProducts = data.map(mapBackendToFrontendProduct);
      }
      
      if (backendProducts.length > 0) {
        return backendProducts;
      }
      
      // Fallback si l'API est vide
      return MOCK_PRODUCTS;
    } catch (error) {
      console.error('Error fetching products, falling back to mocks:', error);
      return MOCK_PRODUCTS;
    }
  },
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get(`/products/${id}`);
      const data = response.data?.data || response.data;
      return mapBackendToFrontendProduct(data);
    } catch (error) {
      console.error(`Error fetching product ${id}, falling back to mock:`, error);
      const mockProd = MOCK_PRODUCTS.find(p => p.id === id);
      if (mockProd) return mockProd;
      throw error;
    }
  },
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories');
      const data = response.data;
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
         return data.data; // simplifions
      }
      return MOCK_CATEGORIES;
    } catch (error) {
      return MOCK_CATEGORIES;
    }
  }
};

function mapBackendToFrontendProduct(raw: any): Product {
  return {
    id: String(raw.id),
    name: raw.name || 'Produit inconnu',
    description: raw.description || '',
    price: Number(raw.price || 0),
    image: '', // No image support in backend yet
    category: '1',
    availability: Number(raw.stock || 0) > 0,
    unit: 'Unité'
  };
}
