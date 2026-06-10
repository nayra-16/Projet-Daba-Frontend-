import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { CartProvider } from '../context/CartContext';

const MainLayout: React.FC = () => {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <TopBar />
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default MainLayout;
