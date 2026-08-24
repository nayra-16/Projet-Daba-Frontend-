import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Farm } from '../types';
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
  X,
  Building2,
  Mail,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast, useConfirm } from '../../../core/ui/Feedback';

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

const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState<FarmFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const loadFarms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await farmService.getAllFarms();
      setFarms(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors du chargement des fermes';
      setError(msg);
      toast.error('Erreur', msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  // Filtered farms
  const filteredFarms = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return farms;
    return farms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.location && f.location.toLowerCase().includes(q)) ||
        (f.address && f.address.toLowerCase().includes(q)) ||
        (f.ownerName && f.ownerName.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        (f.contactPhone && f.contactPhone.includes(q))
    );
  }, [farms, searchTerm]);

  // Open modal for create
  const handleOpenCreate = () => {
    setEditingFarm(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      address: farm.address || farm.location || '',
      phone: farm.phone || farm.contactPhone || '',
      email: farm.email || '',
      area: farm.area || 0,
    });
    setIsModalOpen(true);
  };

  // Submit create or update
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
        });
        toast.success('Succès', `Ferme "${formData.name}" mise à jour avec succès`);
      } else {
        await farmService.createFarm({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        });
        toast.success('Succès', `Ferme "${formData.name}" créée avec succès`);
      }
      setIsModalOpen(false);
      await loadFarms();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Une erreur est survenue';
      toast.error('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete farm
  const handleDelete = async (farm: Farm) => {
    const ok = await confirm({
      title: 'Supprimer la ferme ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la ferme "${farm.name}" ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });

    if (!ok) return;

    try {
      await farmService.deleteFarm(farm.id);
      toast.success('Succès', `Ferme "${farm.name}" supprimée`);
      await loadFarms();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Impossible de supprimer la ferme';
      toast.error('Erreur', msg);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-brand-green to-emerald-700 py-16 text-white shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight"
          >
            Gestion des Fermes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl max-w-2xl mx-auto text-emerald-50 leading-relaxed font-medium"
          >
            Gérez vos sites d'exploitation, vos poulaillers et vos lots d'élevage en temps réel.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une ferme (nom, adresse, téléphone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>

            {/* Actions: Refresh & Create */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={loadFarms}
                disabled={loading}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-brand-green transition-all shadow-sm flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                title="Actualiser la liste"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin text-brand-green' : ''} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="bg-brand-green hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                <span>Nouvelle Ferme</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-700">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                type="button"
                onClick={loadFarms}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg font-bold transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Skeleton loaders
              [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-100 dark:border-slate-800 p-8 animate-pulse space-y-4"
                >
                  <div className="h-7 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="space-y-2 py-2">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                  <div className="h-11 bg-gray-100 rounded-xl mt-4"></div>
                </div>
              ))
            ) : filteredFarms.length === 0 ? (
              // Empty State
              <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 p-8">
                <div className="w-16 h-16 bg-emerald-50 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                  {searchTerm ? 'Aucune ferme ne correspond à votre recherche' : 'Aucune ferme enregistrée'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  {searchTerm
                    ? `Aucun résultat pour "${searchTerm}". Essayez un autre terme de recherche.`
                    : 'Commencez par ajouter votre premier site d\'exploitation agricole pour démarrer.'}
                </p>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md"
                  >
                    <Plus size={18} />
                    <span>Créer une ferme</span>
                  </button>
                )}
              </div>
            ) : (
              // Farm Cards
              filteredFarms.map((farm, index) => (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 dark:border-slate-800 hover:border-brand-green/40 transition-all group flex flex-col justify-between"
                >
                  <div className="p-7">
                    {/* Header: Name + Edit/Delete quick buttons */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center font-black">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-brand-blue group-hover:text-brand-green transition-colors leading-snug">
                            {farm.name}
                          </h3>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Site actif
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(farm)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(farm)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="space-y-3 pt-2 border-t border-gray-50">
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-300">
                        <MapPin size={18} className="text-brand-green mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{farm.address || farm.location || 'Localisation non renseignée'}</span>
                      </div>

                      {farm.area ? (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                          <TrendingUp size={18} className="text-brand-green flex-shrink-0" />
                          <span>{farm.area} hectares</span>
                        </div>
                      ) : null}

                      {farm.email ? (
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                          <Mail size={18} className="text-brand-green flex-shrink-0" />
                          <span className="truncate">{farm.email}</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                        <Phone size={18} className="text-brand-green flex-shrink-0" />
                        <span>{farm.phone || farm.contactPhone || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer link to detail page */}
                  <div className="p-5 pt-0">
                    <Link
                      to={`/admin/farms/${farm.id}`}
                      className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-brand-green text-gray-700 dark:text-slate-200 hover:text-white py-3 px-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                    >
                      <span>Voir les détails</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Create / Edit Farm Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-brand-green to-emerald-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-900/10 rounded-xl backdrop-blur-md">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {editingFarm ? `Modifier "${editingFarm.name}"` : 'Créer une nouvelle ferme'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white dark:bg-slate-900/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Nom de la ferme *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ferme Principale Agoè"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Adresse / Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Route d'Atakpamé, Agoè-Nyivé, Lomé, Togo"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Téléphone de contact
                    </label>
                    <input
                      type="text"
                      placeholder="ex: +228 90 12 34 56"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      placeholder="ex: contact@daba-ferme.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold transition-all shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <span>{editingFarm ? 'Mettre à jour' : 'Créer la ferme'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmManagement;
