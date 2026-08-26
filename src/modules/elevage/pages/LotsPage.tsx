import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { elevageService } from '../services/elevageService';
import { Lot, WorkflowStep, LotStatus, Poulailer } from '../types';
import { LotStatusBadge } from '../components/LotStatusBadge';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const LotsPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [poulailers, setPoulailers] = useState<Poulailer[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    chickCount: 1000,
    arrivalDate: new Date().toISOString().split('T')[0],
    poulailerId: '',
    status: LotStatus.EN_ELEVAGE,
  });

  const toast = useToast();
  const confirm = useConfirm();

  console.log('[LOTS] Composant rendu. loading =', loading);

  const loadData = useCallback(async () => {
    console.log('[LOTS] loadData START');
    setLoading(true);
    setError(null);
    try {
      console.log('[LOTS] Appel API...');
      const [lotsData, poulailersData, workflowData] = await Promise.all([
        elevageService.getLots(),
        elevageService.getPoulailers(),
        elevageService.getWorkflow(),
      ]);
      console.log('[LOTS] Réponse API reçue');
      console.log('[LOTS] Données reçues: lots=', lotsData, 'poulaillers=', poulailersData);
      console.log('[LOTS] setLots exécuté');
      setLots(lotsData);
      setPoulailers(poulailersData);
      setWorkflowSteps(workflowData);
    } catch (err) {
      console.error('[LOTS] ERREUR API:', err);
      setError("Une erreur est survenue lors de la récupération des données.");
      toast.error('Erreur', 'Impossible de charger les lots depuis le serveur');
    } finally {
      console.log('[LOTS] finally exécuté, appel de setLoading(false)');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[LOTS] useEffect déclenché');
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingLot(null);
    setForm({
      name: '',
      chickCount: 1000,
      arrivalDate: new Date().toISOString().split('T')[0],
      poulailerId: poulailers.length > 0 ? poulailers[0].id : '',
      status: LotStatus.ARRIVEE,
    });
    setModalOpen(true);
  };

  const openEditModal = (lot: Lot) => {
    setEditingLot(lot);
    setForm({
      name: lot.name,
      chickCount: lot.chickCount,
      arrivalDate: lot.arrivalDate,
      poulailerId: lot.poulailerId || (poulailers.length > 0 ? poulailers[0].id : ''),
      status: lot.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Validation', 'Le nom du lot est obligatoire');
      return;
    }
    if (form.chickCount <= 0) {
      toast.error('Validation', 'La quantité doit être supérieure à 0');
      return;
    }
    setSubmitting(true);
    try {
      if (editingLot) {
        await elevageService.updateLot(editingLot.id, {
          name: form.name.trim(),
          chickCount: Number(form.chickCount),
          arrivalDate: form.arrivalDate,
          poulailerId: form.poulailerId || undefined,
          status: form.status,
        });
        toast.success('Succès', 'Lot mis à jour avec succès sur le serveur');
      } else {
        await elevageService.createLot({
          name: form.name.trim(),
          chickCount: Number(form.chickCount),
          arrivalDate: form.arrivalDate,
          poulailerId: form.poulailerId || undefined,
          status: form.status,
        });
        toast.success('Succès', 'Nouveau lot créé avec succès sur le backend');
      }
      setModalOpen(false);
      await loadData();
    } catch {
      toast.error('Échec', 'Impossible d\'enregistrer le lot sur le serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lot: Lot) => {
    const ok = await confirm.ask({
      title: 'Supprimer le lot',
      message: `Êtes-vous sûr de vouloir supprimer le lot ${lot.name} (#${lot.lotNumber}) ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });

    if (!ok) return;

    try {
      const deleted = await elevageService.deleteLot(lot.id);
      if (deleted) {
        toast.success('Succès', 'Lot supprimé avec succès');
        await loadData();
      } else {
        toast.error('Erreur', 'Impossible de supprimer ce lot');
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression sur le serveur');
    }
  };

  const getLotProgress = (lot: Lot) => {
    const currentIndex = workflowSteps.findIndex((step) => step.id === lot.status);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / workflowSteps.length) * 100);
  };

  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      lot.name.toLowerCase().includes(search.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
      lot.breed.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des lots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-brand-red font-bold text-lg">Impossible de charger les lots</p>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalSujets = lots.reduce((acc, lot) => acc + (lot.chickCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Gestion des lots d'élevage</h2>
          <p className="text-sm text-gray-500">
            {lots.length === 0 
              ? "Aucun lot enregistré" 
              : `${totalSujets.toLocaleString()} sujet(s) réparti(s) sur ${lots.length} lot(s)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Rafraîchir"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openCreateModal}
            className="bg-brand-green text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md font-bold"
          >
            <Plus size={18} />
            Nouveau lot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un lot (nom, numéro, race)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-green"
          >
            <option value="ALL">Tous les statuts</option>
            {Object.values(LotStatus).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Arrivée</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Effectif</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Poulailler</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="text-base font-semibold text-gray-600 mb-2">Aucun lot d'élevage</p>
                      <p className="text-sm mb-6 max-w-md">Commencez par créer votre premier lot pour assurer le suivi de votre élevage.</p>
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-md font-bold text-sm"
                      >
                        <Plus size={18} />
                        Nouveau lot
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLots.map((lot) => {
                  const progress = getLotProgress(lot);
                  const poulailler = poulailers.find((p) => String(p.id) === String(lot.poulailerId));
                  return (
                    <tr key={lot.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">
                        {lot.lotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-bold">
                        {lot.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {lot.arrivalDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {lot.chickCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LotStatusBadge status={lot.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-44">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-green rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-bold min-w-[32px]">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {poulailler ? poulailler.name : lot.poulailerId ? `Poulailler #${lot.poulailerId}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/elevage/lots/${lot.id}`}
                            className="p-1.5 text-brand-blue hover:text-brand-green hover:bg-gray-100 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => openEditModal(lot)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(lot)}
                            className="p-1.5 text-brand-red hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création / Édition */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLot ? `Modifier le lot #${editingLot.lotNumber}` : "Nouveau lot d'élevage"}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="lot-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : editingLot ? 'Mettre à jour' : 'Créer le lot'}
            </button>
          </div>
        }
      >
        <form id="lot-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du lot <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Lot Poussins 2026-A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Effectif (quantité) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.chickCount}
                onChange={(e) => setForm({ ...form, chickCount: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date d'arrivée <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                required
                value={form.arrivalDate}
                onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Poulailler assigné</label>
              <select
                value={form.poulailerId}
                onChange={(e) => setForm({ ...form, poulailerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                <option value="">-- Aucun poulailler --</option>
                {poulailers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Capacité: {p.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LotStatus })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                {Object.values(LotStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
