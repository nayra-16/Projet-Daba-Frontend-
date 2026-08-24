import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Package, RefreshCw, Plus, ArrowDownToLine,
  ArrowUpFromLine, Trash2, AlertTriangle, X, CheckCircle
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { Stock } from '../types';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

// ============================================================
// Modal Mouvement
// ============================================================
interface MovementModalProps {
  stock: Stock;
  type: 'in' | 'out';
  onClose: () => void;
  onSuccess: () => void;
}

const MovementModal: React.FC<MovementModalProps> = ({ stock, type, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [weightKg, setWeightKg] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [responsible, setResponsible] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsible.trim()) { notify('Le responsable est obligatoire', 'error'); return; }
    if (type === 'out' && quantity > stock.quantityAvailable) {
      notify(`Stock insuffisant : ${stock.quantityAvailable} ${stock.unit} disponibles`, 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        stockId: Number(stock.id),
        quantity,
        weightKg: weightKg ? Number(weightKg) : undefined,
        movementDate: new Date().toISOString().split('T')[0],
        movementTime: new Date().toTimeString().slice(0, 5),
        reference: reference || undefined,
        reason: reason || undefined,
        responsible,
      };
      if (type === 'in') await stockService.stockIn(payload);
      else await stockService.stockOut(payload);
      notify(type === 'in' ? 'Entrée enregistrée avec succès' : 'Sortie enregistrée avec succès');
      onSuccess();
    } catch (err: any) {
      notify(getApiErrorMessage(err, 'Erreur lors de l\'opération'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className={`p-5 border-b rounded-t-2xl flex items-center justify-between ${type === 'in' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-3">
            {type === 'in' ? <ArrowDownToLine size={20} className="text-green-600" /> : <ArrowUpFromLine size={20} className="text-red-600" />}
            <div>
              <h3 className="font-bold text-brand-text">{type === 'in' ? 'Entrée en stock' : 'Sortie de stock'}</h3>
              <p className="text-xs text-gray-500">{stock.productName} — {stock.lotNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between">
            <span className="text-gray-500">Stock actuel :</span>
            <span className="font-bold text-brand-text">{stock.quantityAvailable} {stock.unit}</span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantité *</label>
            <input type="number" min={1} max={type === 'out' ? stock.quantityAvailable : undefined}
              value={quantity} onChange={e => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm"
              required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Poids (kg)</label>
            <input type="number" step="0.01" value={weightKg} onChange={e => setWeightKg(e.target.value)}
              placeholder="Optionnel"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
            <input type="text" value={reference} onChange={e => setReference(e.target.value)}
              placeholder="N° commande, bon de livraison..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Motif</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Vente, transfert, péremption..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable *</label>
            <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)}
              placeholder="Nom du responsable"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm"
              required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className={`flex-1 px-4 py-2 text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2
                ${type === 'in' ? 'bg-brand-green hover:bg-brand-green/90' : 'bg-red-600 hover:bg-red-700'}`}>
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {submitting ? 'Enregistrement...' : type === 'in' ? 'Valider l\'entrée' : 'Valider la sortie'}
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
export const FinishedProductsStockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [movementModal, setMovementModal] = useState<{ stock: Stock; type: 'in' | 'out' } | null>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Erreur lors du chargement');
      setError(msg);
      if (!silent) notify(msg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60000);
    return () => clearInterval(interval);
  }, [load]);

  const handleDelete = async (stock: Stock) => {
    if (!window.confirm(`Supprimer le stock "${stock.productName}" ? Cette action est irréversible.`)) return;
    try {
      await stockService.deleteStock(stock.id);
      notify('Stock supprimé avec succès');
      load(true);
    } catch (err: any) {
      notify(getApiErrorMessage(err, 'Erreur lors de la suppression'), 'error');
    }
  };

  const filtered = stocks.filter(s =>
    s.productName?.toLowerCase().includes(search.toLowerCase()) ||
    s.lotNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement des stocks...</p>
        </div>
      </div>
    );
  }

  if (error && stocks.length === 0) {
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

  return (
    <div className="space-y-6">
      {movementModal && (
        <MovementModal
          stock={movementModal.stock}
          type={movementModal.type}
          onClose={() => setMovementModal(null)}
          onSuccess={() => { setMovementModal(null); load(true); }}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Produits Finis en Stock</h2>
        <p className="text-gray-500 text-sm mt-1">Gestion des stocks de produits finis issus de la production</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un produit, lot, catégorie..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green transition-all text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Package size={15} />{filtered.length} article{filtered.length > 1 ? 's' : ''}
          </span>
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 bg-white text-gray-600 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-semibold">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lot</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Catégorie</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Disponible</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Réservé</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Min.</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Poids</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Péremption</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-14 text-center">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Aucun stock trouvé</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{s.productName}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-mono font-bold text-purple-700">{s.lotNumber}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{s.category}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-text">{s.quantityAvailable} {s.unit}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-gray-500">{s.quantityReserved}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-amber-600 font-semibold">{s.quantityMinimum}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-gray-600">{s.weightKg ? `${s.weightKg.toFixed(1)} kg` : '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{s.datePeremption ?? '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <StockStatusBadge quantityAvailable={s.quantityAvailable} quantityMinimum={s.quantityMinimum} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setMovementModal({ stock: s, type: 'in' })}
                        title="Entrée" className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition">
                        <ArrowDownToLine size={14} />
                      </button>
                      <button onClick={() => setMovementModal({ stock: s, type: 'out' })}
                        title="Sortie" className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition">
                        <ArrowUpFromLine size={14} />
                      </button>
                      <button onClick={() => handleDelete(s)}
                        title="Supprimer" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
