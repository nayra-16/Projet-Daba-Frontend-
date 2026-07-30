
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ADMIN_MENU_ITEMS, AdminMenuItem, AdminSubMenuItem } from '../../constants/admin';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Helper function to find menu item by path
  const findMenuItemByPath = (path: string): { name: string; isSubItem: boolean } | null => {
    for (const item of ADMIN_MENU_ITEMS) {
      if (item.path === path) {
        return { name: item.name, isSubItem: false };
      }
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === path) {
            return { name: subItem.name, isSubItem: true };
          }
        }
      }
    }
    return null;
  };

  // Build breadcrumb items
  const breadcrumbItems: Array<{ name: string; path: string }> = [
    { name: 'Accueil', path: '/admin/dashboard' },
  ];

  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    // Check if this path is a known menu item
    const menuItem = findMenuItemByPath(currentPath);
    if (menuItem) {
      breadcrumbItems.push({ name: menuItem.name, path: currentPath });
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index < breadcrumbItems.length - 1 ? (
            <Link
              to={item.path}
              className="hover:text-brand-green transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-brand-text font-medium">{item.name}</span>
          )}
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight size={16} className="text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
