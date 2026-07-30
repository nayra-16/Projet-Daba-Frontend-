import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'KOFFI Emmanuel',
    comment: 'Des produits d’une fraîcheur exceptionnelle. Le service de livraison est ponctuel et professionnel. Je recommande vivement DABA !',
    rating: 5,
    role: 'Chef Cuisinier'
  },
  {
    id: 2,
    name: 'AMENOU Jean',
    comment: 'La qualité de la découpe est parfaite. On sent vraiment le savoir-faire local dans chaque produit. Bravo à toute l’équipe.',
    rating: 5,
    role: 'Gérant Supermarché'
  },
  {
    id: 3,
    name: 'ADJOVI Marie',
    comment: 'Enfin un service de commande en ligne fiable pour nos produits d’élevage. Très satisfaite de mes commandes régulières.',
    rating: 4,
    role: 'Particulier'
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/3">
            <h2 className="text-4xl font-bold text-brand-blue mb-6">Ce que les clients disent de nous</h2>
            <div className="flex gap-4">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border-2 border-brand-green text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border-2 border-brand-green text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-white transition-all"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            <div className="mt-8">
              <Link to="/contact" className="bg-brand-green text-white px-8 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all inline-block">
                En savoir plus →
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="relative bg-brand-light rounded-3xl p-12 shadow-inner">
              <Quote className="absolute top-8 left-8 text-brand-green opacity-20" size={64} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < testimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-2xl italic text-brand-text mb-8 leading-relaxed">
                    "{testimonials[currentIndex].comment}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-brand-blue">{testimonials[currentIndex].name}</h4>
                      <p className="text-gray-500">{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
