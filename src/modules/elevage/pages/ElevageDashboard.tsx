
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Home, Package, TrendingUp, Droplets, AlertCircle, Truck, Activity } from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { KpiCard } from '../components/KpiCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { ElevageDashboardStats } from '../types';

export const ElevageDashboard: React.FC = () => {
  const [stats, setStats] = useState<ElevageDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await elevageService.getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
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
          color="yellow"
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

      {/* Existing KPI Cards */}
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
          title="Évolution des effectifs"
          data={stats.birdEvolution.map(d => ({ label: d.date, value: d.count }))}
          color="#42B649"
        />
        <SimpleBarChart
          title="Évolution de la consommation alimentaire"
          data={stats.feedEvolution.map(d => ({ label: d.date, value: d.quantity }))}
          color="#244A9B"
        />
      </div>
    </div>
  );
};
