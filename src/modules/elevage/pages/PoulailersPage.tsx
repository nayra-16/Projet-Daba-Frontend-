import React, { useEffect, useState, useCallback } from 'react';
import { elevageService } from '../services/elevageService';
import { Poulailer, PoulailerStatus, Lot } from '../types';
import { Home, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const PoulailersPage: React.FC = () => {
  const [poulailers, setPoulailers] = useState<Poulailer[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoulailler, setEditingPoulailler] = useState<Poulailer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    capacity: 1000,
    description: '',
  });

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [poulailersData, lotsData] = await Promise.all([
        elevageService.getPoulailers(),
        elevageService.getLots(),
      ]);
      setPoulailers(poulailersData);
      setLots(lotsData);
    } catch {
      toast.error('Erreur', 'Impossible de charger les poulaillers depuis le serveur');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingPoulailler(null);
    setForm({
      name: '',
      capacity: 1000,
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Poulailer) => {
    setEditingPoulailler(p);
    setForm({
      name: p.name,
      capacity: p.capacity,
      description: p.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Validation', 'Le nom du poulailler est obligatoire');
      return;
    }
    if (form.capacity <= 0) {
      toast.error('Validation', 'La capacité doit être supérieure à 0');
      return;
    }
    setSubmitting(true);
    try {
      if (editingPoulailler) {
        await elevageService.updatePoulailler(editingPoulailler.id, {
          name: form.name.trim(),
          capacity: Number(form.capacity),
          description: form.description,
        });
        toast.success('Succès', 'Poulailler mis à jour avec succès');
      } else {
        await elevageService.createPoulailler({
          name: form.name.trim(),
          capacity: Number(form.capacity),
          description: form.description,
        });
        toast.success('Succès', 'Nouveau poulailler créé sur le serveur');
      }
      setModalOpen(false);
      await loadData();
    } catch {
      toast.error('Échec', 'Impossible d\'enregistrer le poulailler');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Poulailer) => {
    const ok = await confirm.ask({
      title: 'Supprimer le poulailler',
      message: `Êtes-vous sûr de vouloir supprimer le poulailler "${p.name}" ?`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    try {
      const deleted = await elevageService.deletePoulailler(p.id);
      if (deleted) {
        toast.success('Succès', 'Poulailler supprimé');
        await loadData();
      } else {
        toast.error('Erreur', 'Impossible de supprimer ce poulailler');
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression sur le serveur');
    }
  };

  const getStatusColor = (status: PoulailerStatus) => {
    switch (status) {
      case PoulailerStatus.ACTIF:
        return 'text-brand-green bg-green-100';
      case PoulailerStatus.EN_MAINTENANCE:
        return 'text-yellow-700 bg-yellow-100';
      case PoulailerStatus.INACTIF:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-brand-green bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des poulaillers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Gestion des poulaillers</h2>
          <p className="text-sm text-gray-500">{poulailers.length} bâtiments d'élevage répertoriés</p>
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
            className="bg-brand-green text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md font-bold text-sm"
          >
            <Plus size={18} />
            Nouveau poulailler
          </button>
        </div>
      </div>

      {poulailers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <Home size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Aucun poulailler trouvé</h3>
          <p className="text-gray-500 text-sm mb-4">Créez votre premier poulailler connecté au backend.</p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md text-sm"
          >
            Ajouter un poulailler
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poulailers.map((poulailer) => {
            const assignedLots = lots.filter((l) => String(l.poulailerId) === String(poulailer.id));
            const currentCount = assignedLots.reduce((sum, l) => sum + (l.chickCount || 0), 0);
            const capacityPercent =
              poulailer.capacity > 0 ? Math.min(100, Math.round((currentCount / poulailer.capacity) * 100)) : 0;

            return (
              <div key={poulailer.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                        <Home size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-text text-base">{poulailer.name}</h3>
                        <p className="text-xs text-gray-500">{poulailer.location}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(poulailer.status)}`}>
                      {poulailer.status}
                    </span>
                  </div>

                  {poulailer.description && (
                    <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {poulailer.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-500">Taux d'occupation</span>
                        <span className="text-brand-text font-bold">{capacityPercent}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-green rounded-full transition-all duration-700"
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-gray-500">Capacité max</p>
                        <p className="font-bold text-sm text-brand-text">{poulailer.capacity.toLocaleString()} têtes</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Occupé actuellement</p>
                        <p className="font-bold text-sm text-brand-text">{currentCount.toLocaleString()} volailles</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Lots hébergés ({assignedLots.length})</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">
                        {assignedLots.length > 0
                          ? assignedLots.map((l) => l.name).join(', ')
                          : 'Aucun lot dans ce poulailler'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(poulailer)}
                    className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(poulailer)}
                    className="p-1.5 text-brand-red hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création / Édition */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPoulailler ? `Modifier ${editingPoulailler.name}` : 'Nouveau poulailler'}
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
              form="poulailler-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : editingPoulailler ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        }
      >
        <form id="poulailler-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du poulailler <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Bâtiment A - Poussins"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Capacité maximale (volailles) <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description / Emplacement</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="Détails sur l'infrastructure..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
