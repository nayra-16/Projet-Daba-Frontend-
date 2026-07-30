
import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';

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

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-brand-green/10 text-brand-green font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-text'
        )
      }
    >
      <Icon size={20} />
      {!sidebarCollapsed && <span>{name}</span>}
    </NavLink>
  );
};
