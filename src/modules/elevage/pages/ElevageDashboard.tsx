import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Home, Package, AlertCircle, Truck, Activity, RefreshCw } from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { KpiCard } from '../components/KpiCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { ElevageDashboardStats } from '../types';

export const ElevageDashboard: React.FC = () => {
  const [stats, setStats] = useState<ElevageDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await elevageService.getDashboardStats();
      setStats(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement du tableau de bord élevage...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">Aucune donnée disponible pour le moment.</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Tableau de bord Élevage</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble et indicateurs de performance de l'élevage</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* KPI Cards - Workflow Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Lots en arrivée"
          value={stats.lotsArrivee}
          icon={<Home size={24} />}
          color="blue"
        />
        <KpiCard
          title="Lots en élevage"
          value={stats.lotsEnElevage}
          icon={<Activity size={24} />}
          color="green"
        />
        <KpiCard
          title="Lots en vaccination"
          value={stats.lotsEnVaccination}
          icon={<Activity size={24} />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Lots sous traitement"
          value={stats.lotsEnTraitement}
          icon={<AlertCircle size={24} />}
          color="orange"
        />
        <KpiCard
          title="Lots prêts abattage"
          value={stats.lotsPretsAbattage}
          icon={<Package size={24} />}
          color="green"
        />
        <KpiCard
          title="Lots transférés"
          value={stats.lotsTransferes}
          icon={<Truck size={24} />}
          color="blue"
        />
      </div>

      {/* Global Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Lots actifs"
          value={stats.activeLotsCount}
          icon={<LayoutDashboard size={24} />}
          color="green"
        />
        <KpiCard
          title="Total volailles"
          value={stats.totalBirds.toLocaleString()}
          icon={<Home size={24} />}
          color="blue"
        />
        <KpiCard
          title="Poulaillers"
          value={stats.poulailersCount}
          icon={<Home size={24} />}
          color="orange"
        />
        <KpiCard
          title="Capacité utilisée"
          value={`${stats.capacityUsed}%`}
          icon={<Package size={24} />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Effectifs par lot actif"
          data={
            stats.birdEvolution.length > 0
              ? stats.birdEvolution.map((d) => ({ label: d.date, value: d.count }))
              : [{ label: 'Aucun lot', value: 0 }]
          }
          color="#42B649"
        />
        <SimpleBarChart
          title="Consommation alimentaire récente (kg)"
          data={
            stats.feedEvolution.length > 0
              ? stats.feedEvolution.map((d) => ({ label: d.date, value: d.quantity }))
              : [{ label: 'Aucun aliment', value: 0 }]
          }
          color="#244A9B"
        />
      </div>
    </div>
  );
};
