import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Eye, Snowflake } from 'lucide-react';
import { ProductionLot, ChambreFroide } from '../../../types';

interface TabRealiseProps {
  lotsPackaged: ProductionLot[];
  chambres: ChambreFroide[];
  canEdit: boolean;
  getAvailableWeight: (lot: ProductionLot) => number;
  onEditConditionnement: (lot: ProductionLot) => void;
  onStocker: (lot: ProductionLot) => void;
}

export const TabRealise: React.FC<TabRealiseProps> = ({ 
  lotsPackaged, 
  chambres,
  canEdit, 
  getAvailableWeight, 
  onEditConditionnement,
  onStocker
}) => {
  const getChambreName = (id?: string) => {
    if (!id) return '-';
    const c = chambres.find(x => x.id === id);
    return c ? c.name : id;
  };

  if (lotsPackaged.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
          Aucun lot conditionné enregistré.
        </td>
      </tr>
    );
  }

  return (
    <>
      {lotsPackaged.map(lot => (
        <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-brand-blue">{lot.elevageLotNumber}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-white font-semibold">
             {lot.processingDetails?.productName || lot.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-600 dark:text-slate-300">{getAvailableWeight(lot).toFixed(1)} kg</td>
          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">{lot.packagingDetails?.productionLotNumber}</td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center">
             <div className="flex flex-col items-center">
               <span className="font-bold text-brand-green">{lot.packagingDetails?.quantity} unités</span>
               <span className="text-[10px] text-gray-500 dark:text-slate-400">soit {lot.packagingDetails?.weight.toFixed(1)} kg</span>
             </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            {lot.dlc ? new Date(lot.dlc).toLocaleDateString() : '-'}
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center">
             {lot.chambreFroideId ? (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                 <Snowflake size={12} />
                 {getChambreName(lot.chambreFroideId)}
               </span>
             ) : (
               <span className="text-gray-400 dark:text-slate-500 text-xs italic">Non stocké</span>
             )}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
            <div className="flex justify-center items-center gap-2">
              {canEdit && !lot.chambreFroideId && (
                <button
                  onClick={() => onStocker(lot)}
                  className="bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white px-2 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1"
                  title="Stocker en chambre froide"
                >
                  <Snowflake size={14} /> Stocker
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => onEditConditionnement(lot)}
                  className="text-brand-blue hover:text-brand-green p-1 transition-all"
                  title="Modifier"
                >
                  <Edit3 size={16} />
                </button>
              )}
              <Link
                to={`/admin/production/lots/${lot.id}`}
                className="text-gray-500 dark:text-slate-400 hover:text-brand-green p-1 transition-all"
                title="Voir fiche traçabilité"
              >
                <Eye size={16} />
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};
