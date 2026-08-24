import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, LayoutGrid, Settings, UserCheck } from 'lucide-react';
import UsersList from '../users/UsersList';
import UsersRoles from '../users/UsersRoles';
import UtilisateursOverview from '../users/UtilisateursOverview';

interface AdministrationPageProps {
  defaultTab?: 'users' | 'roles' | 'overview';
}

export const AdministrationPage: React.FC<AdministrationPageProps> = ({ defaultTab = 'users' }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'overview'>(defaultTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-green/20 text-brand-green rounded-2xl flex items-center justify-center font-bold">
                <Settings size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-100 tracking-tight">Administration & Utilisateurs</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Gestion centralisée des comptes, des rôles et des autorisations du système ERP DABA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-700 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#42B649] text-[#42B649] bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users size={18} />
            <span>Gestion des Utilisateurs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-[#42B649] text-[#42B649] bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield size={18} />
            <span>Rôles & Permissions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#42B649] text-[#42B649] bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
        {activeTab === 'users' && <UsersList />}
        {activeTab === 'roles' && <UsersRoles />}
        {activeTab === 'overview' && <UtilisateursOverview />}
      </motion.div>
    </div>
  );
};

export default AdministrationPage;
