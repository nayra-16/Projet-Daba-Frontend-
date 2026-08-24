// @ts-nocheck
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Scissors,
  Layers,
  Package,
  ShieldCheck,
  History,
  Activity,
  CheckCircle2,
  Factory
} from 'lucide-react';

import { ProductionPlanPage } from './ProductionPlanPage';
import { ProductionDashboardPage } from './ProductionDashboardPage';
import { ReceivedLotsPage } from './ReceivedLotsPage';
import { AbattagePage } from './AbattagePage';
import { DecoupePage } from './DecoupePage';
import { TransformationPage } from './TransformationPage';
import { ConditionnementPage } from './ConditionnementPage';
import { ControleQualitePage } from './ControleQualitePage';
import { ProduitsFabriquesPage } from './ProduitsFabriquesPage';
import { ProductionHistoriquePage } from './ProductionHistoriquePage';

type TabKey =
  | 'overview'
  | 'planification'
  | 'lots-recus'
  | 'abattage'
  | 'decoupe'
  | 'transformation'
  | 'conditionnement'
  | 'controle'
  | 'produits'
  | 'historique';

interface TabItem {
  key: TabKey;
  label: string;
  icon: any;
}

const TABS: TabItem[] = [
  { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: 'planification', label: 'Planification', icon: Factory },
  { key: 'lots-recus', label: 'Lots reçus', icon: Inbox },
  { key: 'abattage', label: 'Abattage', icon: Activity },
  { key: 'decoupe', label: 'Découpe', icon: Scissors },
  { key: 'transformation', label: 'Transformation', icon: Layers },
  { key: 'conditionnement', label: 'Conditionnement', icon: Package },
  { key: 'controle', label: 'Contrôle qualité', icon: ShieldCheck },
  { key: 'produits', label: 'Produits fabriqués', icon: CheckCircle2 },
  { key: 'historique', label: 'Historique', icon: History },
];

import { useAuth } from '../../../core/context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProductionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TabKey) || 'overview';
  
  const { hasPermission, hasRole } = useAuth();
  const canReadProduction = hasPermission(['PRODUCTION_READ']);
  
  // Rôles transverses (ont accès à tout)
  const isGlobalAccess = hasRole(['ADMIN', 'RESPONSABLE_PRODUCTION']);

  // Droits spécifiques par onglet
  const canAccessAbattage = isGlobalAccess || hasRole(['RESPONSABLE_ABATTAGE']);
  const canAccessDecoupe = isGlobalAccess || hasRole(['RESPONSABLE_DECOUPE']);
  const canAccessTransformation = isGlobalAccess || hasRole(['RESPONSABLE_TRANSFORMATION']);
  const canAccessConditionnement = isGlobalAccess || hasRole(['RESPONSABLE_CONDITIONNEMENT']);
  const canAccessControleQualite = isGlobalAccess || hasRole(['RESPONSABLE_QUALITE']);

  // Pour simplifier : "Vue d'ensemble", "Lots reçus", "Produits fabriqués", "Historique" 
  // sont transverses, on les restreint à isGlobalAccess selon la matrice demandée.
  // Matrice demandée : Les responsables spécialisés ne voient QUE leur section.
  const canAccessGlobalTabs = isGlobalAccess;

  // Filtrer les onglets dynamiquement
  const authorizedTabs = TABS.filter(tab => {
    switch (tab.key) {
      case 'overview':
      case 'planification':
      case 'lots-recus':
      case 'produits':
      case 'historique':
        return canAccessGlobalTabs;
      case 'abattage':
        return canAccessAbattage;
      case 'decoupe':
        return canAccessDecoupe;
      case 'transformation':
        return canAccessTransformation;
      case 'conditionnement':
        return canAccessConditionnement;
      case 'controle':
        return canAccessControleQualite;
      default:
        return false;
    }
  });

  // If somehow reached without read permission, show nothing.
  if (!canReadProduction) {
    return <Navigate to="/admin" replace />;
  }
  
  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const renderTabContent = () => {
    // Vérification de sécurité stricte au moment du rendu
    switch (currentTab) {
      case 'overview': return canAccessGlobalTabs ? <ProductionDashboardPage /> : <AccessDenied />;
      case 'planification': return canAccessGlobalTabs ? <ProductionPlanPage /> : <AccessDenied />;
      case 'lots-recus': return canAccessGlobalTabs ? <ReceivedLotsPage /> : <AccessDenied />;
      case 'abattage': return canAccessAbattage ? <AbattagePage /> : <AccessDenied />;
      case 'decoupe': return canAccessDecoupe ? <DecoupePage /> : <AccessDenied />;
      case 'transformation': return canAccessTransformation ? <TransformationPage /> : <AccessDenied />;
      case 'conditionnement': return canAccessConditionnement ? <ConditionnementPage /> : <AccessDenied />;
      case 'controle': return canAccessControleQualite ? <ControleQualitePage /> : <AccessDenied />;
      case 'produits': return canAccessGlobalTabs ? <ProduitsFabriquesPage /> : <AccessDenied />;
      case 'historique': return canAccessGlobalTabs ? <ProductionHistoriquePage /> : <AccessDenied />;
      default: return <AccessDenied />;
    }
  };

  // Si l'utilisateur arrive sur une URL sans "tab", ou si son tab par défaut ('overview') n'est pas autorisé :
  React.useEffect(() => {
    if (authorizedTabs.length > 0 && !authorizedTabs.find(t => t.key === currentTab)) {
      setSearchParams({ tab: authorizedTabs[0].key });
    }
  }, [currentTab, authorizedTabs, setSearchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
            <Factory size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Production & Transformation</h1>
            <p className="text-slate-400 text-sm">
              Workflow industriel : Abattage, Découpe, Transformation, Conditionnement & Contrôle Qualité
            </p>
          </div>
        </div>
      </div>

      {/* Internal Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-700">
        {authorizedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#42B649] text-white shadow-md'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Render */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800">
    <ShieldCheck size={48} className="text-red-500 mb-4" />
    <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
    <p className="text-slate-400 text-center">Vous n'avez pas les droits nécessaires pour accéder à cette section du module Production.</p>
  </div>
);

export default ProductionPage;
