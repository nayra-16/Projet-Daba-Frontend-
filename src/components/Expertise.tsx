import React from 'react';
import { motion } from 'framer-motion';
import elevageImg from '../assets/expertise/elevage.jpeg';
import transformationImg from '../assets/expertise/transformation.jpeg';
import abattoirImg from '../assets/expertise/abattoir.jpeg';
import distributionImg from '../assets/expertise/distribution.jpeg';

const expertiseItems = [
  {
    title: 'Élevage',
    image: elevageImg,
  },
  {
    title: 'Transformation',
    image: transformationImg,
  },
  {
    title: 'Abattoir moderne',
    image: abattoirImg,
  },
  {
    title: 'Distribution',
    image: distributionImg,
  }
];

const Expertise: React.FC = () => {
  return (
    <section className="py-20 bg-brand-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-white">Nos domaines d'expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {expertiseItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full transition-transform duration-300 group-hover:-translate-y-2">
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  {/* Placeholder for Expertise Image */}
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-brand-green text-white px-4 py-1 rounded-full text-sm font-bold">
                      DABA →
                    </span>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-brand-blue font-bold text-xl">{item.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Expertise;
