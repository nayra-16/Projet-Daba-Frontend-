import React, { useEffect, useState, useCallback } from 'react';
import { Truck, CheckCircle2, RefreshCw, Box } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { stockService } from '../../../core/services/stockService';
import { useToast } from '../../../core/ui/Feedback';

const formatFCFA = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

export const FournisseursOverview: React.FC = () => {
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const t = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const materials = await stockService.getAllRawMaterials();
      const supplierNames = new Set<string>();
      let value = 0;
      for (const m of materials) {
        const sName = (m.supplier || m.supplierName)?.trim();
        if (sName) supplierNames.add(sName);
        value += (m.quantity || 0) * (m.unitPrice || 0);
      }
      setSuppliersCount(supplierNames.size);
      setTotalValue(value);
      setTotalProducts(materials.length);
    } catch (e: any) {
      t.error('Erreur de chargement', e?.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-blue">Vue d'ensemble des Approvisionnements</h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-brand-green font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            label="Fournisseurs identifiés"
            value={suppliersCount}
            icon={Truck}
            color="green"
          />
          <StatsCard
            label="Matières premières"
            value={totalProducts}
            icon={Box}
            color="blue"
          />
          <StatsCard
            label="Valeur des approvisionnements"
            value={formatFCFA(totalValue)}
            icon={CheckCircle2}
            color="green"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-brand-blue mb-4">Fonctionnement du module Achats</h2>
        <div className="bg-brand-green/5 border-l-4 border-brand-green rounded-xl p-4 text-sm text-brand-text">
          <p>
            L'annuaire des fournisseurs est synchronisé en temps réel avec les enregistrements
            de matières premières du stock. La gestion complète des contrats, commandes fournisseurs
            et grilles tarifaires sera intégrée dès la mise à disposition des endpoints backend dédiés.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Consultez l'onglet <strong>Annuaire Fournisseurs</strong> pour inspecter les fournisseurs
          et volumes actuels.
        </p>
      </section>
    </div>
  );
};

export default FournisseursOverview;
