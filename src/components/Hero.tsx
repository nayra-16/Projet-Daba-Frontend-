import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero/hero.png';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[600px] lg:h-[800px] flex items-center overflow-hidden">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gray-300">
        {/* The user will add the image here later in src/assets/hero */}
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        ></div>
        <div className="absolute inset-0 bg-brand-green/70"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white"
          >
            Des produits d’élevage frais, sains et de qualité pour tous.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-10 opacity-90 leading-relaxed"
          >
            DABA accompagne les particuliers, restaurants, hôtels, supermarchés et distributeurs avec des produits issus d’un élevage maîtrisé et d’un processus de transformation moderne.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/products"
              className="bg-white text-brand-green px-8 py-4 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Commander
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white hover:text-brand-green transition-all"
            >
              Découvrir DABA
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
