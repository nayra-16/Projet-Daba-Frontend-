
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import { Sidebar } from '../components/admin/Sidebar';
import { Header } from '../components/admin/Header';
import { AdminFooter } from '../components/admin/AdminFooter';
import { useAdminContext } from '../context/AdminContext';

const AdminContent: React.FC = () => {
  const { sidebarCollapsed } = useAdminContext();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Sidebar />
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
};
