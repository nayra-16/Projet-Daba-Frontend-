import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, ConfirmContainer } from './core/ui/Feedback';
import MainLayout from './core/layouts/MainLayout';
import { AdminLayout } from './core/layouts/AdminLayout';
import Home from './modules/home/pages/Home';
import About from './modules/about/pages/About';
import Products from './modules/products/pages/Products';
import Services from './modules/services/pages/Services';
import Contact from './modules/contact/pages/Contact';
import Cart from './modules/cart/pages/Cart';
import Checkout from './modules/cart/checkout/Checkout';
import Login from './modules/auth/pages/Login';
import Actualites from './modules/bonPlan/pages/Actualites';
import AppelsOffres from './modules/bonPlan/pages/AppelsOffres';

// === ADMIN MODULE PAGES (1 Module = 1 Page Principale) ===
import Dashboard from './modules/dashboard/pages/Dashboard';
import { FarmsPage } from './modules/farm/pages/FarmsPage';
import { ElevagePage } from './modules/elevage/pages/ElevagePage';
import { ProductionPage } from './modules/production/pages/ProductionPage';
import { StockPage } from './modules/stock/pages/StockPage';

import { AdministrationPage } from './modules/admin/pages/AdministrationPage';
import { PlaceholderPage } from './modules/admin/pages/PlaceholderPage';
import { FournisseursPage } from './modules/admin/pages/FournisseursPage';
import { ProfilePage } from './modules/admin/pages/ProfilePage';
import { SettingsPage } from './modules/admin/pages/SettingsPage';

import { ProtectedRoute } from './core/routes/ProtectedRoute';
import { UserRole } from './core/context/AuthContext';

// ============================================================
// Rôles regroupés par domaine, alignés avec les @PreAuthorize
// positionnés sur chaque endpoint du backend.
// ============================================================
const ROLE_STAFF: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTEUR',
  'RESPONSABLE_ELEVAGE',
  'RESPONSABLE_PRODUCTION',
  'RESPONSABLE_STOCK',
  'RESPONSABLE_COMMERCIAL',
  'RESPONSABLE_ACHATS',
  'RESPONSABLE_RH',
  'RESPONSABLE_FINANCES',
  'EMPLOYE',
  'RESPONSABLE_ABATTAGE',
  'RESPONSABLE_DECOUPE',
  'RESPONSABLE_TRANSFORMATION',
  'RESPONSABLE_CONDITIONNEMENT',
  'RESPONSABLE_QUALITE',
];

const ROLE_ADMIN_OR_DIRECTEUR: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR'];
const ROLE_ELEVAGE: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_ELEVAGE'];
const ROLE_PRODUCTION_OR_ELEVAGE: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTEUR',
  'RESPONSABLE_PRODUCTION',
  'RESPONSABLE_ELEVAGE',
  'RESPONSABLE_ABATTAGE',
  'RESPONSABLE_DECOUPE',
  'RESPONSABLE_TRANSFORMATION',
  'RESPONSABLE_CONDITIONNEMENT',
  'RESPONSABLE_QUALITE',
];
const ROLE_PRODUCTION: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'RESPONSABLE_PRODUCTION'];
const ROLE_STOCK: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_STOCK'];
const ROLE_ACHATS: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'DIRECTEUR', 'RESPONSABLE_ACHATS'];

function App() {
  return (
    <>
      <ToastContainer />
      <ConfirmContainer />
      <Routes>
        {/* Site public (MainLayout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="actualites" element={<Actualites />} />
          <Route path="appels-offres" element={<AppelsOffres />} />
        </Route>

        {/* Espace Admin ERP — 1 Module = 1 Page Principale */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <ProtectedRoute roles={ROLE_STAFF}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute roles={ROLE_STAFF}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 1. Module Ferme */}
          <Route
            path="farms"
            element={
              <ProtectedRoute roles={ROLE_ADMIN_OR_DIRECTEUR}>
                <FarmsPage />
              </ProtectedRoute>
            }
          />
          <Route path="ferme" element={<Navigate to="/admin/farms" replace />} />
          <Route
            path="farms/:farmId"
            element={
              <ProtectedRoute roles={ROLE_ADMIN_OR_DIRECTEUR}>
                <FarmsPage />
              </ProtectedRoute>
            }
          />

          {/* 2. Module Élevage */}
          <Route
            path="elevage"
            element={
              <ProtectedRoute roles={ROLE_ELEVAGE}>
                <ElevagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="elevage/*"
            element={
              <ProtectedRoute roles={ROLE_ELEVAGE}>
                <ElevagePage />
              </ProtectedRoute>
            }
          />

          {/* 3. Module Production */}
          <Route
            path="production"
            element={
              <ProtectedRoute roles={ROLE_PRODUCTION_OR_ELEVAGE} permissions={['PRODUCTION_READ']}>
                <ProductionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="production/*"
            element={
              <ProtectedRoute roles={ROLE_PRODUCTION_OR_ELEVAGE} permissions={['PRODUCTION_READ']}>
                <ProductionPage />
              </ProtectedRoute>
            }
          />

          {/* 4. Module Stock */}
          <Route
            path="stock"
            element={
              <ProtectedRoute roles={ROLE_STOCK}>
                <StockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock/*"
            element={
              <ProtectedRoute roles={ROLE_STOCK}>
                <StockPage />
              </ProtectedRoute>
            }
          />

          {/* 5. Module Achats */}
          <Route
            path="achats"
            element={
              <ProtectedRoute roles={ROLE_ACHATS}>
                <FournisseursPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="achats/*"
            element={
              <ProtectedRoute roles={ROLE_ACHATS}>
                <FournisseursPage />
              </ProtectedRoute>
            }
          />

          {/* 6. Module Administration */}
          <Route
            path="administration"
            element={
              <ProtectedRoute roles={ROLE_ADMIN_OR_DIRECTEUR}>
                <AdministrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="administration/*"
            element={
              <ProtectedRoute roles={ROLE_ADMIN_OR_DIRECTEUR}>
                <AdministrationPage />
              </ProtectedRoute>
            }
          />

          {/* Profile & Paramètres */}
          <Route
            path="profile"
            element={
              <ProtectedRoute roles={ROLE_STAFF}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute roles={ROLE_ADMIN_OR_DIRECTEUR}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <ProtectedRoute roles={ROLE_STAFF}>
                <PlaceholderPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirection des anciennes routes /preview vers /admin/dashboard */}
        <Route path="/preview/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
