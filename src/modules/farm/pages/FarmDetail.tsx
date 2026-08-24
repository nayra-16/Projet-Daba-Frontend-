import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Farm } from '../types';
import { farmService } from '../services/farmService';
import type { LotDTO, PoulaillerDTO } from '../../../core/types/api';
import {
  MapPin,
  Phone,
  User,
  TrendingUp,
  ArrowLeft,
  Users,
  Package,
  Activity,
  Home,
  Layers,
  Building2,
  Mail,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useToast, useConfirm } from '../../../core/ui/Feedback';

interface EditFarmFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  area: number;
}

const FarmDetail: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [poulaillers, setPoulaillers] = useState<PoulaillerDTO[]>([]);
  const [lots, setLots] = useState<LotDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<EditFarmFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    area: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    setError(null);
    try {
      const [farmData, poulaillersData, lotsData] = await Promise.all([
        farmService.getFarmById(farmId),
        farmService.getPoulaillersByFarmId(farmId),
        farmService.getLotsByFarmId(farmId),
      ]);

      if (!farmData) {
        setError('Ferme non trouvée');
      } else {
        setFarm(farmData);
        setPoulaillers(poulaillersData);
        setLots(lotsData);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors du chargement des données';
      setError(msg);
      toast.error('Erreur', msg);
    } finally {
      setLoading(false);
    }
  }, [farmId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Total birds count in the farm
  const totalBirds = lots.reduce((acc, l) => acc + (Number(l.quantity) || Number(l.effectif) || 0), 0);
  // Total capacity of all poulaillers
  const totalCapacity = poulaillers.reduce((acc, p) => acc + (Number(p.capacity) || 0), 0);

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!farm) return;
    setFormData({
      name: farm.name || '',
      address: farm.address || farm.location || '',
      phone: farm.phone || farm.contactPhone || '',
      email: farm.email || '',
      area: farm.area || 0,
    });
    setIsEditOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;
    if (!formData.name.trim()) {
      toast.error('Validation', 'Le nom de la ferme est obligatoire');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await farmService.updateFarm(farm.id, {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
      setFarm(updated);
      setIsEditOpen(false);
      toast.success('Succès', 'Informations de la ferme mises à jour');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour';
      toast.error('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Farm
  const handleDeleteFarm = async () => {
    if (!farm) return;
    const ok = await confirm({
      title: 'Supprimer cette ferme ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la ferme "${farm.name}" ? Toutes les données associées seront impactées.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      danger: true,
    });

    if (!ok) return;

    try {
      await farmService.deleteFarm(farm.id);
      toast.success('Succès', 'Ferme supprimée avec succès');
      navigate('/admin/farms');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Impossible de supprimer la ferme';
      toast.error('Erreur', msg);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8 max-w-6xl mx-auto">
            <div className="h-6 bg-gray-200 rounded w-36"></div>
            <div className="h-12 bg-gray-200 rounded-2xl w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 h-36"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!farm || error) {
    return (
      <div className="bg-white dark:bg-slate-900 min-h-screen py-24">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-brand-blue mb-2">Ferme non trouvée</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            La ferme demandée n'existe pas ou a été supprimée du système.
          </p>
          <Link
            to="/admin/farms"
            className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md"
          >
            <ArrowLeft size={18} />
            <span>Retour à la liste des fermes</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-brand-green to-emerald-700 py-16 text-white shadow-lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/admin/farms"
              className="inline-flex items-center gap-2 text-emerald-100 hover:text-white bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 px-4 py-2 rounded-xl backdrop-blur-sm transition-all font-semibold text-sm"
            >
              <ArrowLeft size={16} />
              <span>Retour aux fermes</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-xl bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw size={18} />
              </button>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Pencil size={16} />
                <span>Modifier</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteFarm}
                className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-900/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
              <Building2 size={36} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{farm.name}</h1>
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                <MapPin size={14} />
                <span>{farm.address || farm.location || 'Localisation non renseignée'}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 -mt-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center flex-shrink-0">
                <Home size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Poulaillers</p>
                <p className="text-2xl font-black text-brand-text dark:text-white mt-0.5">{poulaillers.length}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Capacité: {totalCapacity.toLocaleString('fr-FR')} places</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Package size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Lots d'élevage</p>
                <p className="text-2xl font-black text-brand-text dark:text-white mt-0.5">{lots.length}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">En cours sur ce site</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Volailles Totales</p>
                <p className="text-2xl font-black text-brand-green mt-0.5">{totalBirds.toLocaleString('fr-FR')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Effectif cumulé en production</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl space-y-10">
          {/* Farm Information Box */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-brand-blue mb-6 flex items-center gap-2">
              <Building2 className="text-brand-green" size={22} />
              <span>Informations d'exploitation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <MapPin size={16} className="text-brand-green" />
                  <span>Adresse</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{farm.address || farm.location || '—'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <Phone size={16} className="text-brand-green" />
                  <span>Téléphone</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{farm.phone || farm.contactPhone || '—'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <Mail size={16} className="text-brand-green" />
                  <span>Email</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{farm.email || '—'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <ShieldCheck size={16} className="text-brand-green" />
                  <span>Statut</span>
                </div>
                <p className="font-semibold text-emerald-700 text-sm">Site opérationnel</p>
              </div>
            </div>
          </div>

          {/* Section Poulaillers */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-blue flex items-center gap-2">
                <Home className="text-brand-green" size={22} />
                <span>Poulaillers du site ({poulaillers.length})</span>
              </h2>
              <Link
                to="/admin/elevage/poulaillers"
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
              >
                <span>Gérer les poulaillers</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {poulaillers.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">Aucun poulailler rattaché à cette ferme pour le moment.</p>
                <Link
                  to="/admin/elevage/poulaillers"
                  className="inline-flex items-center gap-1.5 text-xs bg-brand-green text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Ajouter un poulailler</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {poulaillers.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-brand-blue">{p.name}</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        {p.capacity ? `${p.capacity} places` : 'Capacité N/A'}
                      </span>
                    </div>
                    {p.description && <p className="text-xs text-gray-500 dark:text-slate-400">{p.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Lots */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-blue flex items-center gap-2">
                <Layers className="text-brand-green" size={22} />
                <span>Lots en élevage ({lots.length})</span>
              </h2>
              <Link
                to="/admin/elevage/lots"
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
              >
                <span>Gérer les lots</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {lots.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">Aucun lot actuellement assigné à cette ferme.</p>
                <Link
                  to="/admin/elevage/lots"
                  className="inline-flex items-center gap-1.5 text-xs bg-brand-green text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Créer un lot</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.map((l) => (
                  <div
                    key={l.id}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-brand-blue">{l.name}</h3>
                        <span className="text-xs font-bold text-brand-green bg-green-50 px-2 py-0.5 rounded-md">
                          {l.status || 'En élevage'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold">Effectif:</span> {l.quantity || l.effectif || 0} sujets
                      </p>
                      {l.race && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                          <span className="font-semibold">Race:</span> {l.race}
                        </p>
                      )}
                      {(l.arrivalDate || l.startDate) && (
                        <p className="text-xs text-gray-400">
                          Date: {l.arrivalDate || l.startDate}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                      <Link
                        to={`/admin/elevage/lots/${l.id}`}
                        className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                      >
                        <span>Détails du lot</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Edit Farm Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="px-6 py-5 bg-gradient-to-r from-brand-green to-emerald-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-white" />
                  <h3 className="text-lg font-bold text-white">Modifier la ferme</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white dark:bg-slate-900/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Nom de la ferme *
                  </label>
                  <input
                    type="text"
                    required
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
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
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
                      <span>Enregistrer</span>
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

export default FarmDetail;
