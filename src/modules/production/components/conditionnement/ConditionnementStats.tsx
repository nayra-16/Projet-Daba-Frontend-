import React from 'react';
import { Snowflake, PackageCheck, ShieldCheck, AlertTriangle, CalendarDays } from 'lucide-react';
import { ChambreFroide, ProductionLot } from '../../../types';

interface ConditionnementStatsProps {
  chambres: ChambreFroide[];
  lotsWaiting: ProductionLot[];
  lotsPackaged: ProductionLot[];
}

export const ConditionnementStats: React.FC<ConditionnementStatsProps> = ({ chambres, lotsWaiting, lotsPackaged }) => {
  const stockes = lotsPackaged.filter(l => l.chambreFroideId).length;
  const perdus = lotsPackaged.filter(l => l.status === ('PERDU' as any)).length;
  const dlcProches = lotsPackaged.filter(l => {
    if (!l.dlc) return false;
    const days = (new Date(l.dlc).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days > 0 && days <= 7;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Card 1: Chambres Froides */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Chambres froides</p>
            <h3 className="text-2xl font-black text-brand-text dark:text-white mt-1">{chambres.length}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Snowflake className="text-brand-blue" size={20} />
          </div>
        </div>
        <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-semibold">
          <div className="flex items-center gap-1 text-brand-green">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
            Dispos: {chambres.filter(c => c.status === 'Disponible').length}
          </div>
          <div className="flex items-center gap-1 text-brand-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
            Occupées: {chambres.filter(c => c.status === 'Occupée').length}
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Maint.: {chambres.filter(c => c.status === 'En maintenance').length}
          </div>
          <div className="flex items-center gap-1 text-brand-red">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
            Pannes: {chambres.filter(c => c.status === 'En panne').length}
          </div>
        </div>
      </div>

      {/* Card 2: Lots stockés */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lots stockés</p>
            <h3 className="text-2xl font-black text-brand-text dark:text-white mt-1">{stockes}</h3>
          </div>
          <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <PackageCheck className="text-brand-green" size={20} />
          </div>
        </div>
      </div>

      {/* Card 3: Lots à contrôler */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">À contrôler</p>
            <h3 className="text-2xl font-black text-brand-text dark:text-white mt-1">{lotsWaiting.length}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <ShieldCheck className="text-amber-500" size={20} />
          </div>
        </div>
      </div>

      {/* Card 4: Lots perdus */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lots perdus</p>
            <h3 className="text-2xl font-black text-brand-text dark:text-white mt-1">{perdus}</h3>
          </div>
          <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertTriangle className="text-brand-red" size={20} />
          </div>
        </div>
      </div>

      {/* Card 5: DLC Proches */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">DLC proches</p>
            <h3 className="text-2xl font-black text-brand-text dark:text-white mt-1">{dlcProches}</h3>
          </div>
          <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <CalendarDays className="text-orange-500" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
