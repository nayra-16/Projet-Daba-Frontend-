/**
 * AdminLayout — Layout principal de l'espace ERP DABA (refonte premium)
 *
 * Structure :
 *  - Sidebar (gauche, fixe, fond blanc/grisé clair)
 *  - Zone principale :
 *      - Header (haut)
 *      - Main (flex-1, fond gris très clair)
 *      - AdminFooter
 *
 * Mode clair : fond #F5F7FA (gris très clair) — vraiment clair
 * Mode sombre : fond slate-950
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AdminProvider, useAdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from '../components/admin/Sidebar';
import { Header } from '../components/admin/Header';
import { AdminFooter } from '../components/admin/AdminFooter';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminContent: React.FC = () => {
  const { sidebarCollapsed } = useAdminContext();
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        'min-h-screen flex font-sans transition-colors duration-200',
        isDark
          ? 'bg-slate-950 text-slate-200'
          : 'bg-surface-page text-slate-900',
      )}
    >
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-[240px]"
        )}
      >
        <Header />
        <main
          className={cn(
            'flex-1 transition-colors duration-200',
            isDark ? 'bg-slate-950' : 'bg-surface-page',
          )}
        >
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};
