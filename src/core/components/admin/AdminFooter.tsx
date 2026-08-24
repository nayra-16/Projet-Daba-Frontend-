import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminFooter: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer
      className={cn(
        'border-t py-4 px-6 text-center text-sm transition-colors duration-200',
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-500'
          : 'bg-white border-gray-200 text-gray-500',
      )}
    >
      <p>© DABA ERP {new Date().getFullYear()} - Version 1.0</p>
    </footer>
  );
};
