import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Home, User, Phone, Mail, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

const Checkout: React.FC = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Order>();

  const total = getCartTotal() + 1000;

  const onSubmit = async (data: Order) => {
    // Simulate API call
    console.log('Order Data:', { ...data, items: cart, total });
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Commande passée avec succès !');
    clearCart();
    navigate('/');
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-brand-light min-h-screen pb-20">
      <section className="bg-brand-blue py-12 text-white mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Finaliser ma commande</h1>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-12">
          {/* Form Side */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Customer Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-blue mb-8 flex items-center gap-3">
                <User className="text-brand-green" /> Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Nom complet</label>
                  <input
                    {...register('customerName', { required: 'Requis' })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green"
                    placeholder="Votre nom"
                  />
                  {errors.customerName && <span className="text-brand-red text-xs">{errors.customerName.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Téléphone</label>
                  <input
                    {...register('phone', { required: 'Requis' })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green"
                    placeholder="+228 XX XX XX XX"
                  />
                  {errors.phone && <span className="text-brand-red text-xs">{errors.phone.message}</span>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Email</label>
                  <input
                    {...register('email', {
                      required: 'Requis',
                      pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' }
                    })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green"
                    placeholder="votre@email.com"
                  />
                  {errors.email && <span className="text-brand-red text-xs">{errors.email.message}</span>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Adresse de livraison</label>
                  <textarea
                    {...register('address', { required: 'Requis' })}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green resize-none"
                    placeholder="Quartier, Rue, Maison..."
                  ></textarea>
                  {errors.address && <span className="text-brand-red text-xs">{errors.address.message}</span>}
                </div>
              </div>
            </div>

            {/* Delivery & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Mode */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-brand-blue mb-6 flex items-center gap-3">
                  <Truck className="text-brand-green" /> Mode de livraison
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('deliveryMethod')}
                      value="home"
                      defaultChecked
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <div>
                      <span className="block font-bold text-brand-blue">Livraison à domicile</span>
                      <span className="text-sm text-gray-500">Sous 24h - 1000 FCFA</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('deliveryMethod')}
                      value="pickup"
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <div>
                      <span className="block font-bold text-brand-blue">Retrait en magasin</span>
                      <span className="text-sm text-gray-500">Gratuit - À notre agence</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-brand-blue mb-6 flex items-center gap-3">
                  <CreditCard className="text-brand-green" /> Moyen de paiement
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="delivery"
                      defaultChecked
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="font-bold text-brand-blue">Paiement à la livraison</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="tmoney"
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="font-bold text-brand-blue">TMoney</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="flooz"
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="font-bold text-brand-blue">Flooz</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="card"
                      className="w-5 h-5 text-brand-green focus:ring-brand-green"
                    />
                    <span className="font-bold text-brand-blue">Carte Bancaire</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Side */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-brand-blue mb-8">Ma commande</h3>
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3 items-center">
                      <span className="font-bold text-brand-green">x{item.quantity}</span>
                      <span className="text-gray-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-brand-blue">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{getCartTotal().toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span>
                  <span>1,000 FCFA</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-brand-blue text-lg">Total à payer</span>
                  <span className="text-3xl font-bold text-brand-green">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer ma commande'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
                En confirmant votre commande, vous acceptez nos conditions générales de vente et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
