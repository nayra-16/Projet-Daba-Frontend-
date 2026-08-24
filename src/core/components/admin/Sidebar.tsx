/**
 * Sidebar — Navigation principale DABA (refonte premium)
 *
 * Design :
 * - Fond blanc / gris très clair (mode clair), slate-950 (mode sombre)
 * - Bordure latérale fine
 * - Logo + nom DABA ERP
 * - Items plats, espacement généreux
 * - Item actif : accent DABA discret (pas de block massif)
 * - Footer : version ERP
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ADMIN_MENU_ITEMS } from '../../constants/admin';
import { SidebarItem } from './SidebarItem';
import logoImg from '../../../assets/logos/logo.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useAdminContext();
  const { hasRole } = useAuth();
  const { isDark } = useTheme();

  const getMenuKey = (name: string) => {
    switch (name) {
      case 'Tableau de bord': return t('menu.dashboard');
      case 'Ferme': return t('menu.farm');
      case 'Élevage': return t('menu.elevage');
      case 'Production': return t('menu.production');
      case 'Stock': return t('menu.stock');
      case 'Produits': return t('menu.products');
      case 'Utilisateurs': return t('menu.users');
      case 'Paramètres': return t('menu.settings');
      default: return name;
    }
  };

  // On ignore le collapsed pour avoir toujours 240px ou 16. On mettra 240px en dur.
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-[240px]';

  // Filtrage RBAC : on n'affiche que les modules auxquels l'utilisateur a accès.
  const filteredMenuItems = ADMIN_MENU_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasRole(item.roles as UserRole[]);
  });

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out',
          // Fond sidebar : BLANC / gris très clair (mode clair), slate-950 (mode sombre)
          isDark
            ? 'bg-slate-950 border-r border-slate-800'
            : 'bg-white border-r border-surface-border shadow-sidebar',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-[240px]',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b flex-shrink-0',
            isDark ? 'border-slate-800' : 'border-surface-border',
            sidebarCollapsed ? 'justify-center' : 'justify-start px-5',
          )}
        >
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
            aria-label="DABA ERP - Accueil"
          >
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src={logoImg} alt="DABA Logo" className="w-full h-full object-contain" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className={cn(
                  'text-base font-black tracking-wide whitespace-nowrap',
                  isDark ? 'text-slate-100' : 'text-brand-text',
                )}>
                  DABA
                </span>
                <span className={cn(
                  'text-[9px] font-bold tracking-widest uppercase',
                  isDark ? 'text-slate-500' : 'text-slate-400',
                )}>
                  LE GOUT DU TERROIR
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation principale — modules DABA */}
        <nav
          className={cn(
            'flex-1 overflow-y-auto pb-4',
            sidebarCollapsed ? 'px-2 pt-3' : 'px-3',
          )}
          aria-label="Navigation principale"
        >
          {['MODULES', 'SYSTÈME'].map((groupName) => {
            const items = filteredMenuItems.filter(i => (i.group || 'MODULES') === groupName);
            if (items.length === 0) return null;

            return (
              <div key={groupName} className="mb-2">
                {!sidebarCollapsed && (
                  <div className="px-2 pt-4 pb-2">
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-widest',
                      isDark ? 'text-slate-500' : 'text-slate-400',
                    )}>
                      {groupName === 'MODULES' ? t('menu.modules', 'MODULES') : t('menu.system', 'SYSTÈME')}
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <React.Fragment key={item.path}>
                      <SidebarItem
                        name={getMenuKey(item.name)}
                        path={item.path}
                        icon={item.icon}
                        onClick={() => setSidebarOpen(false)}
                      />
                      {item.separatorAfter && (
                        <div className={cn('my-3 border-t mx-2', isDark ? 'border-slate-800' : 'border-surface-border')} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer sidebar : version */}
        {!sidebarCollapsed && (
          <div
            className={cn(
              'flex-shrink-0 px-5 py-3 border-t text-[10px] uppercase tracking-widest font-bold flex items-center justify-between',
              isDark ? 'border-slate-800 text-slate-500' : 'border-surface-border text-slate-400',
            )}
          >
            <span>ERP v1.0</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        )}
      </aside>
    </>
  );
};
