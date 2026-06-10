import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import whyChooseUsImg from '../assets/about/why-choose-us.jpg';

const reasons = [
  'Entreprise de confiance',
  'Qualité garantie',
  'Production locale',
  'Valorisation de la production nationale',
  'Hygiène et sécurité'
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="w-full h-[500px] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl rotate-3">
                <img 
                  src={whyChooseUsImg} 
                  alt="Pourquoi choisir DABA" 
                  className="w-full h-full object-cover -rotate-3 scale-110" 
                />
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-4xl font-bold text-brand-blue mb-8">POURQUOI CHOISIR DABA ?</h2>
            <ul className="space-y-6">
              {reasons.map((reason, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="bg-brand-green/10 p-2 rounded-full text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-xl font-bold text-brand-text">{reason}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
