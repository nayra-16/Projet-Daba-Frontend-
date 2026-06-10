import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero/hero.png';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-xl">
                {/* Placeholder for About Image */}
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroImg})` }}
                ></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-green rounded-lg -z-10 hidden md:block"></div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-blue leading-tight">
              L’excellence au service de l’agroalimentaire
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              DABA est une entreprise spécialisée dans l’agro-business, la production et la transformation de produits d’élevage ainsi que l’exploitation d’un abattoir moderne. Grâce à notre expertise et à nos infrastructures de pointe, nous garantissons des produits de haute qualité répondant aux exigences des consommateurs et des professionnels.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center bg-brand-green text-white px-8 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all group"
            >
              En savoir plus
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
