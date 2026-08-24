import React, { useEffect, useState, useCallback } from 'react';
import { elevageService } from '../services/elevageService';
import { HealthEvent, HealthEventType, Lot } from '../types';
import { Plus, Edit, Trash2, RefreshCw, Syringe, Filter } from 'lucide-react';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const SantePage: React.FC = () => {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    vaccinationDate: new Date().toISOString().split('T')[0],
    lotId: '',
    description: '',
  });

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData, lotsData] = await Promise.all([
        selectedLotId === 'ALL' ? elevageService.getHealthEvents() : elevageService.getHealthEvents(selectedLotId),
        elevageService.getLots(),
      ]);
      setEvents(eventsData);
      setLots(lotsData);
    } catch {
      toast.error('Erreur', 'Impossible de charger les événements sanitaires');
    } finally {
      setLoading(false);
    }
  }, [selectedLotId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm({
      name: '',
      vaccinationDate: new Date().toISOString().split('T')[0],
      lotId: lots.length > 0 ? lots[0].id : '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (event: HealthEvent) => {
    setEditingEvent(event);
    setForm({
      name: event.product || '',
      vaccinationDate: event.date,
      lotId: event.lotId || (lots.length > 0 ? lots[0].id : ''),
      description: event.comment || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Validation', 'Le nom du vaccin/traitement est obligatoire');
      return;
    }
    if (!form.lotId) {
      toast.error('Validation', 'Veuillez sélectionner un lot');
      return;
    }
    setSubmitting(true);
    try {
      if (editingEvent) {
        await elevageService.updateHealthEvent(editingEvent.id, {
          name: form.name.trim(),
          vaccinationDate: form.vaccinationDate,
          lotId: form.lotId,
          description: form.description,
        });
        toast.success('Succès', 'Événement sanitaire mis à jour avec succès');
      } else {
        await elevageService.createHealthEvent({
          name: form.name.trim(),
          vaccinationDate: form.vaccinationDate,
          lotId: form.lotId,
          description: form.description,
        });
        toast.success('Succès', 'Nouvelle vaccination enregistrée avec succès');
      }
      setModalOpen(false);
      await loadData();
    } catch {
      toast.error('Échec', 'Impossible d\'enregistrer l\'événement sanitaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event: HealthEvent) => {
    const ok = await confirm.ask({
      title: 'Supprimer la vaccination',
      message: `Êtes-vous sûr de vouloir supprimer la vaccination "${event.product}" ?`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    try {
      const deleted = await elevageService.deleteHealthEvent(event.id);
      if (deleted) {
        toast.success('Succès', 'Vaccination supprimée');
        await loadData();
      } else {
        toast.error('Erreur', 'Impossible de supprimer cette vaccination');
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression sur le serveur');
    }
  };

  const getTypeColor = (type: HealthEventType) => {
    switch (type) {
      case HealthEventType.VACCINATION:
        return 'bg-blue-100 text-brand-blue';
      case HealthEventType.TRAITEMENT:
        return 'bg-purple-100 text-purple-700';
      case HealthEventType.MALADIE:
        return 'bg-yellow-100 text-yellow-700';
      case HealthEventType.DECES:
        return 'bg-red-100 text-brand-red';
      case HealthEventType.CONTROLE_VETERINAIRE:
        return 'bg-green-100 text-brand-green';
      default:
        return 'bg-blue-100 text-brand-blue';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement du suivi sanitaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Suivi sanitaire & Vaccinations</h2>
          <p className="text-sm text-gray-500">{events.length} enregistrements sanitaires</p>
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
            Nouvelle vaccination
          </button>
        </div>
      </div>

      {/* Filter by lot */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4">
        <Filter size={18} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Filtrer par lot :</span>
        <select
          value={selectedLotId}
          onChange={(e) => setSelectedLotId(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-brand-green"
        >
          <option value="ALL">Tous les lots</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.lotNumber})
            </option>
          ))}
        </select>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <Syringe size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Aucun événement sanitaire</h3>
          <p className="text-gray-500 text-sm mb-4">Enregistrez vos protocoles de vaccination ou soins vétérinaires.</p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md text-sm"
          >
            Ajouter une vaccination
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const lot = lots.find((l) => String(l.id) === String(event.lotId));
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{event.date}</span>
                  </div>

                  <h3 className="font-bold text-brand-text text-base mb-1">{event.product || 'Traitement'}</h3>
                  <p className="text-xs font-semibold text-brand-blue mb-2">
                    {lot ? `Lot: ${lot.name} (${lot.lotNumber})` : `Lot ID: #${event.lotId}`}
                  </p>

                  {event.comment && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-2">
                      {event.comment}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">Responsable : {event.responsible}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
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
        title={editingEvent ? 'Modifier la vaccination' : 'Nouvelle vaccination / soin'}
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
              form="sante-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : editingEvent ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="sante-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nom du vaccin / Soin <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Vaccin Newcastle / Gumboro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                required
                value={form.vaccinationDate}
                onChange={(e) => setForm({ ...form, vaccinationDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Lot associé <span className="text-brand-red">*</span>
              </label>
              <select
                required
                value={form.lotId}
                onChange={(e) => setForm({ ...form, lotId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                <option value="">-- Sélectionner un lot --</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.lotNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Commentaires / Posologie</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="Observations..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
