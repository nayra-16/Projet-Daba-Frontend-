import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Package, RefreshCw, Plus, AlertTriangle, X, Truck
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { RawMaterial } from '../types';
import { notify } from '../utils/notify';
import { getApiErrorMessage } from '../utils/apiError';

// ============================================================
// Create Modal
// ============================================================
interface CreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '', category: '', reference: '', supplier: '',
    quantityAvailable: '', quantityMinimum: '', unit: 'kg',
    unitPrice: '', dateReception: new Date().toISOString().split('T')[0],
    datePeremption: '', location: '', observations: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stockService.createRawMaterial({
        name: form.name,
        category: form.category,
        reference: form.reference || undefined,
        supplier: form.supplier || undefined,
        quantityAvailable: Number(form.quantityAvailable),
        quantityMinimum: Number(form.quantityMinimum),
        unit: form.unit,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
        dateReception: form.dateReception || undefined,
        datePeremption: form.datePeremption || undefined,
        location: form.location || undefined,
        observations: form.observations || undefined,
      });
      notify('Matière première créée avec succès');
      onSuccess();
    } catch (err: any) {
      notify(getApiErrorMessage(err, 'Erreur lors de la création'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-brand-text">Nouvelle Matière Première</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm bg-white">
                <option value="">-- Choisir --</option>
                <option>Alimentation</option>
                <option>Vétérinaire</option>
                <option>Emballage</option>
                <option>Hygiène</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
              <input value={form.reference} onChange={e => set('reference', e.target.value)}
                placeholder="MAT-XXX-000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fournisseur</label>
              <input value={form.supplier} onChange={e => set('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unité *</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm bg-white">
                <option>kg</option><option>litres</option><option>pièces</option>
                <option>doses</option><option>sachets</option><option>cartons</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qté disponible *</label>
              <input type="number" step="0.01" min="0" value={form.quantityAvailable}
                onChange={e => set('quantityAvailable', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Qté minimum *</label>
              <input type="number" step="0.01" min="0" value={form.quantityMinimum}
                onChange={e => set('quantityMinimum', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prix unitaire (FCFA)</label>
              <input type="number" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date réception</label>
              <input type="date" value={form.dateReception} onChange={e => set('dateReception', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date péremption</label>
              <input type="date" value={form.datePeremption} onChange={e => set('datePeremption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Emplacement</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="Entrepôt A - Rayon 3..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 bg-brand-green text-white rounded-xl font-semibold hover:bg-brand-green/90 transition text-sm flex items-center justify-center gap-2">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {submitting ? 'Enregistrement...' : 'Créer'}
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
export const RawMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const data = await stockService.getAllRawMaterials();
      setMaterials(data);
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Erreur de chargement');
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

  const filtered = materials.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase()) ||
    m.supplier?.toLowerCase().includes(search.toLowerCase()) ||
    m.reference?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-green font-bold animate-pulse">Chargement des matières premières...</p>
        </div>
      </div>
    );
  }

  if (error && materials.length === 0) {
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
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(true); }} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-text">Matières Premières</h2>
          <p className="text-gray-500 text-sm mt-1">Alimentation, produits vétérinaires, emballages et consommables</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-green/90 transition shadow-sm text-sm">
          <Plus size={16} /> Nouvelle matière première
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher nom, catégorie, fournisseur..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green transition-all text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold bg-brand-green/10 text-brand-green px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Truck size={15} />{filtered.length} référence{filtered.length > 1 ? 's' : ''}
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
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Désignation</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Catégorie</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Référence</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fournisseur</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Disponible</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Minimum</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Péremption</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Aucune matière première trouvée</p>
                  </td>
                </tr>
              ) : filtered.map(m => {
                const isLow = m.quantityAvailable <= m.quantityMinimum;
                const isCritical = m.quantityAvailable === 0;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{m.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{m.category}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{m.reference ?? '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{m.supplier ?? '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-center font-bold text-brand-text">
                      {m.quantityAvailable} {m.unit}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-center text-amber-600 font-semibold">
                      {m.quantityMinimum} {m.unit}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{m.datePeremption ?? '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" /> Épuisé
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Stock bas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
