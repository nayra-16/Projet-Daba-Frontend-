
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { ADMIN_MENU_ITEMS } from '../../constants/admin';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useAdminContext();

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -260,
          width: sidebarCollapsed ? 64 : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col',
          'lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              D
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-brand-text">DABA ERP</span>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {ADMIN_MENU_ITEMS.map((item) =>
            item.path ? (
              <SidebarItem
                key={item.path}
                name={item.name}
                path={item.path}
                icon={item.icon}
                onClick={() => setSidebarOpen(false)}
              />
            ) : (
              <SidebarGroup key={item.name} item={item} />
            )
          )}
        </div>
      </motion.aside>
    </>
  );
};
