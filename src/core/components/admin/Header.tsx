
import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Menu as MenuIcon,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminContext } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from './Breadcrumb';
import { ADMIN_MENU_ITEMS } from '../../constants/admin';
import { NotificationCenter } from '../../../shared/notifications/components/NotificationCenter';
import { notificationService } from '../../../shared/notifications/services/notificationService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Header: React.FC = () => {
  const location = useLocation();
  const { toggleSidebar, toggleSidebarCollapsed, sidebarCollapsed, setSidebarOpen } = useAdminContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find current page title
  const getCurrentPageTitle = () => {
    for (const item of ADMIN_MENU_ITEMS) {
      if (item.path === location.pathname) return item.name;
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === location.pathname) return subItem.name;
        }
      }
    }
    return 'Dashboard';
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    };
    fetchUnreadCount();
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>

        {/* Desktop toggle sidebar */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {sidebarCollapsed ? <ChevronRight size={24} /> : <Menu size={24} />}
        </button>

        {/* Breadcrumb & Title */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-brand-text">{getCurrentPageTitle()}</h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-brand-red text-white text-xs font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Center */}
        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Messages */}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <MessageSquare size={20} />
        </button>

        {/* Theme toggle (placeholder) */}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Sun size={20} />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="hidden md:block text-sm font-medium text-brand-text">Admin</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-bold text-brand-text">{user?.name || 'Administrateur'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'admin@daba.tg'}</p>
              </div>
              <div className="py-2">
                <Link
                  to="/admin/profil"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Mon Profil</span>
                </Link>
                <Link
                  to="/admin/parametres"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Paramètres</span>
                </Link>
                <div className="border-t border-gray-100 my-2" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-red hover:bg-gray-50 text-left"
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={18} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
