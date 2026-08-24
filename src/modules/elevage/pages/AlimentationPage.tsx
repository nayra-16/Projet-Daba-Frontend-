import React, { useEffect, useState, useCallback } from 'react';
import { elevageService } from '../services/elevageService';
import { FeedRecord, Lot } from '../types';
import { Plus, Edit, Trash2, RefreshCw, UtensilsCrossed, Filter } from 'lucide-react';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';

export const AlimentationPage: React.FC = () => {
  const [records, setRecords] = useState<FeedRecord[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeedRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    feedDate: new Date().toISOString().split('T')[0],
    feedType: 'Aliment de croissance',
    quantity: 50,
    lotId: '',
  });

  const toast = useToast();
  const confirm = useConfirm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsData, lotsData] = await Promise.all([
        selectedLotId === 'ALL' ? elevageService.getFeedRecords() : elevageService.getFeedRecords(selectedLotId),
        elevageService.getLots(),
      ]);
      setRecords(recordsData);
      setLots(lotsData);
    } catch {
      toast.error('Erreur', 'Impossible de charger les enregistrements d\'alimentation');
    } finally {
      setLoading(false);
    }
  }, [selectedLotId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm({
      feedDate: new Date().toISOString().split('T')[0],
      feedType: 'Aliment de croissance',
      quantity: 50,
      lotId: lots.length > 0 ? lots[0].id : '',
    });
    setModalOpen(true);
  };

  const openEditModal = (r: FeedRecord) => {
    setEditingRecord(r);
    setForm({
      feedDate: r.date,
      feedType: r.feedType,
      quantity: r.quantity,
      lotId: r.lotId || (lots.length > 0 ? lots[0].id : ''),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lotId) {
      toast.error('Validation', 'Veuillez sélectionner un lot');
      return;
    }
    if (form.quantity <= 0) {
      toast.error('Validation', 'La quantité doit être supérieure à 0');
      return;
    }
    setSubmitting(true);
    try {
      if (editingRecord) {
        await elevageService.updateFeedRecord(editingRecord.id, {
          feedDate: form.feedDate,
          feedType: form.feedType,
          quantity: Number(form.quantity),
          lotId: form.lotId,
        });
        toast.success('Succès', 'Distribution d\'aliment mise à jour');
      } else {
        await elevageService.createFeedRecord({
          feedDate: form.feedDate,
          feedType: form.feedType,
          quantity: Number(form.quantity),
          lotId: form.lotId,
        });
        toast.success('Succès', 'Nouvelle distribution d\'aliment enregistrée');
      }
      setModalOpen(false);
      await loadData();
    } catch {
      toast.error('Échec', 'Impossible d\'enregistrer la distribution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: FeedRecord) => {
    const ok = await confirm.ask({
      title: 'Supprimer la distribution',
      message: `Êtes-vous sûr de vouloir supprimer cette distribution de ${record.quantity} kg (${record.feedType}) ?`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    try {
      const deleted = await elevageService.deleteFeedRecord(record.id);
      if (deleted) {
        toast.success('Succès', 'Distribution supprimée');
        await loadData();
      } else {
        toast.error('Erreur', 'Impossible de supprimer cette distribution');
      }
    } catch {
      toast.error('Erreur', 'Échec de la suppression sur le serveur');
    }
  };

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement du suivi alimentaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Suivi alimentaire</h2>
          <p className="text-sm text-gray-500">Consommation d'aliments et rations quotidiennes</p>
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
            Nouvelle distribution
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 font-medium mb-1">Total aliment distribué</p>
          <p className="text-2xl font-bold text-brand-text">{totalQuantity.toLocaleString()} kg</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 font-medium mb-1">Coût estimé total</p>
          <p className="text-2xl font-bold text-brand-text">{totalCost.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-500 font-medium mb-1">Nombre de distributions</p>
          <p className="text-2xl font-bold text-brand-text">{records.length}</p>
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type d'aliment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot concerné</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Coût (FCFA)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <UtensilsCrossed size={36} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-base font-semibold text-gray-600 mb-1">Aucune distribution enregistrée</p>
                    <p className="text-sm">Cliquez sur "Nouvelle distribution" pour ajouter un enregistrement alimentaire.</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const lot = lots.find((l) => String(l.id) === String(record.lotId));
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{record.feedType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-blue">
                        {lot ? `${lot.name} (${lot.lotNumber})` : `Lot #${record.lotId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{record.quantity} kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.cost.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.responsible}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record)}
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
        title={editingRecord ? 'Modifier la distribution' : 'Nouvelle distribution d\'aliment'}
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
              form="feed-page-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : editingRecord ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="feed-page-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Date <span className="text-brand-red">*</span>
              </label>
              <input
                type="date"
                required
                value={form.feedDate}
                onChange={(e) => setForm({ ...form, feedDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Quantité (kg) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type d'aliment</label>
              <select
                value={form.feedType}
                onChange={(e) => setForm({ ...form, feedType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green bg-white text-sm"
              >
                <option value="Aliment Démarrage">Aliment Démarrage</option>
                <option value="Aliment de croissance">Aliment de croissance</option>
                <option value="Aliment Finition">Aliment Finition</option>
                <option value="Aliment Ponte">Aliment Ponte</option>
                <option value="Aliment composé">Aliment composé</option>
              </select>
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
        </form>
      </Modal>
    </div>
  );
};
