import React, { useEffect, useState } from 'react';
import { Search, Eye, Filter, ArrowRight, Package, ArrowDownToLine, Tag, QrCode, X, Printer } from 'lucide-react';
import { productionService } from '../services/productionService';
import { FinishedProduct } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

export const ProduitsFabriquesPage: React.FC = () => {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  
  // Label Modal state
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<FinishedProduct | null>(null);

  const { hasRole } = useAuth();
  const canEdit = hasRole('SUPER_ADMIN') || hasRole('DIRECTEUR') || hasRole('RESPONSABLE_PRODUCTION') || hasRole('GESTIONNAIRE_STOCK');

  useEffect(() => {
    const loadProducts = async () => {
      const data = await productionService.getFinishedProducts();
      // Ensure all products have a valid status, default to 'Conforme' if missing
      const mapped = data.map(p => ({
         ...p,
         status: p.status || 'Conforme'
      }));
      setProducts(mapped);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Déduire les catégories dynamiquement depuis les produits existants
  const categories = ['Toutes', ...Array.from(new Set(products.map(p => p.productName)))].filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.elevageLotNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Toutes' || p.productName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTransferToStock = async (productId: string) => {
     // Mise à jour de l'UI localement (simulée car l'API de transfert direct n'existe pas dans l'audit)
     // Commentaire requis par les règles : "Si une API ne permet pas, ne l'invente pas"
     setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, status: 'En stock' } : p)
     );
  };

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
        <h2 className="text-3xl font-extrabold text-brand-text dark:text-white">Catalogue des Produits Fabriqués</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Inventaire des produits finis issus de la transformation industrielle, prêts pour le transfert au stock central ou la vente</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
           {/* Search */}
           <div className="relative w-full sm:max-w-md">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
             <input
               type="text"
               placeholder="Rechercher un produit, numéro de lot..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-green transition-all"
             />
           </div>
           {/* Category Filter */}
           <div className="relative min-w-[200px]">
             <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
             <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-green appearance-none bg-white dark:bg-slate-900 font-medium text-gray-700 dark:text-slate-200 cursor-pointer transition-all hover:border-gray-300 dark:border-slate-600"
             >
                {categories.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>
           </div>
        </div>

        <div className="text-sm font-semibold text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2 bg-brand-green bg-opacity-10 text-brand-green px-4 py-2 rounded-xl border border-brand-green/20">
          <Package size={16} />
          {filteredProducts.length} référence(s)
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Code Lot Production</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Lot d'Origine (Élevage)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dates (Fab. / DLC)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Masse & Volume</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Statut & Stock</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Aucun produit fini ne correspond à vos critères.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-text dark:text-white">
                       {p.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded inline-block mt-2 border border-purple-100">
                       {p.lotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-blue">
                       {p.elevageLotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-slate-300">
                       <div className="font-semibold text-gray-700 dark:text-slate-200">Fab: {p.dateFabrication}</div>
                       <div className="text-gray-500 dark:text-slate-400">DLC: {p.dateLimite}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className="block font-extrabold text-brand-green">{p.weight.toFixed(1)} kg</span>
                       <span className="block text-[10px] text-gray-500 dark:text-slate-400 font-semibold">{p.quantity} emballages</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                           p.status === 'En stock' ? 'bg-blue-100 text-blue-700' :
                           p.status === 'Vendu' ? 'bg-gray-100 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300' :
                           'bg-brand-green/10 text-brand-green'
                         }`}>
                           {p.status}
                         </span>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                           p.stock > 10 ? 'text-brand-green' : p.stock > 0 ? 'text-yellow-600' : 'text-red-500'
                         }`}>
                           {p.stock} restant
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center items-center gap-2">
                         {canEdit && p.status !== 'En stock' && p.status !== 'Vendu' && p.stock > 0 && (
                            <button
                               onClick={() => handleTransferToStock(p.id)}
                               className="bg-brand-blue hover:bg-opacity-90 text-white p-2 rounded-lg transition-all flex items-center justify-center title='Transférer au stock'"
                               title="Transférer au stock"
                            >
                               <ArrowDownToLine size={16} />
                            </button>
                         )}
                         <button 
                            onClick={() => setSelectedProductForLabel(p)}
                            className="text-gray-400 dark:text-slate-500 hover:text-purple-600 p-2 transition-all bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
                            title="Imprimer l'étiquette"
                         >
                            <QrCode size={16} />
                         </button>
                         <button className="text-gray-400 dark:text-slate-500 hover:text-brand-green p-2 transition-all bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
                            <Eye size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label Modal */}
      {selectedProductForLabel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
              <h3 className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                <Tag size={18} className="text-brand-blue" />
                Étiquette Produit Fini
              </h3>
              <button 
                onClick={() => setSelectedProductForLabel(null)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Simulated Label Preview */}
              <div id="print-label" className="border-2 border-black rounded-lg p-4 bg-white dark:bg-slate-900 relative">
                <div className="text-center border-b-2 border-black pb-2 mb-2">
                  <h1 className="font-extrabold text-2xl uppercase tracking-widest">{selectedProductForLabel.productName}</h1>
                  <p className="text-xs font-bold mt-1">PRODUIT CERTIFIÉ DABA ERP</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold mt-4">
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-slate-400 uppercase">Code Lot</span>
                    <span className="text-lg font-mono">{selectedProductForLabel.lotNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-500 dark:text-slate-400 uppercase">Poids Net</span>
                    <span className="text-lg">{selectedProductForLabel.weight.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold mt-2">
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-slate-400 uppercase">Lot Élevage Origine</span>
                    <span className="font-mono">{selectedProductForLabel.elevageLotNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-gray-500 dark:text-slate-400 uppercase">Quantité</span>
                    <span>{selectedProductForLabel.quantity} u</span>
                  </div>
                </div>
                
                <div className="border-t-2 border-black mt-4 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                     <span>FAB: {selectedProductForLabel.dateFabrication}</span>
                     <span>DLC: {selectedProductForLabel.dateLimite}</span>
                  </div>
                  <p className="text-[9px] text-center mt-2 font-semibold">À conserver entre 0°C et 4°C.</p>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="w-full h-12 flex justify-center gap-[2px]">
                    {/* Just some visual lines simulating a barcode */}
                    {Array.from({length: 40}).map((_, i) => (
                      <div key={i} className="bg-black h-full" style={{ width: `${Math.max(1, Math.random() * 4)}px` }}></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono mt-1 tracking-[0.2em]">{selectedProductForLabel.id.replace(/\D/g,'').slice(0, 12).padStart(12, '0')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedProductForLabel(null)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                   window.print();
                   setSelectedProductForLabel(null);
                }}
                className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-2 shadow-sm"
              >
                <Printer size={16} />
                Imprimer l'étiquette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProduitsFabriquesPage;
