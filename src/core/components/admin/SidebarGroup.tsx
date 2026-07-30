
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { AdminMenuItem } from '../../constants/admin';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarGroupProps {
  item: AdminMenuItem;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ item }) => {
  const { sidebarCollapsed } = useAdminContext();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  // Check if any sub-item is active
  const hasActiveSubItem = item.subItems?.some(
    (subItem) => window.location.pathname === subItem.path
  );

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          hasActiveSubItem
            ? 'bg-brand-green/10 text-brand-green font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-text'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          {!sidebarCollapsed && <span>{item.name}</span>}
        </div>
        {!sidebarCollapsed && item.subItems && item.subItems.length > 0 && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </motion.div>
        )}
      </button>
      {!sidebarCollapsed && item.subItems && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-4 pr-2 py-2 space-y-1">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                        isActive
                          ? 'bg-brand-green/10 text-brand-green font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-brand-text'
                      )
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span>{subItem.name}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
