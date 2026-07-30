import React, { useEffect, useState } from 'react';
import { Search, Eye, Filter, ArrowRight, Package } from 'lucide-react';
import { productionService } from '../services/productionService';
import { FinishedProduct } from '../types';

export const ProduitsFabriquesPage: React.FC = () => {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      const data = await productionService.getFinishedProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.elevageLotNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement du catalogue des produits fabriqués...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-brand-text">Catalogue des Produits Fabriqués</h2>
        <p className="text-gray-500 text-sm mt-1">Inventaire des produits finis issus de la transformation industrielle, prêts pour la commercialisation</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit, numéro de lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green transition-all"
          />
        </div>
        <div className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 bg-brand-green bg-opacity-10 text-brand-green px-3.5 py-1.5 rounded-full">
          <Package size={16} />
          {filteredProducts.length} références en stock
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code Lot Production</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lot d'Origine (Élevage)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Fab.</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Limite</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Quantité Initiale</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Poids Initial</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Restant</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    Aucun produit fini en stock.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{p.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-purple-700">{p.lotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-blue">{p.elevageLotNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dateFabrication}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dateLimite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 font-medium">{p.quantity} sachets</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 font-semibold">{p.weight.toFixed(1)} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        p.stock > 10 ? 'bg-green-50 text-brand-green' : 'bg-red-50 text-brand-red'
                      }`}>
                        {p.stock} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.stock > 0 ? 'bg-brand-green bg-opacity-10 text-brand-green' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.stock > 0 ? 'En stock' : 'Épuisé'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
