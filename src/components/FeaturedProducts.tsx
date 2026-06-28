import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import pouletEntierImg from '../assets/products/poulet-entier.jpeg';
import decoupeImg from '../assets/products/decoupe.jpeg';

const products = [
  {
    id: '1',
    name: 'Poulet entier',
    price: 2600,
    image: pouletEntierImg,
    category: 'Poulets',
    available: true
  },
  {
    id: '3',
    name: 'Cuisse de poulet',
    price: 2200,
    image: decoupeImg,
    category: 'Découpes',
    available: true
  },
  {
    id: '6',
    name: 'Saucisse',
    price: 1000,
    image: decoupeImg,
    category: 'Charcuteries',
    available: true
  }
];

const FeaturedProducts: React.FC = () => {
  const { addToCart } = useCart();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-4">Nos produits les plus demandés</h2>
            <div className="w-20 h-1.5 bg-brand-green rounded-full"></div>
          </div>
          <Link to="/products" className="bg-brand-green text-white px-6 py-2 rounded-md font-bold hover:bg-opacity-90 transition-all hidden md:block">
            Tout voir →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg"
            >
              <div className="h-96 bg-gray-200">
                {/* Product Image Placeholder */}
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${product.image}')` }}
                ></div>
                {/* Overlay with info always visible on bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-brand-green">{product.price.toLocaleString()} FCFA</span>
                    <button
                      onClick={() => addToCart(product as any)}
                      className="bg-brand-green p-3 rounded-full hover:bg-white hover:text-brand-green transition-all"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link to="/products" className="inline-block bg-brand-green text-white px-8 py-3 rounded-md font-bold w-full">
            Tout voir
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
