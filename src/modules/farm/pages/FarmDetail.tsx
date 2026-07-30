import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Farm, Animal, AnimalBatch, Feed } from '../types';
import { farmService } from '../services/farmService';
import { MapPin, Phone, User, TrendingUp, ArrowLeft, Users, Package, Activity } from 'lucide-react';

const FarmDetail: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [batches, setBatches] = useState<AnimalBatch[]>([]);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmId) {
      const loadData = async () => {
        const farmData = await farmService.getFarmById(farmId);
        const animalsData = await farmService.getAnimalsByFarmId(farmId);
        const batchesData = await farmService.getBatchesByFarmId(farmId);
        const feedData = await farmService.getFeedByFarmId(farmId);
        setFarm(farmData);
        setAnimals(animalsData);
        setBatches(batchesData);
        setFeed(feedData);
        setLoading(false);
      };
      loadData();
    }
  }, [farmId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="bg-white min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-brand-blue mb-4">Ferme non trouvée</h2>
          <Link to="/farms" className="text-brand-green font-bold hover:underline">
            Retour à la liste des fermes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-brand-green py-20 text-white">
        <div className="container mx-auto px-4">
          <Link
            to="/farms"
            className="inline-flex items-center gap-2 mb-6 text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} /> Retour à la liste
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{farm.name}</h1>
          <p className="text-xl opacity-90">
            Gestion complète de votre ferme
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-12 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-green"
            >
              <Users className="text-brand-green mb-4" size={32} />
              <h3 className="text-lg font-bold text-brand-blue mb-2">Animaux</h3>
              <p className="text-3xl font-bold text-brand-text">{animals.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-blue"
            >
              <Package className="text-brand-blue mb-4" size={32} />
              <h3 className="text-lg font-bold text-brand-blue mb-2">Lots</h3>
              <p className="text-3xl font-bold text-brand-text">{batches.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-red"
            >
              <Activity className="text-brand-red mb-4" size={32} />
              <h3 className="text-lg font-bold text-brand-blue mb-2">Aliments</h3>
              <p className="text-3xl font-bold text-brand-text">{feed.length}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Farm Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-blue mb-8">Informations de la ferme</h2>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-3">
                <MapPin size={24} className="text-brand-green mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-blue mb-1">Localisation</h4>
                  <p className="text-gray-600">{farm.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp size={24} className="text-brand-green mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-blue mb-1">Superficie</h4>
                  <p className="text-gray-600">{farm.area} hectares</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User size={24} className="text-brand-green mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-blue mb-1">Propriétaire</h4>
                  <p className="text-gray-600">{farm.ownerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={24} className="text-brand-green mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-blue mb-1">Téléphone</h4>
                  <p className="text-gray-600">{farm.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batches */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-blue mb-8">Lots d'animaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{batch.name}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Espèce:</span> {batch.species}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Quantité:</span> {batch.quantity}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-bold">Date de début:</span> {new Date(batch.startDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    batch.status === 'ACTIVE' ? 'bg-green-100 text-brand-green' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {batch.status === 'ACTIVE' ? 'Actif' : 'Terminé'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-blue mb-8">Animaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {animals.map((animal, index) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{animal.tagNumber}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Race:</span> {animal.breed}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Sexe:</span> {animal.gender === 'MALE' ? 'Mâle' : 'Femelle'}
                  </p>
                  {animal.weight && (
                    <p className="text-gray-600 mb-4">
                      <span className="font-bold">Poids:</span> {animal.weight} kg
                    </p>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    animal.status === 'SAIN' ? 'bg-green-100 text-brand-green' :
                    animal.status === 'MALADE' ? 'bg-red-100 text-brand-red' :
                    animal.status === 'QUARANTAINE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {animal.status === 'SAIN' ? 'Sain' :
                     animal.status === 'MALADE' ? 'Malade' :
                     animal.status === 'QUARANTAINE' ? 'Quarantaine' :
                     animal.status === 'VENDU' ? 'Vendu' : 'Décédé'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-blue mb-8">Aliments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {feed.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Type:</span> {item.type}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-bold">Quantité:</span> {item.quantity} {item.unit}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Date d'achat:</span> {new Date(item.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmDetail;
