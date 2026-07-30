
import React from 'react';
import { RecentOrder } from '../types';

interface OrdersTableProps {
  orders: RecentOrder[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-700';
      case 'En cours':
        return 'bg-blue-100 text-brand-blue';
      case 'Livré':
        return 'bg-green-100 text-brand-green';
      case 'Annulé':
        return 'bg-red-100 text-brand-red';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-brand-text">Dernières commandes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text">{order.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{order.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
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

export default OrdersTable;

