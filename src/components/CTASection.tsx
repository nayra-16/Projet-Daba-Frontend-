import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ctaBg from '../assets/banners/cta-bg.jpg';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaBg})` }}
        ></div>
        <div className="absolute inset-0 bg-[#42B649]/55"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-white">
            Passez votre <span className="text-brand-green">commande</span> en ligne et bénéficiez d’un service rapide, fiable et professionnel.
          </h2>
          <Link
            to="/products"
            className="inline-block bg-brand-red text-white px-10 py-4 rounded-md font-bold text-xl hover:bg-opacity-90 transition-all shadow-xl hover:scale-105 transform"
          >
            Commander maintenant
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
