import React from 'react';
import { Clock, CheckCircle, Package } from 'lucide-react';
import { ProductionLot } from '../../../types';

interface TabHistoriqueProps {
  lots: ProductionLot[];
}

export const TabHistorique: React.FC<TabHistoriqueProps> = ({ lots }) => {
  // Aggregate all history events across lots
  const events = lots.flatMap(lot => 
    (lot.history || []).map(h => ({
      ...h,
      lotName: lot.processingDetails?.productName || lot.name,
      lotNumber: lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber,
      lotId: lot.id
    }))
  ).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="font-bold">Aucun historique disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4">
        <Clock className="text-purple-500" /> Traçabilité & Historique des Mouvements
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-slate-700 before:to-transparent">
        {events.map((evt, idx) => (
          <div key={`${evt.id}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-shrink-0 z-10">
              <CheckCircle size={18} />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-brand-text dark:text-white text-sm">{evt.step}</span>
                <span className="text-xs font-medium text-gray-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">
                  {new Date(evt.date).toLocaleDateString()} {evt.time}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                 <Package size={12} /> Lot : <span className="font-mono text-brand-blue font-bold">{evt.lotNumber}</span> ({evt.lotName})
              </div>
              
              <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Opérateur : <span className="text-brand-green">{evt.responsible}</span>
              </div>
              
              {evt.comment && (
                <div className="mt-2 text-xs italic text-gray-500 bg-white dark:bg-slate-900 p-2 rounded border border-gray-100 dark:border-slate-700">
                  "{evt.comment}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
