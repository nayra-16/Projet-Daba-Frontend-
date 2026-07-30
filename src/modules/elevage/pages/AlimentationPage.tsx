
import React, { useEffect, useState } from 'react';
import { elevageService } from '../services/elevageService';
import { FeedRecord } from '../types';

export const AlimentationPage: React.FC = () => {
  const [records, setRecords] = useState<FeedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await elevageService.getFeedRecords();
      setRecords(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-text">Suivi alimentaire</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Total distribué</p>
          <p className="text-2xl font-bold text-brand-text">{totalQuantity} kg</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Coût total</p>
          <p className="text-2xl font-bold text-brand-text">{totalCost.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-1">Nombre de distributions</p>
          <p className="text-2xl font-bold text-brand-text">{records.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type d'aliment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Coût (FCFA)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{record.feedType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.lotId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{record.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{record.cost.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.responsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
