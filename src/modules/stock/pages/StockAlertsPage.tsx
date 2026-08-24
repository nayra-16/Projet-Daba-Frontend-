import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, AlertTriangle, BellRing, CheckCircle, AlertCircle } from 'lucide-react';
import { stockService } from '../services/stockService';
import { StockAlert, StockAlertLevel } from '../types';
import { AlertLevelBadge } from '../components/AlertLevelBadge';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

const ALERT_TYPE_LABELS: Record<string, string> = {
  STOCK_BAS: 'Stock bas',
  DATE_PEREMPTION: 'Péremption imminente',
  RUPTURE: 'Rupture de stock',
};

export const StockAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      setError(null);
      const data = await stockService.getAllAlerts();
      setAlerts(data);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Erreur de chargement');
      setError(msg);
      if (!silent) notify(msg, 'error');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = alerts.filter(a => {
    const matchSearch = a.message?.toLowerCase().includes(search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(search.toLowerCase()) ||
      a.rawMaterialName?.toLowerCase().includes(search.toLowerCase()) ||
      a.alertType?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'ALL' || a.alertLevel === filterLevel;
    return matchSearch && matchLevel;
  });

  const criticalCount = alerts.filter(a => a.alertLevel === StockAlertLevel.CRITIQUE).length;
  const lowCount = alerts.filter(a => a.alertLevel === StockAlertLevel.FAIBLE).length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-500" />
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => load()} className="px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green/90 transition">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Alertes de Stock</h2>
          <p className="text-gray-500 text-sm mt-1">Surveillance des stocks critiques, dates de péremption et ruptures</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-semibold shadow-sm text-sm">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-red-500 font-bold uppercase">Alertes critiques</p>
            <p className="text-2xl font-extrabold text-red-700">{criticalCount}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-bold uppercase">Alertes faibles</p>
            <p className="text-2xl font-extrabold text-amber-700">{lowCount}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-green-600 font-bold uppercase">Résolues</p>
            <p className="text-2xl font-extrabold text-green-700">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher une alerte..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'CRITIQUE', 'FAIBLE', 'NORMAL'].map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                filterLevel === l ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {l === 'ALL' ? 'Toutes' : l === 'CRITIQUE' ? 'Critique' : l === 'FAIBLE' ? 'Faible' : 'Normal'}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-20 flex flex-col items-center justify-center gap-3">
          <BellRing size={48} className="text-gray-300" />
          <p className="text-gray-400 font-medium">Aucune alerte trouvée</p>
          {alerts.length === 0 && <p className="text-gray-400 text-sm">Tous les stocks sont dans les normes ✓</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex items-start gap-4 transition-all ${
              alert.resolved ? 'opacity-60 border-gray-200' :
              alert.alertLevel === StockAlertLevel.CRITIQUE ? 'border-red-200 bg-red-50/30' :
              alert.alertLevel === StockAlertLevel.FAIBLE ? 'border-amber-200 bg-amber-50/30' :
              'border-gray-200'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                alert.alertLevel === StockAlertLevel.CRITIQUE ? 'bg-red-100 text-red-600' :
                alert.alertLevel === StockAlertLevel.FAIBLE ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
              }`}>
                {alert.alertLevel === StockAlertLevel.CRITIQUE ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <AlertLevelBadge level={alert.alertLevel} />
                  <span className="text-xs font-semibold text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                    {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                  </span>
                  {alert.resolved && (
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} /> Résolue {alert.resolvedBy ? `par ${alert.resolvedBy}` : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-brand-text">{alert.message}</p>
                {(alert.productName || alert.rawMaterialName) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Article : {alert.productName ?? alert.rawMaterialName}
                  </p>
                )}
                {alert.thresholdValue !== undefined && alert.currentValue !== undefined && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">Seuil : <strong>{alert.thresholdValue}</strong></span>
                    <span className="text-xs text-gray-500">Actuel : <strong className="text-red-600">{alert.currentValue}</strong></span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{alert.alertDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
