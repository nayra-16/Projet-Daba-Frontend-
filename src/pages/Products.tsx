import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Filter, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { Product, Category } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen pb-20">
      {/* Header */}
      <section className="bg-brand-green py-16 text-white mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Notre Catalogue</h1>
          <p className="text-lg opacity-80">Découvrez nos produits frais et transformés de qualité supérieure.</p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b">
                <Filter size={20} className="text-brand-green" />
                <h3 className="font-bold text-xl text-brand-blue">Filtres</h3>
              </div>

              {/* Search */}
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-green"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-brand-blue mb-4 uppercase text-xs tracking-widest">Catégories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                      selectedCategory === 'all' ? 'bg-brand-green text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    Tous les produits
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                        selectedCategory === cat.id ? 'bg-brand-green text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="w-full lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-20 text-center shadow-sm">
                <Search size={64} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-2xl font-bold text-brand-blue mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="mt-6 text-brand-green font-bold underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                    >
                      <div className="h-64 bg-gray-100 relative overflow-hidden">
                        {/* Placeholder for Product Image */}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                           <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url('${product.image}')` }}>
                           </div>
                        </div>
                        {!product.availability && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="bg-brand-red text-white px-4 py-2 rounded-full font-bold">Rupture</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                             onClick={() => addToCart(product)}
                             className="bg-brand-green text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                             disabled={!product.availability}
                           >
                             <ShoppingCart size={20} />
                           </button>
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl text-brand-blue group-hover:text-brand-green transition-colors">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                          <div>
                            <span className="block text-2xl font-bold text-brand-blue">
                              {product.price.toLocaleString()} <span className="text-sm">FCFA</span>
                            </span>
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Par {product.unit}</span>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-green transition-all"
                            disabled={!product.availability}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
