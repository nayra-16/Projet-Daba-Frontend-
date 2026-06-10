import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const deliveryFee = cart.length > 0 ? 1000 : 0;
  const total = getCartTotal() + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-brand-blue mb-4">Votre panier est vide</h2>
          <p className="text-gray-500 mb-8">Il semblerait que vous n'ayez pas encore ajouté de produits.</p>
          <Link
            to="/products"
            className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all inline-block"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen pb-20">
      <section className="bg-brand-blue py-12 text-white mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Mon Panier</h1>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-blue">Produits ({cart.length})</h3>
                <button
                  onClick={clearCart}
                  className="text-brand-red font-bold text-sm hover:underline flex items-center gap-2"
                >
                  <Trash2 size={16} /> Vider le panier
                </button>
              </div>

              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${item.image}')` }}
                      ></div>
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h4 className="font-bold text-lg text-brand-blue mb-1">{item.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{item.category}</p>
                      <span className="font-bold text-brand-green">{item.price.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-500"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-brand-blue">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-500"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-12 h-12 flex items-center justify-center text-brand-red hover:bg-brand-red/10 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-gray-50">
                <Link to="/products" className="text-brand-blue font-bold flex items-center gap-2 hover:text-brand-green transition-colors">
                  <ArrowLeft size={20} /> Continuer mes achats
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-brand-blue mb-8">Récapitulatif</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-bold">{getCartTotal().toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="font-bold">{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-end">
                  <span className="font-bold text-brand-blue text-lg">Total</span>
                  <div className="text-right">
                    <span className="block text-3xl font-bold text-brand-green">{total.toLocaleString()} FCFA</span>
                    <span className="text-xs text-gray-400">TVA incluse</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl shadow-brand-red/20"
              >
                Passer la commande
              </Link>

              <div className="mt-8 grid grid-cols-4 gap-4 opacity-50 grayscale">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
