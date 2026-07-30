import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Farm } from '../types';
import { farmService } from '../services/farmService';
import { MapPin, Phone, User, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFarms = async () => {
      const data = await farmService.getAllFarms();
      setFarms(data);
      setLoading(false);
    };
    loadFarms();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-brand-green py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Gestion des Fermes</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Gérez vos fermes, vos animaux et vos lots avec simplicité et efficacité.
          </p>
        </div>
      </section>

      {/* Farms Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              // Skeleton loaders
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              farms.map((farm, index) => (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:border-brand-green transition-all group"
                >
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-brand-blue mb-4">{farm.name}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin size={20} className="text-brand-green mt-1 flex-shrink-0" />
                        <span>{farm.location}</span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600">
                        <TrendingUp size={20} className="text-brand-green mt-1 flex-shrink-0" />
                        <span>{farm.area} hectares</span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600">
                        <User size={20} className="text-brand-green mt-1 flex-shrink-0" />
                        <span>{farm.ownerName}</span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600">
                        <Phone size={20} className="text-brand-green mt-1 flex-shrink-0" />
                        <span>{farm.contactPhone}</span>
                      </div>
                    </div>
                    <Link
                      to={`/farms/${farm.id}`}
                      className="bg-brand-green text-white px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all block text-center"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmManagement;
