import React, { useEffect, useState, useCallback } from 'react';
import { elevageService } from '../services/elevageService';
import { TimelineEvent, Lot } from '../types';
import { ElevageTimeline } from '../components/ElevageTimeline';
import { Plus, RefreshCw, Activity, Filter, Trash2 } from 'lucide-react';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const HistoriquePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    action: '',
    eventDate: new Date().toISOString().split('T')[0],
    details: '',
    lotId: '',
  });

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allEvents, lotsData] = await Promise.all([
        elevageService.getTimelineEvents(),
        elevageService.getLots(),
      ]);
      setLots(lotsData);
      if (selectedLotId === 'ALL') {
        setEvents(allEvents);
      } else {
        setEvents(allEvents.filter((e) => String(e.lotId) === String(selectedLotId)));
      }
    } catch {
      toast.error('Erreur', 'Impossible de charger l\'historique depuis le serveur');
    } finally {
      setLoading(false);
    }
  }, [selectedLotId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setForm({
      action: '',
      eventDate: new Date().toISOString().split('T')[0],
      details: '',
      lotId: lots.length > 0 ? lots[0].id : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.action.trim()) {
      toast.error('Validation', 'L\'action est obligatoire');
      return;
    }
    setSubmitting(true);
    try {
      await elevageService.createHistoryEvent({
        action: form.action.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        details: form.details,
        lotId: form.lotId || undefined,
      });
      toast.success('Succès', 'Événement consigné dans l\'historique backend');
      setModalOpen(false);
      await loadData();
    } catch {
      toast.error('Échec', 'Impossible d\'enregistrer l\'événement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const ok = await confirm.ask({
      title: 'Supprimer l\'événement',
      message: 'Êtes-vous sûr de vouloir supprimer cet événement de l\'historique ?',
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    try {
      const deleted = await elevageService.deleteHistoryEvent(eventId);
      if (deleted) {
        toast.success('Succès', 'Événement supprimé');
        await loadData();
      } else {
        toast.error('Erreur', 'Impossible de supprimer cet événement');
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression sur le serveur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement de l'historique complet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Historique des événements d'élevage</h2>
          <p className="text-sm text-gray-500">{events.length} événements consignés dans le journal d'audit</p>
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
            Ajouter un événement
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

      {/* Timeline Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Aucun événement enregistré</h3>
            <p className="text-gray-500 text-sm mb-4">L'historique des actions sur vos lots apparaîtra ici.</p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md text-sm"
            >
              Créer un premier événement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ElevageTimeline events={events} />
          </div>
        )}
      </div>

      {/* Modal Ajout Événement */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter un événement dans l'historique"
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
              form="history-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="history-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Action / Événement <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="ex: Nettoyage et désinfection du poulailler"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                required
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lot associé (optionnel)</label>
              <select
                value={form.lotId}
                onChange={(e) => setForm({ ...form, lotId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                <option value="">-- Général / Aucun lot --</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.lotNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Détails / Notes</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              placeholder="Détails complémentaires..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
