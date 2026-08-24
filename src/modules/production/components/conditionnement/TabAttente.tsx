import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductionLot } from '../../../types';

interface TabAttenteProps {
  lotsWaiting: ProductionLot[];
  canEdit: boolean;
  onConditionner: (lot: ProductionLot, editMode?: boolean) => void;
  getAvailableWeight: (lot: ProductionLot) => number;
}

export const TabAttente: React.FC<TabAttenteProps> = ({ lotsWaiting, canEdit, onConditionner, getAvailableWeight }) => {
  if (lotsWaiting.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
          Aucun lot en attente de conditionnement.
        </td>
      </tr>
    );
  }

  return (
    <>
      {lotsWaiting.map(lot => (
        <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">
            {lot.processingDetails?.productName || lot.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700 dark:text-slate-200">
            {getAvailableWeight(lot).toFixed(1)} kg
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{lot.responsible}</td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
            {canEdit && (
              <button
                onClick={() => onConditionner(lot, false)}
                className="bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-opacity-90 flex items-center gap-1 mx-auto transition-all"
              >
                Conditionner
                <ArrowRight size={12} />
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  );
};
