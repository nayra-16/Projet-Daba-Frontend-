import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, AlertTriangle, TrendingUp, TrendingDown,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Download,
  Warehouse, ShieldAlert, Scale
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { StockDashboardStats, StockAlertLevel } from '../types';
import { KpiCard } from '../../elevage/components/KpiCard';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

export const StockDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StockDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const data = await stockService.getDashboard();
      setStats(data);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Erreur lors du chargement du dashboard');
      setError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => load(true), 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-500" />
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => load()} className="px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green/90 transition">
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const maxMovement = Math.max(...(stats.weeklyMovements ?? []).map(m => Math.max(m.entrees, m.sorties)), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Tableau de Bord — Stock</h2>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble en temps réel des stocks produits finis et matières premières</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
          >
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Produits Finis en Stock"
          value={`${stats.totalFinishedProducts} références`}
          icon={<Package size={24} />}
          color="green"
        />
        <KpiCard
          title="Matières Premières"
          value={`${stats.totalRawMaterials} références`}
          icon={<Warehouse size={24} />}
          color="blue"
        />
        <KpiCard
          title="Poids Total en Stock"
          value={`${stats.totalWeightKg.toLocaleString()} kg`}
          icon={<Scale size={24} />}
          color="purple"
        />
        <KpiCard
          title="Alertes Actives"
          value={`${stats.totalAlerts} alertes`}
          icon={<ShieldAlert size={24} />}
          color={stats.criticalAlertCount > 0 ? 'red' : 'orange'}
        />
      </div>

      {/* KPI Row 2 — Today */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm uppercase">
            <ArrowDownToLine size={16} /> Entrées du jour
          </div>
          <span className="text-4xl font-extrabold text-brand-text">{stats.todayEntries}</span>
          <span className="text-xs text-gray-400">unités entrées en stock aujourd'hui</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase">
            <ArrowUpFromLine size={16} /> Sorties du jour
          </div>
          <span className="text-4xl font-extrabold text-brand-text">{stats.todayExits}</span>
          <span className="text-xs text-gray-400">unités sorties du stock aujourd'hui</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase">
            <AlertTriangle size={16} /> Stocks bas
          </div>
          <span className="text-4xl font-extrabold text-brand-text">{stats.lowStockCount}</span>
          <span className="text-xs text-gray-400">articles sous le seuil minimum</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Movements Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-brand-text mb-5">Mouvements des 7 derniers jours</h3>
          <div className="flex items-end gap-3 h-44">
            {(stats.weeklyMovements ?? []).map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: '120px' }}>
                  <div
                    className="bg-brand-green/80 rounded-t-sm flex-1 transition-all"
                    style={{ height: `${(day.entrees / maxMovement) * 120}px` }}
                    title={`Entrées: ${day.entrees}`}
                  />
                  <div
                    className="bg-red-400/80 rounded-t-sm flex-1 transition-all"
                    style={{ height: `${(day.sorties / maxMovement) * 120}px` }}
                    title={`Sorties: ${day.sorties}`}
                  />
                </div>
                <span className="text-xs text-gray-400 text-center leading-tight">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-3">
            <span className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-brand-green/80 inline-block" />Entrées</span>
            <span className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-400/80 inline-block" />Sorties</span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-brand-text mb-5">Répartition par catégorie</h3>
          <div className="space-y-3">
            {(stats.categoryDistribution ?? []).map((cat, i) => {
              const total = stats.categoryDistribution.reduce((a, b) => a + b.value, 0) || 1;
              const pct = Math.round((cat.value / total) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="font-bold text-brand-text">{cat.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.color || '#42B649' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-brand-text mb-4">Top 5 — Articles les plus stockés</h3>
          <div className="space-y-3">
            {(stats.topProducts ?? []).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{p.productName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-brand-text">{p.quantity}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-brand-text mb-4">Alertes récentes</h3>
          {stats.recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <ShieldAlert size={32} />
              <p className="text-sm">Aucune alerte active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats.recentAlerts ?? []).map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  alert.level === 'CRITIQUE' ? 'bg-red-50 border-red-200' :
                  alert.level === 'FAIBLE' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                }`}>
                  <AlertTriangle size={16} className={`mt-0.5 flex-shrink-0 ${
                    alert.level === 'CRITIQUE' ? 'text-red-600' :
                    alert.level === 'FAIBLE' ? 'text-amber-600' : 'text-green-600'
                  }`} />
                  <p className="text-xs text-gray-700">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
