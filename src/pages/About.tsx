import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Shield, Users, TrendingUp } from 'lucide-react';
import historyImg from '../assets/about/history.jpg';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-brand-blue py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">À propos de DABA</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Une entreprise engagée dans la valorisation de la production nationale et l’excellence agroalimentaire au Togo.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-brand-blue mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Fondée avec la vision de transformer le secteur de l'élevage local, DABA a débuté son parcours en mettant l'accent sur la qualité et l'hygiène. Nous avons identifié un besoin croissant de produits d'élevage sains et traçables sur le marché national.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Aujourd'hui, nous sommes fiers d'être un acteur majeur de l'agro-business au Togo, intégrant toute la chaîne de valeur, de l'élevage à la distribution, en passant par une transformation moderne respectant les standards internationaux.
              </p>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={historyImg} 
                  alt="Notre Histoire" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-brand-green"
            >
              <Target className="text-brand-green mb-6" size={48} />
              <h3 className="text-2xl font-bold text-brand-blue mb-4">Notre Mission</h3>
              <p className="text-gray-600">
                Fournir des produits d’élevage de qualité supérieure tout en soutenant l’économie locale et en garantissant une sécurité alimentaire optimale pour nos clients.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-brand-blue"
            >
              <Eye className="text-brand-blue mb-6" size={48} />
              <h3 className="text-2xl font-bold text-brand-blue mb-4">Notre Vision</h3>
              <p className="text-gray-600">
                Devenir le leader de la transformation agroalimentaire en Afrique de l’Ouest, reconnu pour son innovation et son engagement envers le développement durable.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-brand-red"
            >
              <Shield className="text-brand-red mb-6" size={48} />
              <h3 className="text-2xl font-bold text-brand-blue mb-4">Nos Valeurs</h3>
              <p className="text-gray-600">
                L’intégrité, l’excellence, l’innovation et le respect de l’environnement sont au cœur de chacune de nos actions et décisions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-blue mb-12 text-center">Nos Objectifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="text-brand-green flex-shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-lg mb-2">Modernisation</h4>
                <p className="text-gray-600 text-sm">Industrialiser les processus de transformation pour une meilleure productivité.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Users className="text-brand-green flex-shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-lg mb-2">Impact Social</h4>
                <p className="text-gray-600 text-sm">Créer des emplois locaux et valoriser le savoir-faire des éleveurs nationaux.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
