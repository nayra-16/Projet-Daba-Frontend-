import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './core/layouts/MainLayout'
import { AdminLayout } from './core/layouts/AdminLayout'
import Home from './modules/home/pages/Home'
import About from './modules/about/pages/About'
import Products from './modules/products/pages/Products'
import Services from './modules/services/pages/Services'
import Contact from './modules/contact/pages/Contact'
import Cart from './modules/cart/pages/Cart'
import Checkout from './modules/cart/checkout/Checkout'
import Login from './modules/auth/pages/Login'
import Actualites from './modules/bonPlan/pages/Actualites'
import AppelsOffres from './modules/bonPlan/pages/AppelsOffres'
import Dashboard from './modules/dashboard/pages/Dashboard'
import FarmManagement from './modules/farm/pages/FarmManagement'
import FarmDetail from './modules/farm/pages/FarmDetail'
import { ElevageDashboard } from './modules/elevage/pages/ElevageDashboard'
import { LotsPage } from './modules/elevage/pages/LotsPage'
import { LotDetailPage as ElevageLotDetailPage } from './modules/elevage/pages/LotDetailPage'
import { PoulailersPage } from './modules/elevage/pages/PoulailersPage'
import { SantePage } from './modules/elevage/pages/SantePage'
import { AlimentationPage } from './modules/elevage/pages/AlimentationPage'
import { HistoriquePage } from './modules/elevage/pages/HistoriquePage'
import { ProductionDashboardPage } from './modules/production/pages/ProductionDashboardPage'
import { ReceivedLotsPage } from './modules/production/pages/ReceivedLotsPage'
import { AbattagePage } from './modules/production/pages/AbattagePage'
import { DecoupePage } from './modules/production/pages/DecoupePage'
import { TransformationPage } from './modules/production/pages/TransformationPage'
import { ConditionnementPage } from './modules/production/pages/ConditionnementPage'
import { ControleQualitePage } from './modules/production/pages/ControleQualitePage'
import { ProduitsFabriquesPage } from './modules/production/pages/ProduitsFabriquesPage'
import { ProductionHistoriquePage } from './modules/production/pages/ProductionHistoriquePage'
import { LotDetailPage as ProductionLotDetailPage } from './modules/production/pages/LotDetailPage'
import { PlaceholderPage } from './modules/admin/pages/PlaceholderPage'
import { ProtectedRoute } from './core/routes/ProtectedRoute'
import { UserRole } from './core/context/AuthContext'

function App() {
  return (
    <Routes>
      {/* Public routes (MainLayout) */}
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
        <Route path="*" element={<Navigate to="/actualites" replace />} />
      </Route>

      {/* Admin routes (AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        {/* Farm routes */}
        <Route path="farms" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <FarmManagement />
          </ProtectedRoute>
        } />
        <Route path="farms/:farmId" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <FarmDetail />
          </ProtectedRoute>
        } />
        {/* Elevage routes */}
        <Route path="elevage/dashboard" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ElevageDashboard />
          </ProtectedRoute>
        } />
        <Route path="elevage/lots" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <LotsPage />
          </ProtectedRoute>
        } />
        <Route path="elevage/lots/:id" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ElevageLotDetailPage />
          </ProtectedRoute>
        } />
        <Route path="elevage/poulaillers" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <PoulailersPage />
          </ProtectedRoute>
        } />
        <Route path="elevage/sante" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <SantePage />
          </ProtectedRoute>
        } />
        <Route path="elevage/alimentation" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <AlimentationPage />
          </ProtectedRoute>
        } />
        <Route path="elevage/historique" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <HistoriquePage />
          </ProtectedRoute>
        } />
        {/* Production routes */}
        <Route path="production/dashboard" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ProductionDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="production/lots-recus" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ReceivedLotsPage />
          </ProtectedRoute>
        } />
        <Route path="production/abattage" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <AbattagePage />
          </ProtectedRoute>
        } />
        <Route path="production/decoupe" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <DecoupePage />
          </ProtectedRoute>
        } />
        <Route path="production/transformation" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <TransformationPage />
          </ProtectedRoute>
        } />
        <Route path="production/conditionnement" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ConditionnementPage />
          </ProtectedRoute>
        } />
        <Route path="production/controle-qualite" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ControleQualitePage />
          </ProtectedRoute>
        } />
        <Route path="production/produits-fabriques" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ProduitsFabriquesPage />
          </ProtectedRoute>
        } />
        <Route path="production/historique" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ProductionHistoriquePage />
          </ProtectedRoute>
        } />
        <Route path="production/lots/:id" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <ProductionLotDetailPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <ProtectedRoute roles={['ADMIN' as UserRole]}>
            <PlaceholderPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
