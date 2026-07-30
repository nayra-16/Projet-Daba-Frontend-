
import {
  LayoutDashboard,
  Factory,
  Home,
  Activity,
  Utensils,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  Barcode,
  Settings,
  TrendingUp,
  Scissors,
  ChefHat,
  Box,
  CheckCircle2,
  Truck,
  User,
  FileCheck2,
  CreditCard,
  ArrowDownToLine,
} from 'lucide-react';

export interface AdminSubMenuItem {
  name: string;
  path: string;
}

export interface AdminMenuItem {
  name: string;
  path?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  subItems?: AdminSubMenuItem[];
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Élevage',
    icon: Home,
    subItems: [
      { name: 'Dashboard Élevage', path: '/admin/elevage/dashboard' },
      { name: 'Lots', path: '/admin/elevage/lots' },
      { name: 'Poulaillers', path: '/admin/elevage/poulaillers' },
      { name: 'Santé', path: '/admin/elevage/sante' },
      { name: 'Alimentation', path: '/admin/elevage/alimentation' },
      { name: 'Historique', path: '/admin/elevage/historique' },
    ],
  },
  {
    name: 'Production',
    icon: Factory,
    subItems: [
      { name: 'Dashboard Production', path: '/admin/production/dashboard' },
      { name: 'Lots reçus', path: '/admin/production/lots-recus' },
      { name: 'Abattage', path: '/admin/production/abattage' },
      { name: 'Découpe', path: '/admin/production/decoupe' },
      { name: 'Transformation', path: '/admin/production/transformation' },
      { name: 'Conditionnement', path: '/admin/production/conditionnement' },
      { name: 'Contrôle qualité', path: '/admin/production/controle-qualite' },
      { name: 'Produits fabriqués', path: '/admin/production/produits-fabriques' },
      { name: 'Historique', path: '/admin/production/historique' },
    ],
  },
  {
    name: 'Stocks',
    icon: Package,
    subItems: [
      { name: 'Stock alimentaire', path: '/admin/stocks/alimentaire' },
      { name: 'Matières premières', path: '/admin/stocks/matieres-premieres' },
      { name: 'Produits finis', path: '/admin/stocks/produits-finis' },
    ],
  },
  {
    name: 'Commercial',
    icon: ShoppingCart,
    subItems: [
      { name: 'Clients', path: '/admin/commercial/clients' },
      { name: 'Commandes', path: '/admin/commercial/commandes' },
      { name: 'Factures', path: '/admin/commercial/factures' },
      { name: 'Paiements', path: '/admin/commercial/paiements' },
      { name: 'Livraisons', path: '/admin/commercial/livraisons' },
    ],
  },
  {
    name: 'Achats',
    icon: ArrowDownToLine,
    subItems: [
      { name: 'Fournisseurs', path: '/admin/achats/fournisseurs' },
      { name: 'Commandes d\'achat', path: '/admin/achats/commandes-achat' },
    ],
  },
  {
    name: 'Ressources Humaines',
    path: '/admin/rh',
    icon: Users,
  },
  {
    name: 'Finances',
    path: '/admin/finances',
    icon: DollarSign,
  },
  {
    name: 'Rapports',
    path: '/admin/rapports',
    icon: FileText,
  },
  {
    name: 'Traçabilité',
    path: '/admin/tracabilite',
    icon: Barcode,
  },
  {
    name: 'Administration',
    path: '/admin/administration',
    icon: Settings,
  },
];
