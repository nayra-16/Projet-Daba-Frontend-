import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, ArrowLeftRight } from 'lucide-react';
import { stockService } from '../services/stockService';
import { StockMovement } from '../types';
import { MovementTypeBadge } from '../components/MovementTypeBadge';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

export const StockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      setError(null);
      const data = await stockService.getAllMovements();
      setMovements(data);
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

  const filtered = movements.filter(m => {
    const matchSearch = m.productName?.toLowerCase().includes(search.toLowerCase()) ||
      m.lotNumber?.toLowerCase().includes(search.toLowerCase()) ||
      m.responsible?.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || m.movementType === filterType;
    return matchSearch && matchType;
  });

  const totalEntrees = movements.filter(m => m.movementType === 'ENTREE').reduce((s, m) => s + m.quantity, 0);
  const totalSorties = movements.filter(m => m.movementType === 'SORTIE').reduce((s, m) => s + m.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement des mouvements...</p>
        </div>
      </div>
    );
  }

  if (error && movements.length === 0) {
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
          <h2 className="text-3xl font-extrabold text-brand-text">Mouvements de Stock</h2>
          <p className="text-gray-500 text-sm mt-1">Historique complet des entrées, sorties, ajustements et transferts</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-semibold shadow-sm text-sm">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <ArrowDownToLine size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total entrées</p>
            <p className="text-2xl font-extrabold text-brand-text">{totalEntrees.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <ArrowUpFromLine size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total sorties</p>
            <p className="text-2xl font-extrabold text-brand-text">{totalSorties.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <RefreshCcw size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total mouvements</p>
            <p className="text-2xl font-extrabold text-brand-text">{movements.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher produit, lot, responsable..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'ENTREE', 'SORTIE', 'AJUSTEMENT', 'TRANSFERT'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                filterType === t ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t === 'ALL' ? 'Tous' : t === 'ENTREE' ? 'Entrées' : t === 'SORTIE' ? 'Sorties' : t === 'AJUSTEMENT' ? 'Ajustements' : 'Transferts'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date/Heure</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lot</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Quantité</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Poids</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Référence</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Motif</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center">
                    <ArrowLeftRight size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Aucun mouvement trouvé</p>
                  </td>
                </tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{m.movementDate}</div>
                    <div className="text-xs text-gray-400">{m.movementTime ?? '—'}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <MovementTypeBadge type={m.movementType} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{m.productName}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-purple-700">{m.lotNumber}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-text">
                    <span className={`${m.movementType === 'ENTREE' ? 'text-green-600' : m.movementType === 'SORTIE' ? 'text-red-600' : 'text-gray-700'}`}>
                      {m.movementType === 'ENTREE' ? '+' : m.movementType === 'SORTIE' ? '-' : ''}{m.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    {m.weightKg ? `${m.weightKg.toFixed(1)} kg` : '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{m.reference ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">{m.reason ?? '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{m.responsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
