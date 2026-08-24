/**
 * SidebarItem — Item de navigation latérale DABA (refonte premium)
 *
 * Design :
 * - Item actif : bg-brand-blue/10 + texte brand-blue + accent latéral brand-blue (4px) + icône brand-blue
 *   (On garde la couleur DABA comme accent, sans remplir l'interface)
 * - Item normal : texte gris neutre, hover gris très clair
 * - Item collapsed : icône centrée
 * - Transition douce 200ms
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ name, path, icon: Icon, onClick }) => {
  const { sidebarCollapsed } = useAdminContext();
  const { isDark } = useTheme();

  return (
    <NavLink
      to={path}
      onClick={onClick}
      end={false}
      title={sidebarCollapsed ? name : undefined}
      aria-label={name}
      className={({ isActive }) =>
        cn(
          // Base
          'group relative flex items-center gap-3 rounded-lg transition-all duration-200 ease-out',
          'text-[13px] font-medium select-none',
          // Espacement : plus large quand déplié, plus serré quand replié
          sidebarCollapsed
            ? 'justify-center h-10 w-10 mx-auto'
            : 'px-3 py-2',
          // États
          isActive
            ? (isDark
              ? 'bg-brand-blue/15 text-brand-blue font-bold'
              : 'bg-[#E8F0FB] text-brand-blue font-bold')
            : (isDark
              ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              : 'text-slate-600 hover:bg-gray-50 hover:text-brand-text'),
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Accent latéral (barre colorée DABA) pour l'élément actif */}
          {isActive && !sidebarCollapsed && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-brand-blue rounded-r-full"
            />
          )}

          <Icon
            size={18}
            className={cn(
              'flex-shrink-0 transition-transform duration-200',
              isActive
                ? 'scale-105'
                : 'group-hover:scale-105',
            )}
          />

          {!sidebarCollapsed && (
            <span className="truncate whitespace-nowrap">{name}</span>
          )}
        </>
      )}
    </NavLink>
  );
};
