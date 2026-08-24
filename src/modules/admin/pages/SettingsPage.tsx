import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/context/ThemeContext';
import { useToast } from '../../../core/ui/Feedback';
import { Settings, Monitor, Bell, LayoutDashboard, Database, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // === ETAT LOCAL POUR PARAMÈTRES ===
  // Général
  const [dateFormat, setDateFormat] = useState('JJ/MM/AAAA');
  const [timeFormat, setTimeFormat] = useState('24 heures');

  // Notifications
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifStock, setNotifStock] = useState(true);
  const [notifElevage, setNotifElevage] = useState(true);
  const [notifProd, setNotifProd] = useState(true);

  // Dashboard
  const [dashKpi, setDashKpi] = useState(true);
  const [dashElevage, setDashElevage] = useState(true);
  const [dashProd, setDashProd] = useState(true);
  const [dashStock, setDashStock] = useState(true);
  const [dashAlerts, setDashAlerts] = useState(true);
  const [dashActivities, setDashActivities] = useState(true);

  // ERP
  const [stockLow, setStockLow] = useState('10');
  const [stockCritical, setStockCritical] = useState('5');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5 minutes');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simuler une sauvegarde API
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(t('settings.savedSuccess'));
    } catch (err) {
      toast.error(t('settings.savedError'));
    } finally {
      setIsSaving(false);
    }
  };

  const cardClasses = cn(
    'rounded-xl border shadow-sm p-6',
    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-surface-border'
  );

  const selectClasses = cn(
    'w-full md:w-64 px-4 py-2 rounded-lg border outline-none transition-colors appearance-none cursor-pointer',
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-brand-blue/50'
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-blue/50 focus:bg-white'
  );

  const inputClasses = cn(
    'w-full md:w-64 px-4 py-2 rounded-lg border outline-none transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-brand-blue/50'
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-blue/50 focus:bg-white'
  );

  const labelClasses = cn(
    'block text-sm font-semibold mb-1.5',
    isDark ? 'text-slate-300' : 'text-slate-700'
  );

  // Toggle switch component
  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100 dark:border-slate-800/50">
      <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
          checked ? 'bg-brand-blue' : isDark ? 'bg-slate-700' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );

  // Theme option component
  const ThemeOption = ({ 
    active, 
    onClick, 
    label, 
    value 
  }: { 
    active: boolean; 
    onClick: () => void; 
    label: string; 
    value: string 
  }) => (
    <div 
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
        active 
          ? (isDark ? 'border-brand-blue bg-brand-blue/10' : 'border-brand-blue bg-brand-blue/5')
          : (isDark ? 'border-slate-800 bg-slate-800/50 hover:border-slate-700' : 'border-gray-200 bg-gray-50 hover:border-gray-300')
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
        active ? 'border-brand-blue' : (isDark ? 'border-slate-600' : 'border-gray-300')
      )}>
        {active && <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />}
      </div>
      <span className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-700')}>{label}</span>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* EN-TÊTE FIXE POUR SAUVEGARDE */}
        <div className="flex items-center justify-between mb-6 sticky top-[55px] z-10 p-4 rounded-xl shadow-sm backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Settings className="text-brand-blue" size={24} />
            <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.title')}</h2>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className={cn(
              'px-6 py-2 rounded-lg font-bold text-white transition-all',
              'bg-brand-blue hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100',
            )}
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </button>
        </div>

        {/* 1. GÉNÉRAL */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-brand-blue" size={20} />
            <h3 className={cn('text-md font-bold uppercase', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.general')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t('settings.language')}</label>
              <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className={selectClasses}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t('settings.dateFormat')}</label>
              <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={selectClasses}>
                <option>JJ/MM/AAAA</option>
                <option>MM/JJ/AAAA</option>
                <option>AAAA-MM-JJ</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t('settings.timeFormat')}</label>
              <select value={timeFormat} onChange={e => setTimeFormat(e.target.value)} className={selectClasses}>
                <option>24 heures</option>
                <option>12 heures (AM/PM)</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t('settings.currency')}</label>
              <input type="text" value="FCFA" readOnly className={cn(inputClasses, 'opacity-70 cursor-not-allowed')} />
            </div>
          </div>
        </div>

        {/* 2. APPARENCE */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="text-brand-blue" size={20} />
            <h3 className={cn('text-md font-bold uppercase', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.appearance')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ThemeOption 
              active={!isDark} 
              onClick={() => { if(isDark) toggleTheme(); }} 
              label={t('settings.light')} 
              value="light" 
            />
            <ThemeOption 
              active={isDark} 
              onClick={() => { if(!isDark) toggleTheme(); }} 
              label={t('settings.dark')} 
              value="dark" 
            />
            <ThemeOption 
              active={false} 
              onClick={() => {}} 
              label={t('settings.system')} 
              value="system" 
            />
          </div>
        </div>

        {/* 3. NOTIFICATIONS */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-brand-blue" size={20} />
            <h3 className={cn('text-md font-bold uppercase', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.notifications')}</h3>
          </div>
          <div className="max-w-xl">
            <Toggle label={t('settings.notifSystem')} checked={notifSystem} onChange={setNotifSystem} />
            <Toggle label={t('settings.notifStock')} checked={notifStock} onChange={setNotifStock} />
            <Toggle label={t('settings.notifElevage')} checked={notifElevage} onChange={setNotifElevage} />
            <Toggle label={t('settings.notifProd')} checked={notifProd} onChange={setNotifProd} />
          </div>
        </div>

        {/* 4. DASHBOARD */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-6">
            <LayoutDashboard className="text-brand-blue" size={20} />
            <h3 className={cn('text-md font-bold uppercase', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.dashboardPrefs')}</h3>
          </div>
          <div className="max-w-xl">
            <Toggle label={t('settings.dashKpi')} checked={dashKpi} onChange={setDashKpi} />
            <Toggle label={t('settings.dashElevage')} checked={dashElevage} onChange={setDashElevage} />
            <Toggle label={t('settings.dashProd')} checked={dashProd} onChange={setDashProd} />
            <Toggle label={t('settings.dashStock')} checked={dashStock} onChange={setDashStock} />
            <Toggle label={t('settings.dashAlerts')} checked={dashAlerts} onChange={setDashAlerts} />
            <Toggle label={t('settings.dashActivities')} checked={dashActivities} onChange={setDashActivities} />
          </div>
        </div>

        {/* 5. ERP */}
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-brand-blue" size={20} />
            <h3 className={cn('text-md font-bold uppercase', isDark ? 'text-white' : 'text-brand-text')}>{t('settings.erpSettings')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelClasses}>{t('settings.stockLow')}</label>
              <input 
                type="number" 
                value={stockLow} 
                onChange={(e) => setStockLow(e.target.value)} 
                className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>{t('settings.stockCritical')}</label>
              <input 
                type="number" 
                value={stockCritical} 
                onChange={(e) => setStockCritical(e.target.value)} 
                className={inputClasses} 
              />
            </div>
          </div>
          <div className="max-w-xl">
            <Toggle label={t('settings.autoRefresh')} checked={autoRefresh} onChange={setAutoRefresh} />
            {autoRefresh && (
              <div className="mt-4">
                <label className={labelClasses}>{t('settings.refreshInterval')}</label>
                <select 
                  value={refreshInterval} 
                  onChange={(e) => setRefreshInterval(e.target.value)} 
                  className={selectClasses}
                >
                  <option>1 minute</option>
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
      </form>
    </div>
  );
};
