import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ADMIN_MENU_ITEMS } from '../../constants/admin';
import { useTheme } from '../../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Helper : retrouve le nom d'un module à partir de son préfixe
  const findMenuItemByPrefix = (pathPrefix: string): string | null => {
    for (const item of ADMIN_MENU_ITEMS) {
      if (item.path === pathPrefix) return item.name;
    }
    return null;
  };

  // Construit la chaîne de segments à partir du menu plat
  const breadcrumbItems: Array<{ name: string; path: string }> = [
    { name: 'Dashboard', path: '/admin/dashboard' },
  ];

  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    const moduleName = findMenuItemByPrefix(currentPath);
    if (moduleName) {
      breadcrumbItems.push({ name: moduleName, path: currentPath });
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs',
        isDark ? 'text-slate-500' : 'text-slate-400',
      )}
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={`crumb-${index}-${item.path}`}>
          {index < breadcrumbItems.length - 1 ? (
            <Link
              to={item.path}
              className={cn(
                'transition-colors',
                isDark
                  ? 'hover:text-slate-200'
                  : 'hover:text-slate-600',
              )}
            >
              {item.name}
            </Link>
          ) : (
            <span
              className={cn(
                'font-medium',
                isDark ? 'text-slate-300' : 'text-slate-500',
              )}
            >
              {item.name}
            </span>
          )}
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight
              size={12}
              className={isDark ? 'text-slate-700' : 'text-slate-300'}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
