import {
  LayoutDashboard,
  Warehouse,
  Bird,
  Factory,
  Package,
  Truck,
  Users,
  Settings,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface AdminMenuItem {
  name: string;
  path: string;
  icon: any;
  roles?: string[];
  description?: string;
  group?: 'MODULES' | 'SYSTÈME';
  separatorAfter?: boolean;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    name: 'Tableau de bord',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble KPIs et alertes',
    group: 'MODULES',
    separatorAfter: true,
  },
  {
    name: 'Ferme',
    path: '/admin/farms',
    icon: Warehouse,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR'],
    description: 'Gestion des fermes et bâtiments',
    group: 'MODULES',
  },
  {
    name: 'Élevage',
    path: '/admin/elevage',
    icon: Bird,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_ELEVAGE'],
    description: 'Lots, poulaillers, santé, alimentation',
    group: 'MODULES',
  },
  {
    name: 'Production',
    path: '/admin/production',
    icon: Factory,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_PRODUCTION', 'RESPONSABLE_ELEVAGE'],
    description: 'Abattage, découpe, transformation',
    group: 'MODULES',
  },
  {
    name: 'Stock',
    path: '/admin/stock',
    icon: Package,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_STOCK'],
    description: 'Produits finis, matières premières',
    group: 'MODULES',
  },
  {
    name: 'Produits',
    path: '/admin/produits',
    icon: Package, // or a different icon, let's keep package or use ShoppingBag if available. Package is fine.
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_STOCK'],
    description: 'Catalogue de produits',
    group: 'MODULES',
  },
  {
    name: 'Utilisateurs',
    path: '/admin/administration',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR'],
    description: 'Comptes, rôles et permissions',
    group: 'MODULES',
  },
  {
    name: 'Paramètres',
    path: '/admin/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR'],
    description: 'Configuration du système',
    group: 'SYSTÈME',
  },
];
