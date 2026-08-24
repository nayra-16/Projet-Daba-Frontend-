import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, RefreshCw, Pencil, Trash2, Mail } from 'lucide-react';
import { userService } from '../../../core/services/userService';
import { useToast, useConfirm, Modal } from '../../../core/ui/Feedback';
import type { UserResponse, UserCreateRequest, UserUpdateRequest } from '../../../core/types/api';

const roleBadge: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: 'Admin', cls: 'bg-red-500/20 text-red-400' },
  DIRECTEUR: { label: 'Directeur', cls: 'bg-blue-500/20 text-blue-400' },
  RESPONSABLE_STOCK: { label: 'Stock', cls: 'bg-green-500/20 text-green-400' },
  RESPONSABLE_ELEVAGE: { label: 'Élevage', cls: 'bg-green-500/20 text-green-400' },
  RESPONSABLE_PRODUCTION: { label: 'Production', cls: 'bg-green-500/20 text-green-400' },
  USER: { label: 'Utilisateur', cls: 'bg-slate-800 text-slate-400' },
};

const emptyCreate: UserCreateRequest = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'USER',
  enabled: true,
};

export const UsersList: React.FC = () => {
  const [items, setItems] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<any>(emptyCreate);
  const [submitting, setSubmitting] = useState(false);
  const t = useToast();
  const c = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll(0, 200);
      setItems(data.content || (data as any));
    } catch (e: any) {
      t.error('Erreur de chargement', e?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q);
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
      }),
    [items, search, filterRole]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCreate);
    setModalOpen(true);
  };

  const openEdit = (u: UserResponse) => {
    setEditing(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      enabled: u.enabled,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.email?.trim()) {
      t.error('Validation', 'Nom, prénom et email sont obligatoires');
      return;
    }
    if (!editing && !form.password) {
      t.error('Validation', 'Le mot de passe est obligatoire pour la création');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const update: UserUpdateRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          enabled: form.enabled,
        };
        await userService.update(editing.id, update);
        t.success('Utilisateur mis à jour');
      } else {
        await userService.create(form);
        t.success('Utilisateur créé');
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      t.error('Échec', e?.response?.data?.message || e?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (u: UserResponse) => {
    const ok = await c.ask({
      title: 'Supprimer cet utilisateur ?',
      message: `Confirmez la suppression définitive de ${u.firstName} ${u.lastName}.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await userService.remove(u.id);
      t.success('Utilisateur supprimé');
      await load();
    } catch (e: any) {
      t.error('Suppression impossible', e?.response?.data?.message || e?.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Liste des utilisateurs</h2>
            <p className="text-slate-400 text-sm">
              {filtered.length} sur {items.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="bg-brand-green text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-md"
            >
              <Plus size={20} />
              Nouvel utilisateur
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
            />
          </div>
          <div className="relative">
            <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-12 pr-8 py-3 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green appearance-none"
            >
              <option value="all">Tous rôles</option>
              {Object.entries(roleBadge).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            {items.length === 0 ? 'Aucun utilisateur.' : 'Aucun résultat.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-700">
                  <th className="py-3 pr-4">Utilisateur</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Rôle</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {u.firstName?.[0] || ''}
                          {u.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">#{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-slate-400 flex items-center gap-1">
                      <Mail size={12} /> {u.email}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          roleBadge[u.role]?.cls ?? 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {roleBadge[u.role]?.label ?? u.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.enabled ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-white bg-brand-green hover:opacity-90 transition-colors shadow-md disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <form id="user-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Téléphone</label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              >
                <option value="USER">Utilisateur</option>
                <option value="RESPONSABLE_STOCK">Stock</option>
                <option value="RESPONSABLE_ELEVAGE">Élevage</option>
                <option value="RESPONSABLE_PRODUCTION">Production</option>
                <option value="DIRECTEUR">Directeur</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="w-4 h-4 text-brand-green rounded bg-slate-900 border-slate-700"
            />
            <span className="font-bold text-slate-300">Compte actif</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default UsersList;
