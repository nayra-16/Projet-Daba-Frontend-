
import React from 'react';
import { ProductionItem } from '../types';

interface ProductionTableProps {
  items: ProductionItem[];
}

const ProductionTable: React.FC<ProductionTableProps> = ({ items }) => {
  const getStatusColor = (status: ProductionItem['status']) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-100 text-brand-green';
      case 'En cours':
        return 'bg-blue-100 text-brand-blue';
      case 'À venir':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-brand-text">Production du jour</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Heure</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text">{item.product}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{item.lot}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.responsible}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;

