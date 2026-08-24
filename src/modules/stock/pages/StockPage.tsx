import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { stockService } from '../services/stockService';
import { Stock, RawMaterial, StockMovement, Inventory, StockAlert, StockDashboardStats } from '../types';
import { StockStatusBadge } from '../components/StockStatusBadge';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';
import { useAuth } from '../../../core/context/AuthContext';

type TabKey = 'overview' | 'products' | 'materials' | 'movements' | 'inventory' | 'alerts';

interface TabItem {
  key: TabKey;
  label: string;
  icon: any;
}

const TABS: TabItem[] = [
  { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: 'products', label: 'Produits finis', icon: Package },
  { key: 'materials', label: 'Matières premières', icon: Boxes },
  { key: 'movements', label: 'Mouvements', icon: ArrowLeftRight },
  { key: 'inventory', label: 'Inventaires', icon: ClipboardList },
  { key: 'alerts', label: 'Alertes de stock', icon: AlertTriangle },
];

export const StockPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const toast = useToast();
  const confirm = useConfirm();

  // === DATA STATES ===
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<StockDashboardStats | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  // === SEARCH & FILTERS ===
  const [searchQuery, setSearchQuery] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const { user } = useAuth();
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Système';

  // === MODAL STATES ===
  // 1. Stock In/Out Modal
  const [movementModalStock, setMovementModalStock] = useState<Stock | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementForm, setMovementForm] = useState({
    quantity: 1,
    weightKg: '',
    reference: '',
    reason: '',
    responsible: currentUserName,
  });

  // 2. Raw Material Modal
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    code: '',
    category: 'ALIMENT',
    quantity: 100,
    unit: 'kg',
    unitPrice: 500,
    minThreshold: 20,
    supplier: '',
  });

  // 3. Inventory Modal
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    stockId: '',
    countedQuantity: 0,
    responsible: currentUserName,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // === LOAD DATA ===
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, stks, mats, movs, invs, alrts] = await Promise.all([
        stockService.getDashboard(),
        stockService.getAllStocks(),
        stockService.getAllRawMaterials(),
        stockService.getAllMovements(),
        stockService.getAllInventories(),
        stockService.getAllAlerts(),
      ]);
      setDashboardStats(stats);
      setStocks(stks);
      setRawMaterials(mats);
      setMovements(movs);
      setInventories(invs);
      setAlerts(alrts);
    } catch {
      toast.error('Erreur', 'Impossible de charger les données du stock');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const formatFCFA = (n: number) => `${(n || 0).toLocaleString('fr-FR')} FCFA`;

  // === STOCK MOVEMENT ACTIONS ===
  const openMovementModal = (stock: Stock, type: 'in' | 'out') => {
    setMovementModalStock(stock);
    setMovementType(type);
    setMovementForm({
      quantity: 1,
      weightKg: '',
      reference: '',
      reason: '',
      responsible: currentUserName,
    });
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalStock) return;
    if (movementType === 'out' && movementForm.quantity > movementModalStock.quantityAvailable) {
      toast.error('Stock insuffisant', `Seulement ${movementModalStock.quantityAvailable} disponibles`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        stockId: Number(movementModalStock.id),
        quantity: Number(movementForm.quantity),
        weightKg: movementForm.weightKg ? Number(movementForm.weightKg) : undefined,
        movementDate: new Date().toISOString().split('T')[0],
        movementTime: new Date().toTimeString().slice(0, 5),
        reference: movementForm.reference || undefined,
        reason: movementForm.reason || undefined,
        responsible: movementForm.responsible,
      };

      if (movementType === 'in') {
        await stockService.stockIn(payload);
        toast.success('Entrée validée', 'Marchandise ajoutée au stock');
      } else {
        await stockService.stockOut(payload);
        toast.success('Sortie validée', 'Sortie de stock enregistrée');
      }

      setMovementModalStock(null);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Échec de l\'opération de stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStock = async (stock: Stock) => {
    const ok = await confirm.ask({
      title: 'Supprimer cet article de stock ?',
      message: `Supprimer définitivement ${stock.productName} (${stock.lotNumber}).`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await stockService.deleteStock(stock.id);
      toast.success('Succès', 'Article supprimé du stock');
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible de supprimer cet article');
    }
  };

  // === RAW MATERIAL ACTIONS ===
  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name.trim()) {
      toast.error('Validation', 'Le nom de la matière première est requis');
      return;
    }
    setSubmitting(true);
    try {
      await stockService.createRawMaterial({
        name: materialForm.name.trim(),
        reference: materialForm.code.trim() || undefined,
        category: materialForm.category,
        quantityAvailable: Number(materialForm.quantity),
        quantityMinimum: Number(materialForm.minThreshold),
        unit: materialForm.unit,
        unitPrice: Number(materialForm.unitPrice),
        supplier: materialForm.supplier.trim() || undefined,
      });
      toast.success('Succès', 'Matière première enregistrée');
      setMaterialModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'ajouter la matière première');
    } finally {
      setSubmitting(false);
    }
  };

  // === INVENTORY ACTIONS ===
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.stockId) {
      toast.error('Validation', 'Veuillez sélectionner un article');
      return;
    }
    setSubmitting(true);
    const selectedStock = stocks.find((s) => s.id === inventoryForm.stockId);
    try {
      await stockService.createInventory({
        stockId: Number(inventoryForm.stockId),
        theoreticalQuantity: selectedStock?.quantityAvailable || 0,
        actualQuantity: Number(inventoryForm.countedQuantity),
        inventoryDate: new Date().toISOString().split('T')[0],
        responsible: inventoryForm.responsible,
        observations: inventoryForm.notes,
      });
      toast.success('Succès', 'Inventaire enregistré et stock réajusté');
      setInventoryModalOpen(false);
      await loadAllData();
    } catch {
      toast.error('Erreur', 'Impossible d\'enregistrer l\'inventaire');
    } finally {
      setSubmitting(false);
    }
  };

  // === FILTERED DATA ===
  const filteredStocks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return stocks.filter(
      (s) => s.productName?.toLowerCase().includes(q) || s.lotNumber?.toLowerCase().includes(q)
    );
  }, [stocks, searchQuery]);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rawMaterials.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.supplier?.toLowerCase().includes(q) ||
        m.reference?.toLowerCase().includes(q)
    );
  }, [rawMaterials, searchQuery]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchType = movementTypeFilter === 'ALL' || 
        (movementTypeFilter === 'IN' && m.movementType === 'ENTREE') ||
        (movementTypeFilter === 'OUT' && m.movementType === 'SORTIE');
      const q = searchQuery.toLowerCase();
      const matchSearch =
        m.productName?.toLowerCase().includes(q) ||
        m.lotNumber?.toLowerCase().includes(q) ||
        m.reference?.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [movements, movementTypeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Gestion des Stocks</h1>
            <p className="text-slate-400 text-sm">
              Produits finis, Matières premières, Entrées/Sorties, Inventaires & Traçabilité
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadAllData}
          disabled={loading}
          className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-700">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#42B649] text-white shadow-md'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.key === 'alerts' && alerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-red text-white">
                  {alerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: VUE D'ENSEMBLE                                         */}
      {/* ============================================================ */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Produits finis</span>
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
                  <Package size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-100">{stocks.length}</p>
              <p className="text-xs text-slate-500 mt-1">Références actives</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Valeur totale stock</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {formatFCFA(dashboardStats?.totalStockValueEur || 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Valorisation actuelle</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Matières premières</span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Boxes size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-400">{rawMaterials.length}</p>
              <p className="text-xs text-slate-500 mt-1">Intrants & emballages</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase">Alertes critiques</span>
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-400">{alerts.length}</p>
              <p className="text-xs text-slate-500 mt-1">Sous le seuil de sécurité</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Movements */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100">Derniers Mouvements</h3>
                <button
                  onClick={() => setActiveTab('movements')}
                  className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1"
                >
                  <span>Tous les flux</span>
                </button>
              </div>
              {movements.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Aucun mouvement récent.</p>
              ) : (
                <div className="space-y-3">
                  {movements.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-800/50 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            m.movementType === 'ENTREE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {m.movementType === 'ENTREE' ? 'IN' : 'OUT'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{m.productName}</p>
                          <p className="text-xs text-slate-400">
                            {m.movementDate} • {m.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">#{m.lotNumber}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Critical Alerts */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100">Alertes Stock</h3>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1"
                >
                  <span>Voir alertes</span>
                </button>
              </div>
              {alerts.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">Aucune alerte. Niveaux de stock nominaux.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 bg-red-500/10 rounded-xl flex items-center justify-between border border-red-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-400" size={18} />
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{a.productName}</p>
                          <p className="text-xs text-red-400">
                            Disponible : {a.currentValue} (Seuil : {a.thresholdValue})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded">
                        Critique
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PRODUITS FINIS                                         */}
      {/* ============================================================ */}
      {currentTab === 'products' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Stock Produits Finis</h2>
              <p className="text-slate-400 text-sm">{filteredStocks.length} article(s) en stock</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher produit, lot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          {filteredStocks.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun article de stock trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">N° Lot</th>
                    <th className="py-3 px-4">Quantité</th>
                    <th className="py-3 px-4">Poids Total</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredStocks.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-200 text-sm">{s.productName}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-blue-400 font-bold">#{s.lotNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-200 text-sm">
                        {s.quantityAvailable} {s.unit}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-400">
                        {s.weightKg ? `${s.weightKg} kg` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          s.quantityAvailable > s.quantityMinimum ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {s.quantityAvailable > s.quantityMinimum ? 'En Stock' : 'Faible'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openMovementModal(s, 'in')}
                            className="px-2.5 py-1.5 text-xs font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors flex items-center gap-1"
                            title="Entrée en stock"
                          >
                            <ArrowDownToLine size={14} />
                            <span>Entrée</span>
                          </button>
                          <button
                            onClick={() => openMovementModal(s, 'out')}
                            className="px-2.5 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                            title="Sortie de stock"
                          >
                            <ArrowUpFromLine size={14} />
                            <span>Sortie</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStock(s)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MATIÈRES PREMIÈRES                                     */}
      {/* ============================================================ */}
      {currentTab === 'materials' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Matières Premières & Intrants</h2>
              <p className="text-slate-400 text-sm">Gestion des aliments, emballages et intrants</p>
            </div>
            <button
              type="button"
              onClick={() => setMaterialModalOpen(true)}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Nouvelle matière</span>
            </button>
          </div>

          {filteredMaterials.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucune matière première répertoriée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Désignation</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Quantité</th>
                    <th className="py-3 px-4">Prix Unitaire</th>
                    <th className="py-3 px-4">Fournisseur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-200 text-sm">{m.name}</p>
                        {m.reference && <p className="text-xs text-slate-500 font-mono">{m.reference}</p>}
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded w-fit">
                        {m.category}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200 text-sm">
                        {m.quantityAvailable} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">{formatFCFA(m.unitPrice || 0)}</td>
                      <td className="py-3 px-4 text-sm text-slate-300 font-medium">{m.supplier || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: MOUVEMENTS                                             */}
      {/* ============================================================ */}
      {currentTab === 'movements' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Journal des Mouvements</h2>
              <p className="text-slate-400 text-sm">Historique des entrées et sorties de marchandises</p>
            </div>
            <div className="flex gap-2">
              {(['ALL', 'IN', 'OUT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementTypeFilter(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    movementTypeFilter === t
                      ? 'bg-[#42B649] text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {t === 'ALL' ? 'Tous flux' : t === 'IN' ? 'Entrées (IN)' : 'Sorties (OUT)'}
                </button>
              ))}
            </div>
          </div>

          {filteredMovements.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun mouvement enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">N° Lot</th>
                    <th className="py-3 px-4">Quantité</th>
                    <th className="py-3 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-400">{m.movementDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            m.movementType === 'ENTREE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200 text-sm">{m.productName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-400">#{m.lotNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-200 text-sm">
                        {m.quantity}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{m.responsible || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: INVENTAIRES                                            */}
      {/* ============================================================ */}
      {currentTab === 'inventory' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Inventaires Physiques</h2>
              <p className="text-slate-400 text-sm">Rapprochement et ajustement des stocks</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setInventoryForm({
                  stockId: stocks[0]?.id ? String(stocks[0].id) : '',
                  countedQuantity: 0,
                  responsible: currentUserName,
                  notes: '',
                });
                setInventoryModalOpen(true);
              }}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Enregistrer inventaire</span>
            </button>
          </div>

          {inventories.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Aucun inventaire enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Stock Théorique</th>
                    <th className="py-3 px-4">Stock Compté</th>
                    <th className="py-3 px-4">Écart</th>
                    <th className="py-3 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {inventories.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/80 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-400">{inv.inventoryDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-200 text-sm">{inv.productName}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{inv.theoreticalQuantity}</td>
                      <td className="py-3 px-4 font-bold text-slate-200 text-sm">{inv.actualQuantity}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            inv.gap === 0
                              ? 'bg-green-500/20 text-green-400'
                              : inv.gap < 0
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {inv.gap > 0 ? `+${inv.gap}` : inv.gap}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{inv.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: ALERTES                                                */}
      {/* ============================================================ */}
      {currentTab === 'alerts' && (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Alertes de Stock & Ruptures</h2>
            <p className="text-slate-400 text-sm">Articles nécessitant un réapprovisionnement urgent</p>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl">
              <CheckCircle2 size={36} className="mx-auto text-brand-green mb-2" />
              <p className="text-slate-200 font-bold">Tous les niveaux de stock sont nominaux</p>
              <p className="text-slate-500 text-sm mt-1">Aucune rupture critique détectée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="border border-red-500/20 bg-red-500/10 rounded-2xl p-5 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{a.productName || a.rawMaterialName}</h3>
                      <div className="mt-2 text-xs space-y-1">
                        <p className="text-red-400 font-bold">
                          Quantité disponible : {a.currentValue}
                        </p>
                        <p className="text-slate-500">Seuil de sécurité : {a.thresholdValue}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('products');
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                  >
                    Approvisionner
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: MOUVEMENT STOCK (IN / OUT)                           */}
      {/* ============================================================ */}
      <Modal
        open={movementModalStock !== null}
        onClose={() => setMovementModalStock(null)}
        title={movementType === 'in' ? 'Entrée de Stock' : 'Sortie de Stock'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMovementModalStock(null)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="movement-form"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-md ${
                movementType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {submitting ? 'Validation...' : movementType === 'in' ? 'Confirmer Entrée' : 'Confirmer Sortie'}
            </button>
          </div>
        }
      >
        {movementModalStock && (
          <form id="movement-form" onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="font-bold text-slate-200">{movementModalStock.productName}</p>
              <p className="text-xs text-slate-400">N° Lot : {movementModalStock.lotNumber}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">
                Stock actuel : {movementModalStock.quantityAvailable} {movementModalStock.unit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">
                  Quantité <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={movementType === 'out' ? movementModalStock.quantityAvailable : undefined}
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Poids total (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optionnel"
                  value={movementForm.weightKg}
                  onChange={(e) => setMovementForm({ ...movementForm, weightKg: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Référence pièce</label>
              <input
                type="text"
                placeholder="Ex: BL-2026-004, Facture..."
                value={movementForm.reference}
                onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Responsable</label>
              <input
                type="text"
                value={movementForm.responsible}
                onChange={(e) => setMovementForm({ ...movementForm, responsible: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: CRÉATION MATIÈRE PREMIÈRE                            */}
      {/* ============================================================ */}
      <Modal
        open={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title="Nouvelle Matière Première / Intrant"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMaterialModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="material-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="material-form" onSubmit={handleMaterialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">
              Désignation <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Maïs grain broyé 50kg"
              value={materialForm.name}
              onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Catégorie</label>
              <select
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
              >
                <option value="ALIMENT">Aliment</option>
                <option value="EMBALLAGE">Emballage</option>
                <option value="VETERINAIRE">Vétérinaire</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Quantité initiale</label>
              <input
                type="number"
                required
                min={0}
                value={materialForm.quantity}
                onChange={(e) => setMaterialForm({ ...materialForm, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Prix unitaire (FCFA)</label>
              <input
                type="number"
                required
                min={0}
                value={materialForm.unitPrice}
                onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Fournisseur</label>
              <input
                type="text"
                placeholder="Ex: Agro-Fournitures CI"
                value={materialForm.supplier}
                onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: ENREGISTREMENT INVENTAIRE                            */}
      {/* ============================================================ */}
      <Modal
        open={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        title="Enregistrer un Inventaire Physique"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInventoryModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="inventory-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : 'Valider Inventaire'}
            </button>
          </div>
        }
      >
        <form id="inventory-form" onSubmit={handleInventorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Article inventorié</label>
            <select
              value={inventoryForm.stockId}
              onChange={(e) => setInventoryForm({ ...inventoryForm, stockId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-medium"
            >
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.productName} (#{s.lotNumber}) — Dispo théorique : {s.quantityAvailable} {s.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">
              Quantité réelle comptée <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={inventoryForm.countedQuantity}
              onChange={(e) => setInventoryForm({ ...inventoryForm, countedQuantity: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Responsable</label>
            <input
              type="text"
              value={inventoryForm.responsible}
              onChange={(e) => setInventoryForm({ ...inventoryForm, responsible: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Observations / Justification écart</label>
            <textarea
              rows={2}
              placeholder="Ex: Casse constatée, écart de pesée..."
              value={inventoryForm.notes}
              onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockPage;
