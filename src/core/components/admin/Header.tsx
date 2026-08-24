/**
 * Header — Barre supérieure DABA (refonte premium)
 *
 * Design :
 * - Fond blanc, slate-900 (mode sombre)
 * - Bordure bottom fine
 * - Recherche + icônes actions + menu utilisateur
 * - Bouton BackToDashboard préservé
 *
 * RÈGLE : tous les boutons existants (Messages décoratif désactivé, Toggle thème,
 * Profil, Paramètres, Déconnexion, Notifications) doivent fonctionner EXACTEMENT
 * comme avant.
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from './Breadcrumb';
import { BackToDashboard } from './BackToDashboard';
import { ADMIN_MENU_ITEMS } from '../../constants/admin';
import { NotificationCenter } from '../../../shared/notifications/components/NotificationCenter';
import { notificationService } from '../../../shared/notifications/services/notificationService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toggleSidebarCollapsed, sidebarCollapsed, setSidebarOpen } = useAdminContext();
  const { user, logout: clearAuthState } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    // clearAuthState (= useAuth.logout) appelle authService.logout (révocation
    // backend + vidage localStorage) puis setUser(null) (vidage AuthContext).
    // Tolère les erreurs réseau : la sécurité locale est garantie.
    await clearAuthState();
    navigate('/login');
  };

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

  // Titre de la page courante (résolu depuis le menu plat)
  const getCurrentPageTitle = (): string => {
    for (const item of ADMIN_MENU_ITEMS) {
      // Match exact (ex: /admin/dashboard)
      if (item.path === location.pathname) return getMenuKey(item.name);
      // Match préfixe (ex: /admin/elevage/*)
      if (location.pathname.startsWith(item.path + '/')) return getMenuKey(item.name);
    }
    return 'DABA ERP';
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    };
    fetchUnreadCount();
  }, [notificationsOpen]);

  // Classes thème-aware pour le header
  const headerClasses = cn(
    'sticky top-0 z-30 h-[55px] flex items-center px-4 border-b transition-colors duration-200',
    isDark
      ? 'bg-slate-900 border-slate-800 text-slate-100'
      : 'bg-white border-surface-border text-slate-900',
  );

  const iconButtonClasses = cn(
    'p-2 rounded-lg transition-all duration-200',
    isDark
      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      : 'text-slate-500 hover:bg-gray-100 hover:text-brand-blue',
  );

  return (
    <header className={headerClasses}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Bouton menu mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(iconButtonClasses, 'lg:hidden')}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>

        {/* Toggle sidebar desktop caché car la sidebar est toujours visible */}
        <div className="hidden lg:block w-2" />

        {/* Titre + Breadcrumb */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            {/* Bouton retour au Dashboard — visible sur toutes les pages SAUF /admin/dashboard */}
            {location.pathname !== '/admin/dashboard' && (
              <BackToDashboard variant="icon" />
            )}
            <h1 className={cn(
              'text-base md:text-lg font-bold tracking-tight truncate',
              isDark ? 'text-slate-100' : 'text-brand-text',
            )}>
              {getCurrentPageTitle()}
            </h1>
          </div>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Recherche */}
        <div
          className={cn(
            'hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors border',
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-gray-50 border-surface-border focus-within:border-brand-blue/40 focus-within:bg-white',
          )}
        >
          <Search size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            className={cn(
              'bg-transparent border-none outline-none text-[13px] w-[180px]',
              isDark
                ? 'text-slate-100 placeholder:text-slate-500'
                : 'text-gray-900 placeholder:text-slate-400',
            )}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={cn(iconButtonClasses, 'relative')}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] bg-brand-red text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Messages — bouton décoratif désactivé (pas de messagerie interne) */}
        <button
          className={cn(iconButtonClasses, 'hidden sm:flex', 'opacity-50 cursor-not-allowed')}
          aria-label="Messages (bientôt disponible)"
          disabled
          title="Messagerie interne (à venir)"
        >
          <MessageSquare size={19} />
        </button>

        {/* Toggle thème clair/sombre — FONCTIONNEL */}
        <button
          onClick={toggleTheme}
          className={iconButtonClasses}
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
        </button>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
              isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100',
            )}
            aria-label="Menu utilisateur"
          >
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {(() => {
                const fullName = user?.name || user?.firstName || 'A';
                const parts = fullName.trim().split(' ').filter(Boolean);
                if (parts.length >= 2) {
                  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
                }
                return fullName.substring(0, 2).toUpperCase();
              })()}
            </div>
            <span
              className={cn(
                'hidden md:block text-sm font-medium',
                isDark ? 'text-slate-100' : 'text-brand-text',
              )}
            >
              {user?.name || user?.firstName || t('common.administrator')}
            </span>
          </button>

          {userMenuOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-60 rounded-xl shadow-lg z-50 border overflow-hidden',
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-surface-border shadow-card-hover',
              )}
            >
              <div
                className={cn(
                  'p-4 border-b',
                  isDark ? 'border-slate-800' : 'border-surface-border',
                )}
              >
                <p className={cn('font-bold text-sm', isDark ? 'text-slate-100' : 'text-brand-text')}>
                  {user?.name || t('common.administrator')}
                </p>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {user?.email || 'admin@daba.local'}
                </p>
              </div>
              <div className="py-1.5">
                <Link
                  to="/admin/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                    isDark
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-gray-50',
                  )}
                >
                  <User size={16} />
                  <span>{t('common.myProfile')}</span>
                </Link>
                <div
                  className={cn('my-1.5 border-t', isDark ? 'border-slate-800' : 'border-surface-border')}
                />
                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                    isDark
                      ? 'text-brand-red hover:bg-slate-800'
                      : 'text-brand-red hover:bg-gray-50',
                  )}
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
