import React, { useEffect, useState } from 'react';
import { Factory, Calendar, TrendingUp, Clock, AlertTriangle, ShieldCheck, Download, Layers } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionDashboardStats } from '../mocks/productionDashboard.mock';
import { KpiCard } from '../../elevage/components/KpiCard';

export const ProductionDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ProductionDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const data = await productionService.getDashboard();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement du tableau de bord...</div>
      </div>
    );
  }

  // Find max values for chart calculations
  const maxDaily = Math.max(...stats.dailyProduction.map(d => d.value), 1);
  const maxMonthly = Math.max(...stats.monthlyProduction.map(d => d.value), 1);
  const maxStepTime = Math.max(...stats.averageTimePerStep.map(s => s.hours), 1);

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Synthèse de Production</h2>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble en temps réel de l'atelier de transformation industrielle</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
        >
          <Download size={16} />
          Exporter le rapport
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Production du Jour"
          value={`${stats.dailyProductionKg.toLocaleString()} kg`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <KpiCard
          title="Production du Mois"
          value={`${stats.monthlyProductionKg.toLocaleString()} kg`}
          icon={<Factory size={24} />}
          color="blue"
        />
        <KpiCard
          title="Temps Moyen de Production"
          value={`${stats.averageProductionTimeHours} heures`}
          icon={<Clock size={24} />}
          color="purple"
        />
        <KpiCard
          title="Produits Rejetés (Qualité)"
          value={`${stats.rejectedProducts} lots`}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
      </div>

      {/* Secondary Workflow KPI Row */}
      <div>
        <h3 className="text-lg font-bold text-brand-text mb-4">État des Lots dans le Processus</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-500 uppercase">1. Reçus</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.receivedToday}</span>
            <span className="text-xs text-gray-400 mt-1">lots aujourd'hui</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-indigo-500 uppercase">2. Attente Abattage</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.waitingLots}</span>
            <span className="text-xs text-gray-400 mt-1">lots en attente</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-500 uppercase">3. Abattus</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.inSlaughter}</span>
            <span className="text-xs text-gray-400 mt-1">lots abattus</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase">4. En Découpe</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.inCutting}</span>
            <span className="text-xs text-gray-400 mt-1">lots en découpe</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-orange-500 uppercase">5. Transformation</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.inProcessing}</span>
            <span className="text-xs text-gray-400 mt-1">lots transformés</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-brand-green uppercase font-semibold">6. Ctrl Qualité</span>
            <span className="text-2xl font-extrabold text-brand-text mt-2">{stats.inQualityCheck}</span>
            <span className="text-xs text-gray-400 mt-1">en attente de validation</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Quotidienne */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-brand-text mb-6">Production Quotidienne (kg)</h3>
          <div className="flex items-end gap-3 h-64 pt-6">
            {stats.dailyProduction.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full bg-gray-50 hover:bg-gray-100 rounded-t-lg relative flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-green bg-opacity-80 hover:bg-opacity-100 transition-all duration-700 relative"
                    style={{ height: `${(d.value / maxDaily) * 100}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-text text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      {d.value} kg
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Production Mensuelle */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-brand-text mb-6">Production Mensuelle (kg)</h3>
          <div className="flex items-end gap-3 h-64 pt-6">
            {stats.monthlyProduction.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full bg-gray-50 hover:bg-gray-100 rounded-t-lg relative flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-blue bg-opacity-80 hover:bg-opacity-100 transition-all duration-700 relative"
                    style={{ height: `${(d.value / maxMonthly) * 100}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-text text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      {d.value} kg
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des Produits Fabriqués */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-brand-text mb-4">Répartition des Produits Fabriqués</h3>
          <div className="flex flex-col justify-center h-64 space-y-4">
            {stats.productDistribution.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-700 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <span className="text-brand-text">{p.value}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.value}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temps moyen par étape de production */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-brand-text mb-4">Temps Moyen par Étape (Heures)</h3>
          <div className="flex flex-col justify-center h-64 space-y-3">
            {stats.averageTimePerStep.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-36 text-xs text-gray-600 font-semibold truncate text-right">{s.step}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-purple-500 bg-opacity-80 rounded-lg transition-all duration-500"
                    style={{ width: `${(s.hours / maxStepTime) * 100}%` }}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-[10px] font-extrabold text-gray-700">
                    {s.hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yield rates cards */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-brand-text">Rendement Industriel Global (Entrée Élevage vs Produit Fini)</h3>
          <span className="bg-brand-green/10 text-brand-green text-xs font-extrabold px-3 py-1 rounded-full">Objectif cible: 95%</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {stats.yieldRate.map((y, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 font-semibold">{y.date}</span>
              <span className="text-lg font-extrabold text-brand-text mt-1">{y.rate}%</span>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${y.rate >= 95 ? 'bg-brand-green' : 'bg-brand-orange'}`}
                  style={{ width: `${y.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
