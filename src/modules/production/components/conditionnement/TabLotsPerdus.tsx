import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { ProductionLot } from '../../../types';

interface TabLotsPerdusProps {
  lots: ProductionLot[];
}

export const TabLotsPerdus: React.FC<TabLotsPerdusProps> = ({ lots }) => {
  const perdus = lots.filter(l => l.status === ('PERDU' as any));

  if (perdus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <AlertTriangle size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-bold">Aucun lot perdu</p>
        <p className="text-sm">Tous les lots sont en bon état ou n'ont pas été déclarés perdus.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-red-800 dark:text-red-300 uppercase">Lot</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-red-800 dark:text-red-300 uppercase">Produit</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-red-800 dark:text-red-300 uppercase">Quantité perdue</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-red-800 dark:text-red-300 uppercase">Motif / Raison</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-red-800 dark:text-red-300 uppercase">Date déclaration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-50 dark:divide-red-900/10">
          {perdus.map(lot => (
            <tr key={lot.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
              <td className="px-6 py-4 text-sm font-bold text-brand-blue">{lot.packagingDetails?.productionLotNumber || lot.elevageLotNumber}</td>
              <td className="px-6 py-4 text-sm font-semibold">{lot.processingDetails?.productName || lot.name}</td>
              <td className="px-6 py-4 text-sm text-center font-bold text-red-600">
                {lot.packagingDetails ? `${lot.packagingDetails.weight} kg` : `${lot.weight} kg`}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Info size={14} className="text-red-400" />
                  {lot.perteReason || 'Non spécifié'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                {lot.perteDate ? new Date(lot.perteDate).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
