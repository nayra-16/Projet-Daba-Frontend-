import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw } from 'lucide-react';
import { userService } from '../../../core/services/userService';
import { useToast } from '../../../core/ui/Feedback';
import type { UserResponse } from '../../../core/types/api';

const ROLES = [
  { name: 'ADMIN', label: 'Administrateur', description: 'Accès complet à toutes les ressources du système' },
  { name: 'DIRECTEUR', label: 'Directeur', description: 'Supervision globale, rapports et consultation générale' },
  {
    name: 'RESPONSABLE_STOCK',
    label: 'Responsable Stock',
    description: 'Gestion des articles, entrées/sorties, inventaires et alertes',
  },
  {
    name: 'RESPONSABLE_ELEVAGE',
    label: 'Responsable Élevage',
    description: 'Gestion des lots, poulaillers, alimentation et vaccinations',
  },
  {
    name: 'RESPONSABLE_PRODUCTION',
    label: 'Responsable Production',
    description: 'Pilotage du workflow industriel (abattage, découpe, conditionnement)',
  },
  { name: 'USER', label: 'Utilisateur standard', description: 'Accès restreint en lecture seule' },
];

export const UsersRoles: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll(0, 500);
      setUsers(data.content || (data as any));
    } catch (e: any) {
      t.error('Erreur de chargement', e?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const u of users) {
      c[u.role] = (c[u.role] || 0) + 1;
    }
    return c;
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Rôles & Permissions</h2>
            <p className="text-slate-400 text-sm">
              Définition des rôles et profilage des autorisations RBAC dans DABA ERP
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((r, i) => {
            const count = counts[r.name] || 0;
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-slate-700 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 text-green-400 p-2.5 rounded-xl">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-lg">{r.label}</h3>
                      <p className="text-xs text-slate-500 font-mono">{r.name}</p>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-xs font-bold">
                    {count} utilisateur{count > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{r.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersRoles;
