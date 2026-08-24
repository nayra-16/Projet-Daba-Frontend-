import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Truck, RefreshCw } from 'lucide-react';
import { stockService } from '../../../core/services/stockService';
import { useToast } from '../../../core/ui/Feedback';

interface SupplierAgg {
  name: string;
  count: number;
  totalValue: number;
  totalQty: number;
  lastDelivery?: string;
  category?: string;
}

export const FourAnnuaire: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const t = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const materials = await stockService.getAllRawMaterials();
      const map = new Map<string, SupplierAgg>();
      for (const m of materials) {
        const name = (m.supplier || m.supplierName)?.trim();
        if (!name) continue;
        const existing: SupplierAgg = map.get(name) || {
          name,
          count: 0,
          totalValue: 0,
          totalQty: 0,
        };
        existing.count += 1;
        existing.totalValue += (m.quantity || 0) * (m.unitPrice || 0);
        existing.totalQty += m.quantity || 0;
        if (m.category && !existing.category) existing.category = m.category;
        if (m.lastUpdated && (!existing.lastDelivery || m.lastUpdated > existing.lastDelivery)) {
          existing.lastDelivery = m.lastUpdated;
        }
        map.set(name, existing);
      }
      setSuppliers(Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue));
    } catch (e: any) {
      t.error('Erreur de chargement', e?.message || 'Impossible de charger les fournisseurs');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const formatFCFA = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

  const filtered = useMemo(
    () => suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [suppliers, search]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">Annuaire fournisseurs</h2>
            <p className="text-gray-500 text-sm">
              {filtered.length} fournisseur(s) identifié(s) via les matières premières
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        <div className="mb-6 bg-brand-green/5 border-l-4 border-brand-green rounded-xl p-4 text-sm text-brand-text">
          <p className="font-bold">ℹ Données en lecture seule (synchronisées avec le Stock)</p>
          <p>
            Cet annuaire est consolidé à partir des fournisseurs renseignés dans les matières
            premières. La gestion des contrats et commandes d'achat dédiées sera ajoutée dès
            que le backend exposera les endpoints correspondants.
          </p>
        </div>

        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {suppliers.length === 0
              ? "Aucun fournisseur identifié. Renseignez le champ 'Fournisseur' lors de la création d'une matière première."
              : 'Aucun résultat pour cette recherche.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-green/10 text-brand-green p-2.5 rounded-xl">
                      <Truck size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-text">{s.name}</h3>
                      {s.category && (
                        <p className="text-xs text-gray-500">Catégorie : {s.category}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Produits livrés</p>
                    <p className="font-bold text-brand-blue">{s.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Volume total</p>
                    <p className="font-bold text-brand-green">
                      {s.totalQty.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Valeur cumulée : <span className="font-bold text-brand-text">{formatFCFA(s.totalValue)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FourAnnuaire;
