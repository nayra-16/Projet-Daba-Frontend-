import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import bannerArticles from '../assets/kapi/banner_articles.webp';
import zencardPub2 from '../assets/kapi/zencard_pub2.jpg';
import zencardPub3 from '../assets/kapi/zencard_pub3.jpg';
import zencardPub5 from '../assets/kapi/zencard_pub5.jpg';
import zencardPub5b from '../assets/kapi/zencard_pub5b.jpg';
import zencardPub6 from '../assets/kapi/zencard_pub6.jpg';
import zencardPub6b from '../assets/kapi/zencard_pub6b.jpg';
import zencardPub7 from '../assets/kapi/zencard_pub7.jpg';
import zencardProduct from '../assets/kapi/zencard_product.jpg';
 
type ActuItem = {
  title: string;
  imageSrc: string;
};
 
const Actualites: React.FC = () => {
  const items = useMemo<ActuItem[]>(
    () => [
      { title: 'Actualité 1', imageSrc: zencardPub2 },
      { title: 'Actualité 2', imageSrc: zencardPub3 },
      { title: 'Actualité 3', imageSrc: zencardPub5 },
      { title: 'Actualité 4', imageSrc: zencardPub6 },
      { title: 'Actualité 5', imageSrc: zencardPub7 },
      { title: 'Actualité 6', imageSrc: zencardPub5b },
      { title: 'Actualité 7', imageSrc: zencardPub6b },
      { title: 'Actualité 8', imageSrc: zencardProduct },
    ],
    []
  );
 
  const [selected, setSelected] = useState<ActuItem | null>(null);
 
  return (
    <div className="bg-brand-light min-h-screen pb-20">
      <section className="relative py-16 md:py-20 text-white mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gray-300">
          <img
            src={bannerArticles}
            alt="Bannière Actualités"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-green/70" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-[.18em] uppercase opacity-90 mb-4"
          >
            DABA
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white"
          >
            Actualités & Bons Plans
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed"
          >
            Offres, nouveautés et informations utiles autour de DABA, de nos produits et de nos services.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center"
          >
            <a
              href="#liste-actualites"
              className="bg-white text-brand-green px-8 py-4 rounded-md font-bold text-base md:text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Voir les actualités
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-10 justify-center"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">8</div>
              <div className="text-xs uppercase tracking-wider opacity-80 mt-1">
                Affiches
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/25 self-center" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">DABA</div>
              <div className="text-xs uppercase tracking-wider opacity-80 mt-1">
                Qualité & Traçabilité
              </div>
            </div>
          </motion.div>
        </div>
      </section>
 
      <div className="container mx-auto px-4" id="liste-actualites">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setSelected(item)}
              className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full aspect-[3/4] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <span className="font-semibold text-brand-blue text-sm">
                  {item.title}
                </span>
                <span className="text-brand-green font-bold">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
 
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end mb-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
              <img
                src={selected.imageSrc}
                alt={selected.title}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-4">
                <div className="font-bold text-brand-blue">{selected.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Actualites;
