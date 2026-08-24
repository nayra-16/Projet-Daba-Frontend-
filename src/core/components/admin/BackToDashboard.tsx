import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BackToDashboardProps {
  /** Libellé personnalisé (défaut: "Retour au Dashboard") */
  label?: string;
  /** Variante visuelle */
  variant?: 'button' | 'link' | 'icon';
  /** Classes additionnelles */
  className?: string;
}

/**
 * Bouton "Retour au Dashboard" qui utilise React Router (navigate).
 * - S'adapte automatiquement au thème (light/dark)
 * - 3 variantes : "button" (par défaut), "link", "icon"
 * - Suit le Design System DABA (Vert #42B649, Bleu #244A9B)
 */
export const BackToDashboard: React.FC<BackToDashboardProps> = ({
  label = 'Retour au Dashboard',
  variant = 'button',
  className,
}) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleClick = () => {
    // Navigation React Router, PAS de window.location (pas de reload complet)
    navigate('/admin/dashboard');
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Retour au Dashboard"
        title="Retour au Dashboard"
        className={cn(
          'inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
          isDark
            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-blue',
          className,
        )}
      >
        <ArrowLeft size={20} />
      </button>
    );
  }

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200',
          isDark
            ? 'text-slate-300 hover:text-white'
            : 'text-gray-600 hover:text-brand-blue',
          className,
        )}
      >
        <ArrowLeft size={16} />
        <span>Dashboard</span>
      </button>
    );
  }

  // variant === 'button' (défaut)
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 border',
        isDark
          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-green hover:text-brand-blue shadow-sm',
        className,
      )}
    >
      <ArrowLeft size={16} className="flex-shrink-0" />
      <LayoutDashboard size={14} className="flex-shrink-0 opacity-70" />
      <span>{label}</span>
    </button>
  );
};

export default BackToDashboard;
