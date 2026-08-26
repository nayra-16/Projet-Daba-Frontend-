import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Plus, AlertTriangle, X, ClipboardList, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { stockService } from '../services/stockService';
import { Inventory, Stock } from '../types';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

// ============================================================
// Inventory Status Badge
// ============================================================
const InventoryStatusBadge: React.FC<{ status: Inventory['status'] }> = ({ status }) => {
  const cfg = {
    CONFORME: { label: 'Conforme', cls: 'bg-green-100 text-green-700', Icon: CheckCircle },
    DEFICIT: { label: 'Déficit', cls: 'bg-red-100 text-red-700', Icon: TrendingDown },
    EXCEDENT: { label: 'Excédent', cls: 'bg-blue-100 text-blue-700', Icon: TrendingUp },
  }[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600', Icon: CheckCircle };
  const { label, cls, Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      <Icon size={11} />{label}
    </span>
  );
};

// ============================================================
// Create Inventory Modal
// ============================================================
interface CreateModalProps { stocks: Stock[]; onClose: () => void; onSuccess: () => void; }

const CreateInventoryModal: React.FC<CreateModalProps> = ({ stocks, onClose, onSuccess }) => {
  const [stockId, setStockId] = useState('');
  const [inventoryDate, setInventoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [theoreticalQty, setTheoreticalQty] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [responsible, setResponsible] = useState('');
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedStock = stocks.find(s => String(s.id) === stockId);
  const gap = actualQty && theoreticalQty ? Number(actualQty) - Number(theoreticalQty) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockService.createInventory({
        stockId: Number(stockId),
        inventoryDate,
        theoreticalQuantity: Number(theoreticalQty),
        actualQuantity: Number(actualQty),
        responsible,
        observations: observations || undefined,
      });
      notify('Inventaire créé avec succès');
      onSuccess();
    } catch (err: any) {
      notify(getApiErrorMessage(err, 'Erreur lors de la création'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-brand-text flex items-center gap-2">
            <ClipboardList size={18} /> Nouvel inventaire
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Article *</label>
            <select value={stockId} onChange={e => {
              setStockId(e.target.value);
              const s = stocks.find(x => String(x.id) === e.target.value);
              if (s) setTheoreticalQty(String(s.quantityAvailable));
            }} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm bg-white">
              <option value="">-- Choisir un article --</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.productName} ({s.lotNumber})</option>)}
            </select>
          </div>
          {selectedStock && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between">
              <span className="text-gray-500">Stock système :</span>
              <span className="font-bold">{selectedStock.quantityAvailable} {selectedStock.unit}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date d'inventaire *</label>
            <input type="date" value={inventoryDate} onChange={e => setInventoryDate(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qté théorique *</label>
              <input type="number" min="0" value={theoreticalQty} onChange={e => setTheoreticalQty(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qté réelle *</label>
              <input type="number" min="0" value={actualQty} onChange={e => setActualQty(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
          </div>
          {gap !== null && (
            <div className={`rounded-xl p-3 text-sm font-semibold text-center ${
              gap === 0 ? 'bg-green-50 text-green-700' : gap > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
            }`}>
              Écart : {gap > 0 ? '+' : ''}{gap} {selectedStock?.unit ?? ''}
              {gap === 0 ? ' — Conforme' : gap > 0 ? ' — Excédent' : ' — Déficit'}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable *</label>
            <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observations</label>
            <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green/90 transition text-sm flex items-center justify-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {submitting ? 'Création...' : 'Créer l\'inventaire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Main Page
// ============================================================
export const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      setError(null);
      const [inv, stk] = await Promise.all([stockService.getAllInventories(), stockService.getAllStocks()]);
      setInventories(inv);
      setStocks(stk);
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
    const interval = setInterval(() => load(true), 60000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = inventories.filter(i =>
    i.productName?.toLowerCase().includes(search.toLowerCase()) ||
    i.lotNumber?.toLowerCase().includes(search.toLowerCase()) ||
    i.responsible?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement des inventaires...</p>
        </div>
      </div>
    );
  }

  if (error && inventories.length === 0) {
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
      {showCreate && (
        <CreateInventoryModal stocks={stocks} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(true); }} />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Inventaires</h2>
          <p className="text-gray-500 text-sm mt-1">Suivi des comptages physiques et réconciliation des stocks</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-green/90 transition shadow-sm text-sm">
          <Plus size={16} /> Nouvel inventaire
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher produit, lot, responsable..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <ClipboardList size={15} />{filtered.length} inventaire{filtered.length > 1 ? 's' : ''}
          </span>
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 bg-white text-gray-600 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-semibold">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lot</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qté théorique</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qté réelle</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Écart</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Responsable</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Aucun inventaire trouvé</p>
                  </td>
                </tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{inv.productName}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-purple-700">{inv.lotNumber}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{inv.inventoryDate}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-gray-600">{inv.theoreticalQuantity}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-text">{inv.actualQuantity}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center font-bold">
                    <span className={inv.gap === 0 ? 'text-green-600' : inv.gap > 0 ? 'text-blue-600' : 'text-red-600'}>
                      {inv.gap > 0 ? '+' : ''}{inv.gap}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{inv.responsible}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <InventoryStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
