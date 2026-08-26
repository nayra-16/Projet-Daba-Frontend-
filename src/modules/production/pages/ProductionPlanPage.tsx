import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

export const ProductionPlanPage: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductionOrder>>({
    productName: '',
    plannedQuantity: 0,
    unit: 'kg',
    plannedDate: new Date().toISOString().split('T')[0],
    plannedTime: '08:00',
    responsible: '',
    priority: 'Normale',
  });

  const { hasRole, user } = useAuth();
  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION');

  const loadOrders = async () => {
    setLoading(true);
    const data = await productionService.getProductionOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.plannedQuantity || !formData.plannedDate) return;
    
    const newOrder: ProductionOrder = {
      id: Date.now().toString(),
      orderNumber: `OP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: formData.productName,
      plannedQuantity: Number(formData.plannedQuantity),
      unit: formData.unit as any,
      plannedDate: formData.plannedDate,
      plannedTime: formData.plannedTime,
      responsible: formData.responsible || user?.name || 'Inconnu',
      status: 'Planifié',
      priority: formData.priority as ProductionOrderPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await productionService.saveProductionOrder(newOrder);
    setIsModalOpen(false);
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: ProductionOrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updatedOrder = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
    await productionService.saveProductionOrder(updatedOrder);
    loadOrders();
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
                        o.productName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tous' || o.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());

  const stats = {
    planifies: orders.filter(o => o.status === 'Planifié').length,
    enCours: orders.filter(o => o.status === 'En cours').length,
    termines: orders.filter(o => o.status === 'Terminé').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">OP Planifiés</p>
            <p className="text-2xl font-bold text-white">{stats.planifies}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
            <PlayCircle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">OP En cours</p>
            <p className="text-2xl font-bold text-white">{stats.enCours}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-green/20 text-brand-green rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">OP Terminés</p>
            <p className="text-2xl font-bold text-white">{stats.termines}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Liste des Ordres de Production
          </h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un OP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-brand-green"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Planifié">Planifié</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Reporté">Reporté</option>
            </select>
            {canEdit && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-green text-white px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvel OP
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                <th className="px-6 py-4 font-medium text-sm">N° Ordre</th>
                <th className="px-6 py-4 font-medium text-sm">Produit visé</th>
                <th className="px-6 py-4 font-medium text-sm">Quantité Prévue</th>
                <th className="px-6 py-4 font-medium text-sm">Date & Heure</th>
                <th className="px-6 py-4 font-medium text-sm">Priorité</th>
                <th className="px-6 py-4 font-medium text-sm">Statut</th>
                <th className="px-6 py-4 font-medium text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Chargement des ordres de production...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Aucun ordre de production trouvé.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-200">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {order.plannedQuantity} {order.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> {order.plannedDate}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={14} /> {order.plannedTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        order.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                        order.priority === 'Prioritaire' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Planifié' ? 'bg-slate-700 text-slate-300' :
                        order.status === 'En cours' ? 'bg-amber-500/20 text-amber-400' :
                        order.status === 'Terminé' ? 'bg-brand-green/20 text-brand-green' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center gap-2">
                        {canEdit && order.status === 'Planifié' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'En cours')}
                            className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 flex items-center gap-1"
                          >
                            Lancer <PlayCircle size={14} />
                          </button>
                        )}
                        {canEdit && order.status === 'En cours' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Terminé')}
                            className="bg-brand-green text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-opacity-90 flex items-center gap-1"
                          >
                            Terminer <CheckCircle2 size={14} />
                          </button>
                        )}
                        {canEdit && order.status !== 'Terminé' && order.status !== 'Annulé' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Annulé')}
                            className="text-red-400 hover:text-red-300 p-1.5 transition-all"
                            title="Annuler"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création OP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">Créer un Ordre de Production</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Produit visé *</label>
                  <select
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="Poulets fumés">Poulets fumés</option>
                    <option value="Merguez">Merguez</option>
                    <option value="Chipo">Chipo</option>
                    <option value="Cuisses marinées">Cuisses marinées</option>
                    <option value="Poulet pané">Poulet pané</option>
                    <option value="Saucisses à griller nature">Saucisses à griller nature</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Quantité prévue *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.plannedQuantity}
                      onChange={(e) => setFormData({...formData, plannedQuantity: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Unité *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    >
                      <option value="kg">kg</option>
                      <option value="unités">unités</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date prévue *</label>
                    <input
                      type="date"
                      required
                      value={formData.plannedDate}
                      onChange={(e) => setFormData({...formData, plannedDate: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Heure prévue</label>
                    <input
                      type="time"
                      value={formData.plannedTime}
                      onChange={(e) => setFormData({...formData, plannedTime: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Priorité</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    >
                      <option value="Normale">Normale</option>
                      <option value="Prioritaire">Prioritaire</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Responsable</label>
                    <input
                      type="text"
                      value={formData.responsible}
                      onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-green text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors"
                >
                  Créer l'Ordre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
