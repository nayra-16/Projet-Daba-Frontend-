import React from 'react';
import { ShoppingCart, RefreshCw, Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FourCommandes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">Commandes fournisseurs & Achats</h2>
            <p className="text-gray-500 text-sm">Suivi centralisé des approvisionnements</p>
          </div>
          <button
            type="button"
            disabled
            className="bg-gray-100 text-gray-400 px-5 py-3 rounded-xl font-bold cursor-not-allowed text-sm"
          >
            <RefreshCw size={16} className="inline mr-1" />
            Module en préparation
          </button>
        </div>

        <div className="bg-brand-green/5 border-l-4 border-brand-green rounded-xl p-6 text-sm text-brand-text">
          <div className="flex items-start gap-4">
            <ShoppingCart className="text-brand-green flex-shrink-0" size={32} />
            <div className="space-y-2">
              <p className="font-bold text-base">Module Commandes Fournisseurs en attente de l'API dédiée</p>
              <p className="text-gray-600">
                Cet écran sera opérationnel dès que le backend exposera les endpoints{' '}
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-xs">
                  /api/supplier-orders
                </code>
                .
              </p>
              <p className="text-gray-600">
                En attendant, la saisie et le suivi des approvisionnements s'effectuent directement
                via la gestion des <strong>Matières Premières</strong> et les <strong>Entrées de Stock</strong>.
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/stock/raw-materials"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:underline"
                >
                  <span>Accéder aux Matières Premières</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400 py-6 justify-center">
          <Inbox size={18} />
          <span>Aucune commande d'achat enregistrée</span>
        </div>
      </div>
    </div>
  );
};

export default FourCommandes;
