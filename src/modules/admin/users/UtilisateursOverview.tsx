import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, UserCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { userService } from '../../../core/services/userService';
import { useToast } from '../../../core/ui/Feedback';
import type { UserResponse } from '../../../core/types/api';

const ROLES = ['ADMIN', 'DIRECTEUR', 'RESPONSABLE_STOCK', 'RESPONSABLE_ELEVAGE', 'RESPONSABLE_PRODUCTION', 'USER'];

export const UtilisateursOverview: React.FC = () => {
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

  const actifs = users.filter((u) => u.enabled).length;
  const desactives = users.filter((u) => !u.enabled).length;

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const u of users) c[u.role] = (c[u.role] || 0) + 1;
    return c;
  }, [users]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Vue d'ensemble des Utilisateurs</h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-[#42B649] font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Utilisateurs" value={users.length} icon={Users} color="blue" />
          <StatsCard label="Comptes actifs" value={actifs} icon={UserCheck} color="green" />
          <StatsCard label="Comptes désactivés" value={desactives} icon={Shield} color="orange" />
          <StatsCard
            label="Rôles utilisés"
            value={Object.values(counts).filter((v) => v > 0).length}
            icon={CheckCircle2}
            color="green"
          />
        </div>
      </section>

      <section className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Répartition par rôle</h2>
        {loading ? (
          <p className="text-center text-slate-500 py-4">Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((r, i) => {
              const count = counts[r] || 0;
              return (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-200 text-sm">{r}</p>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg font-bold text-lg">
                    {count}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UtilisateursOverview;
