/**
 * DashboardCard — Carte KPI premium ERP DABA
 *
 * Design :
 * - Fond blanc en mode clair, slate-900 en mode sombre
 * - Icône colorée DABA dans un container subtil (pas de block massif)
 * - Accent latéral gauche (4px) coloré DABA selon contexte
 * - Compteur animé de 0 → valeur réelle (préservé)
 * - Hover subtil : élévation légère
 *
 * RÈGLE STRICTE : aucune carte entièrement colorée.
 * La couleur DABA est utilisée UNIQUEMENT comme accent (icône, bord gauche, chiffre clé).
 */

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Home,
  Factory,
  CheckCircle2,
  Clock,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Building2,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../../core/context/ThemeContext';
import { DashboardStat } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, React.ElementType> = {
  'package': Package,
  'home': Home,
  'building': Building2,
  'activity': Activity,
  'trending-up': Activity,
  'factory': Factory,
  'package-check': CheckCircle2,
  'clock': Clock,
  'shopping-cart': ShoppingCart,
  'alert-triangle': AlertTriangle,
  'wallet': DollarSign,
  'dollar-sign': DollarSign,
};

// Accent colors DABA — utilisés UNIQUEMENT pour (bord gauche + icône + chiffre)
// `tone` détermine la nuance DABA. `color` du stat peut forcer un override.
type Tone = 'green' | 'blue' | 'red' | 'amber' | 'slate';

const TONE_CLASSES: Record<Tone, {
  accent: string;
  iconBg: string;
  iconText: string;
  valueText: string;
  badgeBg: string;
  badgeText: string;
}> = {
  green: {
    accent: 'bg-brand-green',
    iconBg: 'bg-brand-green/10',
    iconText: 'text-brand-green',
    valueText: 'text-brand-green',
    badgeBg: 'bg-brand-green/10',
    badgeText: 'text-brand-green',
  },
  blue: {
    accent: 'bg-brand-blue',
    iconBg: 'bg-brand-blue/10',
    iconText: 'text-brand-blue',
    valueText: 'text-brand-blue',
    badgeBg: 'bg-brand-blue/10',
    badgeText: 'text-brand-blue',
  },
  red: {
    accent: 'bg-brand-red',
    iconBg: 'bg-brand-red/10',
    iconText: 'text-brand-red',
    valueText: 'text-brand-red',
    badgeBg: 'bg-brand-red/10',
    badgeText: 'text-brand-red',
  },
  amber: {
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-600',
    valueText: 'text-amber-600',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-600',
  },
  slate: {
    accent: 'bg-slate-400',
    iconBg: 'bg-slate-500/10',
    iconText: 'text-slate-600',
    valueText: 'text-slate-700',
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-600',
  },
};

/**
 * Convertit la valeur `color` du service (legacy bg-brand-X, bg-amber-500, etc.)
 * en `tone` pour le design premium.
 */
function resolveTone(color?: string): Tone {
  if (!color) return 'blue';
  const c = color.toLowerCase();
  if (c.includes('red') || c.includes('brandred')) return 'red';
  if (c.includes('green') || c.includes('emerald')) return 'green';
  if (c.includes('amber') || c.includes('yellow') || c.includes('orange')) return 'amber';
  if (c.includes('blue') || c.includes('indigo') || c.includes('violet') || c.includes('purple') || c.includes('teal')) return 'blue';
  return 'slate';
}

// ============================================================
// AnimatedValue : compteur 0 → valeur (préservé + sécurisé)
// ============================================================

interface AnimatedValueProps {
  value: string | number;
  isDark: boolean;
  className?: string;
}

const AnimatedValue: React.FC<AnimatedValueProps> = ({ value, isDark, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    const node = ref.current;
    if (!node || !isInView) return;

    // Sécurité : valeur null/undefined/NaN → 0
    const safeValue = (value === null || value === undefined || (typeof value === 'number' && isNaN(value)))
      ? 0
      : value;
    const strValue = String(safeValue);

    // Respect accessibilité
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      node.textContent = strValue;
      return;
    }

    // Extraction du nombre (gère "1 234", "1.5", "1,5", "0 FCFA", "12 kg", etc.)
    const numRegex = /-?[\d\s\.,]+/;
    const match = strValue.match(numRegex);
    if (!match) {
      node.textContent = strValue;
      return;
    }

    const rawNumberStr = match[0];
    const cleanNumberStr = rawNumberStr.replace(/\s/g, '').replace(',', '.');
    const targetNumber = parseFloat(cleanNumberStr);

    if (isNaN(targetNumber)) {
      node.textContent = strValue;
      return;
    }

    const hasDecimals = cleanNumberStr.includes('.');
    const decimals = hasDecimals ? cleanNumberStr.split('.')[1].length : 0;

    const prefix = strValue.substring(0, match.index);
    const suffix = strValue.substring(match.index! + rawNumberStr.length);

    const controls = animate(motionValue.get(), targetNumber, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (latest) => {
        const formatted = latest.toLocaleString('fr-FR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        node.textContent = `${prefix}${formatted}${suffix}`;
      },
      onComplete: () => {
        node.textContent = strValue;
      },
    });

    motionValue.set(targetNumber);
    return () => controls.stop();
  }, [value, motionValue, isInView]);

  return <span ref={ref} className={className}>{String(value ?? 0)}</span>;
};

// ============================================================
// DashboardCard
// ============================================================

interface DashboardCardProps {
  stat: DashboardStat;
  index: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ stat, index }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isClickable = Boolean(stat.route);
  const tone = resolveTone(stat.color);
  const T = TONE_CLASSES[tone];
  const Icon = ICON_MAP[stat.icon] || Package;

  const handleClick = () => {
    if (stat.route) navigate(stat.route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
      whileHover={isClickable ? { y: -2, transition: { duration: 0.2 } } : {}}
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-shadow duration-200',
        isDark
          ? 'bg-slate-900 border-slate-800 hover:shadow-card-hover'
          : 'bg-white border-surface-border shadow-card hover:shadow-card-hover',
        isClickable && 'cursor-pointer',
      )}
    >
      {/* Accent latéral gauche (4px) — DABA tone */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', T.accent)} aria-hidden="true" />

      <div className="p-5 pl-6">
        {/* En-tête : icône + label + flèche hover */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                T.iconBg,
                T.iconText,
              )}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-[11px] font-bold uppercase tracking-wider truncate',
                  isDark ? 'text-slate-400' : 'text-slate-500',
                )}
                title={stat.title}
              >
                {stat.title}
              </p>
              {stat.module && (
                <p
                  className={cn(
                    'text-[10px] font-medium truncate',
                    isDark ? 'text-slate-500' : 'text-slate-400',
                  )}
                >
                  {stat.module}
                </p>
              )}
            </div>
          </div>

          {isClickable && (
            <ArrowUpRight
              size={16}
              className={cn(
                'flex-shrink-0 transition-all duration-200',
                'opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0',
                isDark ? 'text-slate-400' : 'text-slate-400',
              )}
            />
          )}
        </div>

        {/* Valeur principale — chiffre coloré DABA */}
        <div className="flex items-end justify-between gap-3">
          <h3
            className={cn(
              'text-3xl font-black tracking-tight leading-none truncate',
              isDark ? T.valueText : T.valueText,
            )}
          >
            <AnimatedValue value={stat.value} isDark={isDark} />
          </h3>

          {/* Badge / Status / Trend */}
          {stat.badge ? (
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap',
                isDark ? 'bg-slate-800 text-slate-300' : T.badgeBg,
                isDark ? 'text-slate-300' : T.badgeText,
              )}
            >
              {stat.badge}
            </span>
          ) : stat.variation !== undefined && stat.variation !== null ? (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md',
                stat.trend === 'up'
                  ? (isDark ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-green/10 text-brand-green')
                  : (isDark ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-red/10 text-brand-red'),
              )}
            >
              {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(stat.variation)}%</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
