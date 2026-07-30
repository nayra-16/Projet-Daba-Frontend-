import React from 'react';
import { ShieldCheck, Truck, Leaf, Award } from 'lucide-react';

const advantages = [
  {
    icon: <Leaf className="text-white" size={32} />,
    title: 'Produits frais',
    color: 'bg-brand-blue'
  },
  {
    icon: <ShieldCheck className="text-white" size={32} />,
    title: 'Contrôle qualité',
    color: 'bg-brand-blue'
  },
  {
    icon: <Truck className="text-white" size={32} />,
    title: 'Livraison rapide',
    color: 'bg-brand-blue'
  },
  {
    icon: <Award className="text-white" size={32} />,
    title: 'Production locale',
    color: 'bg-brand-blue'
  }
];

const Advantages: React.FC = () => {
  return (
    <section className="relative -mt-16 z-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 shadow-2xl rounded-lg overflow-hidden">
          {advantages.map((adv, index) => (
            <div
              key={index}
              className={`${adv.color} py-8 px-6 flex flex-col items-center text-center border-r border-white/10 last:border-0 hover:bg-brand-green transition-colors duration-300`}
            >
              <div className="mb-4">{adv.icon}</div>
              <h3 className="text-white font-bold text-lg">{adv.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
