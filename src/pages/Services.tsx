import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Briefcase, Zap, Truck, Home } from 'lucide-react';

const services = [
  {
    title: 'Agro-business',
    description: 'Accompagnement et conseil dans le secteur agricole et de l’élevage pour optimiser la production.',
    icon: <Sprout size={40} className="text-brand-green" />,
    image: '/src/assets/services/agro-business.jpg'
  },
  {
    title: 'Production animale',
    description: 'Élevage contrôlé de volailles et de bétail selon des normes d’hygiène et de santé strictes.',
    icon: <Briefcase size={40} className="text-brand-green" />,
    image: '/src/assets/services/production.jpg'
  },
  {
    title: 'Transformation',
    description: 'Unité de transformation moderne pour des produits dérivés sains et prêts à la consommation.',
    icon: <Zap size={40} className="text-brand-green" />,
    image: '/src/assets/services/transformation-service.jpg'
  },
  {
    title: 'Distribution',
    description: 'Réseau logistique performant pour fournir nos produits aux supermarchés, hôtels et restaurants.',
    icon: <Truck size={40} className="text-brand-green" />,
    image: '/src/assets/services/distribution-service.jpg'
  },
  {
    title: 'Abattoir moderne',
    description: 'Installations de pointe garantissant une découpe propre, hygiénique et respectueuse des normes.',
    icon: <Home size={40} className="text-brand-green" />,
    image: '/src/assets/services/abattoir-service.jpg'
  }
];

const Services: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-brand-green py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Nos Services</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Une expertise complète de l’élevage à votre assiette, garantissant fraîcheur et qualité à chaque étape.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:border-brand-green transition-all group"
              >
                <div className="h-56 overflow-hidden bg-gray-200">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${service.image}')` }}
                  ></div>
                </div>
                <div className="p-8 relative">
                  <div className="absolute -top-10 left-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-brand-blue mb-4 mt-6">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <button className="text-brand-green font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    En savoir plus <span>→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why our services? */}
      <section className="py-20 bg-brand-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-blue mb-12">Pourquoi faire confiance à nos services ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-bold text-xl mb-3 text-brand-blue">Traçabilité</h4>
              <p className="text-gray-600">Nous maîtrisons l'origine de chaque produit de notre chaîne.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-bold text-xl mb-3 text-brand-blue">Hygiène</h4>
              <p className="text-gray-600">Nos installations respectent les normes sanitaires les plus strictes.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h4 className="font-bold text-xl mb-3 text-brand-blue">Innovation</h4>
              <p className="text-gray-600">Nous utilisons des technologies modernes pour la transformation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
