
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import FarmManagement from '../modules/farm/pages/FarmManagement';
import FarmDetail from '../modules/farm/pages/FarmDetail';
import { ElevageDashboard } from '../modules/elevage/pages/ElevageDashboard';
import { LotsPage } from '../modules/elevage/pages/LotsPage';
import { LotDetailPage as ElevageLotDetailPage } from '../modules/elevage/pages/LotDetailPage';
import { PoulailersPage } from '../modules/elevage/pages/PoulailersPage';
import { SantePage } from '../modules/elevage/pages/SantePage';
import { AlimentationPage } from '../modules/elevage/pages/AlimentationPage';
import { HistoriquePage } from '../modules/elevage/pages/HistoriquePage';
import { ProductionDashboardPage } from '../modules/production/pages/ProductionDashboardPage';
import { ReceivedLotsPage } from '../modules/production/pages/ReceivedLotsPage';
import { AbattagePage } from '../modules/production/pages/AbattagePage';
import { DecoupePage } from '../modules/production/pages/DecoupePage';
import { TransformationPage } from '../modules/production/pages/TransformationPage';
import { ConditionnementPage } from '../modules/production/pages/ConditionnementPage';
import { ControleQualitePage } from '../modules/production/pages/ControleQualitePage';
import { ProduitsFabriquesPage } from '../modules/production/pages/ProduitsFabriquesPage';
import { ProductionHistoriquePage } from '../modules/production/pages/ProductionHistoriquePage';
import { LotDetailPage as ProductionLotDetailPage } from '../modules/production/pages/LotDetailPage';
import { PlaceholderPage } from '../modules/admin/pages/PlaceholderPage';

export const AdminRoutes: React.FC = () => {
  return (
    <>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      {/* Farm routes */}
      <Route path="farms" element={<FarmManagement />} />
      <Route path="farms/:farmId" element={<FarmDetail />} />
      {/* Elevage routes */}
      <Route path="elevage/dashboard" element={<ElevageDashboard />} />
      <Route path="elevage/lots" element={<LotsPage />} />
      <Route path="elevage/lots/:id" element={<ElevageLotDetailPage />} />
      <Route path="elevage/poulaillers" element={<PoulailersPage />} />
      <Route path="elevage/sante" element={<SantePage />} />
      <Route path="elevage/alimentation" element={<AlimentationPage />} />
      <Route path="elevage/historique" element={<HistoriquePage />} />
      {/* Production routes */}
      <Route path="production/dashboard" element={<ProductionDashboardPage />} />
      <Route path="production/lots-recus" element={<ReceivedLotsPage />} />
      <Route path="production/abattage" element={<AbattagePage />} />
      <Route path="production/decoupe" element={<DecoupePage />} />
      <Route path="production/transformation" element={<TransformationPage />} />
      <Route path="production/conditionnement" element={<ConditionnementPage />} />
      <Route path="production/controle-qualite" element={<ControleQualitePage />} />
      <Route path="production/produits-fabriques" element={<ProduitsFabriquesPage />} />
      <Route path="production/historique" element={<ProductionHistoriquePage />} />
      <Route path="production/lots/:id" element={<ProductionLotDetailPage />} />
      <Route path="*" element={<PlaceholderPage />} />
    </>
  );
};
