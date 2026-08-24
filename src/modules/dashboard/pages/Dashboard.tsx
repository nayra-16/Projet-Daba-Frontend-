/**
 * Dashboard — Vue d'ensemble ERP DABA (refonte premium)
 *
 * Structure :
 *  1. Header (titre + description + actions)
 *  2. KPI Cards (10) — cartes blanches avec accent DABA
 *  3. Graphiques (Élevage + Production) — barres fines
 *  4. Stock (Distribution + Niveaux)
 *  5. Production du jour (tableau)
 *  6. Alertes + Activités récentes
 *
 * RÈGLE STRICTE : aucune carte entièrement colorée.
 * La couleur DABA est utilisée UNIQUEMENT comme accent (icône, bord gauche, chiffre clé).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboardService';
import { DonutChart } from '../components/DonutChart';
import { ProductionFunnel } from '../components/ProductionFunnel';
import AlertCard from '../components/AlertCard';
import ActivityCard from '../components/ActivityCard';
import {
  DashboardStat,
  ProductionChartData,
  ProductDistributionData,
  StockItem,
  AlertItem,
  RecentActivity,
} from '../types';
import { RefreshCw, LayoutDashboard, ArrowRight, Database, ShieldCheck, Inbox, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [elevagePhasesData, setElevagePhasesData] = useState<ProductionChartData | null>(null);
  const [prodWorkflowData, setProdWorkflowData] = useState<ProductionChartData | null>(null);
  const [productDistribution, setProductDistribution] = useState<ProductDistributionData[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [
        statsData,
        elevagePhases,
        prodWorkflow,
        productDist,
        stocksData,
        alertsData,
        activitiesData,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getElevagePhasesChartData(),
        dashboardService.getProductionWorkflowChartData(),
        dashboardService.getProductDistributionData(),
        dashboardService.getStocksData(),
        dashboardService.getAlertsData(),
        dashboardService.getRecentActivities(),
      ]);

      setStats(statsData);
      setElevagePhasesData(elevagePhases);
      setProdWorkflowData(prodWorkflow);
      setProductDistribution(productDist);
      setStocks(stocksData);
      setAlerts(alertsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erreur de chargement du dashboard ERP:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const cardClasses = cn(
    'rounded-xl border flex flex-col h-full',
    isDark
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-surface-border shadow-card',
  );

  const cardHeaderClasses = cn(
    'flex items-center justify-between px-5 pt-5 pb-3 border-b',
    isDark ? 'border-slate-800' : 'border-surface-border'
  );

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className={cn('h-10 rounded-lg w-1/3', isDark ? 'bg-slate-800' : 'bg-gray-200')} />
            <div className={cn('h-24 rounded-xl', isDark ? 'bg-slate-800' : 'bg-gray-100')} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={cn('h-72 rounded-xl', isDark ? 'bg-slate-800' : 'bg-gray-100')} />
              <div className={cn('h-72 rounded-xl', isDark ? 'bg-slate-800' : 'bg-gray-100')} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Données par défaut si vide ---
  const defaultElevage = [{ label: 'Aucune donnée', value: 1, color: isDark ? '#334155' : '#e5e7eb' }];
  const elevageData = elevagePhasesData?.daily && elevagePhasesData.daily.length > 0 
    ? elevagePhasesData.daily 
    : defaultElevage;
  const elevageTotal = elevagePhasesData?.daily?.reduce((a, b) => a + Number(b.value), 0) || 0;

  const defaultWorkflow = [
    { label: 'Lots', value: 0 },
    { label: 'Abattage', value: 0 },
    { label: 'Découpe', value: 0 },
    { label: 'Transformation', value: 0 },
    { label: 'Conditionnement', value: 0 },
  ];
  const funnelData = prodWorkflowData?.daily && prodWorkflowData.daily.length > 0 
    ? prodWorkflowData.daily 
    : defaultWorkflow;

  const defaultStockDist = [{ label: 'Aucun stock', value: 1, color: isDark ? '#334155' : '#e5e7eb' }];
  const stockDistData = productDistribution && productDistribution.length > 0 
    ? productDistribution.map(item => ({ label: item.name, value: Number(item.value), color: item.color })) 
    : defaultStockDist;
  const stockTotal = productDistribution?.reduce((a, b) => a + Number(b.value), 0) || 0;

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* =================== HEADER =================== */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={cn('text-2xl md:text-3xl font-black tracking-tight', isDark ? 'text-white' : 'text-brand-text')}>
            {t('common.overview')}
          </h1>
          <p className={cn('text-sm mt-1 font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {t('common.overviewDesc')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm',
            isDark
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-200'
          )}
        >
          <RefreshCw size={18} className={cn(refreshing && 'animate-spin')} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>  </motion.div>

        {/* =================== KPI CARDS =================== */}
        <div className="mb-4 flex items-center gap-2">
        <LayoutDashboard className="text-brand-blue" size={18} />
        <h2 className={cn('text-sm font-bold uppercase tracking-widest', isDark ? 'text-slate-300' : 'text-slate-500')}>
          {t('dashboard.kpiTitle')}
        </h2>
      </div>
        <div className={cn(cardClasses, "mb-6")}>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-slate-800/20">
            {stats.slice(0, 4).map((stat) => (
              <div key={stat.id} className={cn("flex-1 p-4", isDark ? "border-slate-800" : "border-surface-border")}>
                <div className="flex flex-col">
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider mb-1", isDark ? "text-slate-400" : "text-slate-500")}>
                    {stat.title}
                  </span>
                  <span className={cn("text-2xl lg:text-3xl font-black tracking-tight", isDark ? "text-slate-100" : "text-slate-800")}>
                    {stat.value}
                  </span>
                  {stat.module && (
                    <span className={cn("text-[11px] mt-1", isDark ? "text-slate-500" : "text-slate-500")}>
                      {stat.module}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================== GRILLE 2 COLONNES (ÉLEVAGE / PRODUCTION) =================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* ÉLEVAGE */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>🐔</span> ÉLEVAGE — Répartition des lots
              </h3>
            </div>
            <div className="flex-1 flex flex-col justify-center p-4 min-h-[220px]">
              <div className="h-48 w-full flex items-center justify-center">
                <DonutChart 
                  data={elevageData} 
                  centerLabel={String(elevageTotal)}
                  centerSublabel="LOTS ACTIFS"
                />
              </div>
            </div>
          </div>

          {/* PRODUCTION */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>🏭</span> PRODUCTION — Workflow
              </h3>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center min-h-[220px]">
              <ProductionFunnel data={funnelData} />
            </div>
          </div>

        </div>

        {/* =================== GRILLE 2 COLONNES (STOCK / ALERTES) =================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* STOCK (Donut + Top Produits) */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>📦</span> STOCK
              </h3>
              <Link to="/admin/stock" className="text-xs text-brand-blue hover:underline">Voir tout →</Link>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row p-4 gap-6 min-h-[220px]">
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", isDark ? "text-slate-400" : "text-slate-500")}>Stock par catégorie</span>
                <div className="h-40 w-full flex items-center justify-center">
                  <DonutChart 
                    data={stockDistData}
                    centerLabel={String(stockTotal)}
                    centerSublabel="ARTICLES"
                  />
                </div>
              </div>
              <div className={cn("hidden sm:block w-px my-2", isDark ? "bg-slate-800" : "bg-gray-200")} />
              <div className="flex-1 flex flex-col justify-center">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", isDark ? "text-slate-400" : "text-slate-500")}>Top 7 produits</span>
                <div className="space-y-3">
                  {stocks.length > 0 ? stocks.slice(0, 7).map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={cn("text-xs font-medium truncate pr-2", isDark ? "text-slate-300" : "text-slate-700")}>{s.name}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded", isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-slate-700")}>{Number(s.level).toLocaleString('fr-FR')}</span>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-400 italic text-center py-4">Aucun produit</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ALERTES */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>⚠</span> ALERTES OPÉRATIONNELLES
              </h3>
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {alerts.length === 0 ? 'Tout est sous contrôle' : `${alerts.length} alerte(s)`}
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-[250px]">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-3">
                    <ShieldCheck size={24} />
                  </div>
                  <p className={cn("text-sm font-bold", isDark ? "text-slate-300" : "text-slate-700")}>Aucune alerte en cours.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* =================== NIVEAUX DE STOCK + ACTIVITÉS =================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* NIVEAUX DE STOCK RÉELS */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>📊</span> NIVEAUX DE STOCK RÉELS
              </h3>
            </div>
            <div className="flex-1 p-4">
              {stocks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">Aucune donnée de stock</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={cn("border-b text-[10px] uppercase tracking-wider", isDark ? "border-slate-800 text-slate-500" : "border-surface-border text-slate-400")}>
                        <th className="py-2 px-2 font-bold">Produit</th>
                        <th className="py-2 px-2 font-bold text-right">Stock</th>
                        <th className="py-2 px-2 font-bold text-center">État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.slice(0, 5).map((stock, idx) => (
                        <tr key={idx} className={cn("border-b last:border-0", isDark ? "border-slate-800/50" : "border-surface-border/50")}>
                          <td className={cn("py-2.5 px-2 text-xs font-medium truncate max-w-[150px]", isDark ? "text-slate-200" : "text-slate-700")}>
                            {stock.name}
                          </td>
                          <td className={cn("py-2.5 px-2 text-xs font-bold text-right", isDark ? "text-slate-100" : "text-slate-900")}>
                            {Number(stock.level).toLocaleString('fr-FR')}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                              stock.alert 
                                ? "bg-brand-red/10 text-brand-red" 
                                : "bg-brand-green/10 text-brand-green"
                            )}>
                              {stock.alert ? 'Critique' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVITÉS RÉCENTES */}
          <div className={cardClasses}>
            <div className={cardHeaderClasses}>
              <h3 className={cn('text-sm font-bold uppercase flex items-center gap-2', isDark ? 'text-slate-100' : 'text-slate-700')}>
                <span>📋</span> ACTIVITÉS RÉCENTES
              </h3>
              <Link to="/admin/parametres" className="text-xs text-brand-blue hover:underline">Voir toutes →</Link>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">Aucune activité récente</div>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
