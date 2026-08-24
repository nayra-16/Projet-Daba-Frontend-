import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, ShoppingCart, LayoutGrid, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FourAnnuaire from '../fournisseurs/FourAnnuaire';
import FourCommandes from '../fournisseurs/FourCommandes';
import FournisseursOverview from '../fournisseurs/FournisseursOverview';

interface FournisseursPageProps {
  defaultTab?: 'annuaire' | 'commandes' | 'overview';
}

export const FournisseursPage: React.FC<FournisseursPageProps> = ({ defaultTab = 'annuaire' }) => {
  const [activeTab, setActiveTab] = useState<'annuaire' | 'commandes' | 'overview'>(defaultTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
                <Truck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-brand-blue tracking-tight">Fournisseurs & Achats</h1>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Lecture seule (Stock)
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">
                  Annuaire des fournisseurs identifiés et suivi des approvisionnements en matières premières
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/admin/stock/raw-materials"
            className="inline-flex items-center gap-2 bg-brand-green text-white font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:opacity-90 transition-opacity text-sm self-start md:self-auto"
          >
            <span>Gérer les Matières Premières</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Informative Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-blue-900">
          <Info size={20} className="text-brand-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Information sur le périmètre Achats & Fournisseurs :</p>
            <p className="text-blue-800 text-xs mt-0.5">
              Les fournisseurs affichés sont extraits en temps réel des enregistrements de <strong>Matières Premières</strong> du module Stock. 
              Le module complet de gestion des contrats et des commandes d'achat (<code>/api/supplier-orders</code>) sera activé lors de la mise à disposition des endpoints backend dédiés.
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 border-b border-gray-100 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('annuaire')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'annuaire'
                ? 'border-brand-green text-brand-green bg-green-50/50'
                : 'border-transparent text-gray-500 hover:text-brand-blue hover:bg-gray-50'
            }`}
          >
            <Truck size={18} />
            <span>Annuaire Fournisseurs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commandes')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'commandes'
                ? 'border-brand-green text-brand-green bg-green-50/50'
                : 'border-transparent text-gray-500 hover:text-brand-blue hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={18} />
            <span>Commandes d'Achat</span>
            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">À venir</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-green text-brand-green bg-green-50/50'
                : 'border-transparent text-gray-500 hover:text-brand-blue hover:bg-gray-50'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Vue d'ensemble</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'annuaire' && <FourAnnuaire />}
        {activeTab === 'commandes' && <FourCommandes />}
        {activeTab === 'overview' && <FournisseursOverview />}
      </motion.div>
    </div>
  );
};

export default FournisseursPage;
