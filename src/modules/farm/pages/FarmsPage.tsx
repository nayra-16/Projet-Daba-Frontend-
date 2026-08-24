// @ts-nocheck
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Farm, FarmPoulailler, FarmLot } from '../types';
import { farmService } from '../services/farmService';
import {
  MapPin,
  Phone,
  User,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Building2,
  Mail,
  AlertCircle,
  ArrowRight,
  LayoutDashboard,
  Layers,
  Warehouse,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

type TabKey = 'overview' | 'farms' | 'capacites';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabItem[] = [
  { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: 'farms', label: 'Fermes & Exploitations', icon: Building2 },
  { key: 'capacites', label: 'Bâtiments & Capacités', icon: Warehouse },
];

interface FarmFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  area: number;
}

const emptyForm: FarmFormData = {
  name: '',
  address: '',
  phone: '',
  email: '',
  area: 0,
};

export const FarmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState<FarmFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Detail Drawer / Modal for Farm
  const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);
  const [farmPoulaillers, setFarmPoulaillers] = useState<FarmPoulailler[]>([]);
  const [farmLots, setFarmLots] = useState<FarmLot[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const loadFarms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await farmService.getAllFarms();
      setFarms(data);
    } catch (err: any) {
      toast.error('Erreur', 'Impossible de charger les fermes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  // Load Farm Details (Poulaillers + Lots)
  const openFarmDetails = async (farm: Farm) => {
    setViewingFarm(farm);
    setDetailLoading(true);
    try {
      const [poulData, lotsData] = await Promise.all([
        farmService.getPoulaillersByFarmId(farm.id),
        farmService.getLotsByFarmId(farm.id),
      ]);
      setFarmPoulaillers(poulData);
      setFarmLots(lotsData);
    } catch {
      toast.error('Erreur', 'Impossible de charger les bâtiments de la ferme');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingFarm(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      address: farm.address || farm.location || '',
      phone: farm.contactPhone || farm.phone || '',
      email: farm.email || '',
      area: farm.area || farm.capacity || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Validation', 'Le nom de la ferme est obligatoire');
      return;
    }
    setSubmitting(true);
    try {
      if (editingFarm) {
        await farmService.updateFarm(editingFarm.id, {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          area: Number(formData.area),
        });
        toast.success('Succès', 'Ferme mise à jour avec succès');
      } else {
        await farmService.createFarm({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          area: Number(formData.area),
        });
        toast.success('Succès', 'Nouvelle ferme créée');
      }
      setIsModalOpen(false);
      await loadFarms();
    } catch (err: any) {
      toast.error('Échec', err?.response?.data?.message || err?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (farm: Farm) => {
    const ok = await confirm.ask({
      title: 'Supprimer la ferme ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la ferme "${farm.name}" ?`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await farmService.deleteFarm(farm.id);
      toast.success('Succès', 'Ferme supprimée');
      await loadFarms();
    } catch (err: any) {
      toast.error('Erreur', 'Impossible de supprimer la ferme');
    }
  };

  // KPI Calculations
  const totalCapacity = useMemo(
    () => farms.reduce((sum, f) => sum + (f.capacity || f.area || 0), 0),
    [farms]
  );
  const totalPoulaillers = useMemo(
    () => farms.reduce((sum, f) => sum + (f.poulaillerCount || f.poulaillersCount || 0), 0),
    [farms]
  );

  const filteredFarms = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return farms;
    return farms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.location && f.location.toLowerCase().includes(q)) ||
        (f.address && f.address.toLowerCase().includes(q))
    );
  }, [farms, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-text dark:text-white">Fermes & Sites d'Exploitation</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Gestion des sites géographiques, des capacités et des bâtiments</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadFarms}
          disabled={loading}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-slate-700">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-brand-text dark:hover:text-white border border-gray-100 dark:border-slate-800'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.key === 'farms' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    isActive ? 'bg-white dark:bg-slate-900/20 text-white' : 'bg-gray-100 text-gray-700 dark:text-slate-200'
                  }`}
                >
                  {farms.length}
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase">Fermes enregistrées</span>
              <p className="text-3xl font-bold text-brand-text dark:text-white mt-2">{farms.length}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Sites d'exploitation actifs</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase">Bâtiments totaux</span>
              <p className="text-3xl font-bold text-brand-blue mt-2">{totalPoulaillers}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Poulaillers rattachés</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase">Superficie / Capacité</span>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{totalCapacity.toLocaleString()} m²</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Superficie totale aménagée</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase">Disponibilité</span>
              <p className="text-3xl font-bold text-purple-700 mt-2">100%</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Opérationnelles</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Sites d'Exploitation Récents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((f) => (
                <div key={f.id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand-text dark:text-white text-sm">{f.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{f.address || f.location || 'Localisation non précisée'}</p>
                  </div>
                  <button
                    onClick={() => openFarmDetails(f)}
                    className="p-2 text-brand-green hover:bg-white dark:bg-slate-900 rounded-lg transition-all"
                    title="Voir les détails"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LISTE DES FERMES                                       */}
      {/* ============================================================ */}
      {currentTab === 'farms' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-text dark:text-white">Liste des Fermes</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{filteredFarms.length} ferme(s) répertoriée(s)</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <Plus size={18} />
              <span>Nouvelle ferme</span>
            </button>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une ferme par nom, adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            />
          </div>

          {filteredFarms.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-slate-400 py-8">Aucune ferme trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-text dark:text-white text-base">{farm.name}</h3>
                          <p className="text-xs text-gray-400 font-mono">ID #{farm.id}</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Actif
                      </span>
                    </div>

                    <div className="space-y-2 text-sm my-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                        <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{farm.address || farm.location || 'Non renseigné'}</span>
                      </div>
                      {farm.contactPhone && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                          <Phone size={15} className="text-gray-400 flex-shrink-0" />
                          <span>{farm.contactPhone}</span>
                        </div>
                      )}
                      {farm.email && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                          <Mail size={15} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{farm.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => openFarmDetails(farm)}
                      className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span>Bâtiments & Lots</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(farm)}
                        className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(farm)}
                        className="p-1.5 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CAPACITÉS & BÂTIMENTS                                  */}
      {/* ============================================================ */}
      {currentTab === 'capacites' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-brand-text dark:text-white">Capacités d'Hébergement par Site</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Superficies et répartition des installations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                  <th className="py-3 px-4">Ferme</th>
                  <th className="py-3 px-4">Localisation</th>
                  <th className="py-3 px-4">Superficie / Capacité</th>
                  <th className="py-3 px-4">Bâtiments rattachés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {farms.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-text dark:text-white">{f.name}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-600 dark:text-slate-300">{f.address || f.location || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {(f.area || f.capacity || 0).toLocaleString()} m²
                    </td>
                    <td className="py-3.5 px-4 text-sm font-bold text-brand-blue">
                      {f.poulaillerCount || f.poulaillersCount || 0} poulailler(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CRÉATION / MODIFICATION DE FERME                     */}
      {/* ============================================================ */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? `Modifier la ferme "${editingFarm.name}"` : 'Nouvelle ferme'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="farm-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 shadow-md"
            >
              {submitting ? 'Enregistrement...' : editingFarm ? 'Mettre à jour' : 'Créer la ferme'}
            </button>
          </div>
        }
      >
        <form id="farm-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1">
              Nom de la ferme <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ferme Principale DABA"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1">Adresse / Localisation</label>
            <input
              type="text"
              placeholder="Ex: Route de Bingerville, Abidjan"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1">Téléphone</label>
              <input
                type="tel"
                placeholder="+225 07 00 00 00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1">Email</label>
              <input
                type="email"
                placeholder="ferme@daba.ci"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-1">Superficie / Capacité (m²)</label>
            <input
              type="number"
              min={0}
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 font-bold bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
            />
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: DÉTAILS D'UNE FERME (BÂTIMENTS & LOTS)               */}
      {/* ============================================================ */}
      <Modal
        open={viewingFarm !== null}
        onClose={() => setViewingFarm(null)}
        title={viewingFarm ? `Détails de la Ferme "${viewingFarm.name}"` : 'Ferme'}
        size="lg"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setViewingFarm(null)}
              className="px-5 py-2 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-slate-200"
            >
              Fermer
            </button>
          </div>
        }
      >
        {viewingFarm && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl grid grid-cols-3 gap-3 border border-gray-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase">Localisation</p>
                <p className="font-bold text-brand-text dark:text-white text-sm">{viewingFarm.address || viewingFarm.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase">Contact</p>
                <p className="font-bold text-brand-text dark:text-white text-sm">{viewingFarm.contactPhone || viewingFarm.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase">Superficie</p>
                <p className="font-bold text-emerald-700 text-sm">{(viewingFarm.area || viewingFarm.capacity || 0).toLocaleString()} m²</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-text dark:text-white text-sm mb-3">Poulaillers rattachés à ce site ({farmPoulaillers.length})</h4>
              {detailLoading ? (
                <p className="text-gray-400 text-sm py-4">Chargement des bâtiments...</p>
              ) : farmPoulaillers.length === 0 ? (
                <p className="text-gray-400 text-sm py-2">Aucun poulailler rattaché à cette ferme.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {farmPoulaillers.map((p) => (
                    <div key={p.id} className="p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                      <p className="font-bold text-brand-text dark:text-white text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Capacité : {p.capacity.toLocaleString()} places</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FarmsPage;
