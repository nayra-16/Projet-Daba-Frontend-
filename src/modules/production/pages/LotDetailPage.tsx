
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Activity, Package, User } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';
import { WorkflowTimeline } from '../../elevage/components/WorkflowTimeline';
import { WorkflowProgress } from '../../elevage/components/WorkflowProgress';

export const LotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lot, setLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadLot = async () => {
        const data = await productionService.getLotById(id);
        setLot(data || null);
        setLoading(false);
      };
      loadLot();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-brand-green font-bold">Chargement du lot...</div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-bold text-lg">Lot non trouvé</p>
        </div>
      </div>
    );
  }

  // Workflow steps for production
  const workflowSteps = [
    { status: 'Lot reçu', label: 'Réception', active: lot.status === 'Lot reçu' || lot.history.some(h => h.step === 'Lot reçu') },
    { status: "En attente d'abattage", label: 'Attente Abattage', active: lot.status === "En attente d'abattage" || lot.history.some(h => h.step === "En attente d'abattage") },
    { status: 'Abattage terminé', label: 'Abattage', active: lot.status === 'Abattage terminé' || lot.history.some(h => h.step === 'Abattage terminé') },
    { status: 'Découpe terminée', label: 'Découpe', active: lot.status === 'Découpe terminée' || lot.history.some(h => h.step === 'Découpe terminée') },
    { status: 'Transformation', label: 'Transformation', active: lot.status === 'Transformation' || lot.history.some(h => h.step === 'Transformation') },
    { status: 'Conditionnement', label: 'Conditionnement', active: lot.status === 'Conditionnement' || lot.history.some(h => h.step === 'Conditionnement') },
    { status: 'Contrôle qualité', label: 'Contrôle Qualité', active: lot.status === 'Contrôle qualité' || lot.history.some(h => h.step === 'Contrôle qualité') },
    { status: 'Produit terminé', label: 'Produit Terminé', active: lot.status === 'Produit terminé' || lot.history.some(h => h.step === 'Produit terminé') },
    { status: 'En stock', label: 'En Stock', active: lot.status === 'En stock' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/production/lots-recus" className="p-2 rounded-lg hover:bg-gray-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-brand-text">{lot.name}</h2>
          <p className="text-sm text-gray-500">Lot Élevage: {lot.elevageLotNumber} • Responsable: {lot.responsible}</p>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantité</p>
              <p className="text-2xl font-bold text-brand-text">{lot.quantity}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Poids</p>
              <p className="text-2xl font-bold text-brand-text">{lot.weight.toFixed(1)} kg</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Fabrication</p>
              <p className="text-2xl font-bold text-brand-text">{lot.dateFabrication}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <ProductionStatusBadge status={lot.status} />
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-brand-text mb-4">Progression du Workflow</h3>
        <WorkflowProgress steps={workflowSteps} currentStatus={lot.status} />
      </div>

      {/* Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abattage Details */}
        {lot.slaughterDetails && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-brand-text mb-4">Détails Abattage</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Date/Heure</span><span className="font-semibold">{lot.slaughterDetails.date} • {lot.slaughterDetails.time}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantité Reçue</span><span className="font-semibold">{lot.slaughterDetails.quantityReceived}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantité Abattue</span><span className="font-semibold">{lot.slaughterDetails.quantitySlaughtered}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pertes</span><span className="font-semibold text-red-600">{lot.slaughterDetails.losses}</span></div>
              {lot.slaughterDetails.lossesReason && <div className="flex justify-between"><span className="text-gray-500">Raison Pertes</span><span className="font-semibold">{lot.slaughterDetails.lossesReason}</span></div>}
              {lot.slaughterDetails.observations && <div><span className="text-gray-500">Observations</span><p className="text-sm text-gray-600">{lot.slaughterDetails.observations}</p></div>}
            </div>
          </div>
        )}

        {/* Découpe Details */}
        {lot.cuttingDetails && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-brand-text mb-4">Détails Découpe</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{lot.cuttingDetails.date}</span></div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Poulet Entier</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.pouletEntier.quantity} ({lot.cuttingDetails.pieces.pouletEntier.weight}kg)</p></div>
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Cuisses</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.cuisses.quantity} ({lot.cuttingDetails.pieces.cuisses.weight}kg)</p></div>
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Pilons</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.pilons.quantity} ({lot.cuttingDetails.pieces.pilons.weight}kg)</p></div>
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Ailes</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.ailes.quantity} ({lot.cuttingDetails.pieces.ailes.weight}kg)</p></div>
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Blancs</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.blancs.quantity} ({lot.cuttingDetails.pieces.blancs.weight}kg)</p></div>
                <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Foies</p><p className="font-bold text-brand-text">{lot.cuttingDetails.pieces.foies.quantity} ({lot.cuttingDetails.pieces.foies.weight}kg)</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Transformation Details */}
        {lot.processingDetails && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-brand-text mb-4">Détails Transformation</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Produit</span><span className="font-semibold">{lot.processingDetails.productName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantité</span><span className="font-semibold">{lot.processingDetails.quantity}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Poids</span><span className="font-semibold">{lot.processingDetails.weight} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{lot.processingDetails.date}</span></div>
              {lot.processingDetails.observations && <div><span className="text-gray-500">Observations</span><p className="text-sm text-gray-600">{lot.processingDetails.observations}</p></div>}
            </div>
          </div>
        )}

        {/* Conditionnement Details */}
        {lot.packagingDetails && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-brand-text mb-4">Détails Conditionnement</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Type Emballage</span><span className="font-semibold">{lot.packagingDetails.packagingType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantité</span><span className="font-semibold">{lot.packagingDetails.quantity}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Poids</span><span className="font-semibold">{lot.packagingDetails.weight} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lot Production</span><span className="font-bold text-brand-green">{lot.packagingDetails.productionLotNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{lot.packagingDetails.date}</span></div>
            </div>
          </div>
        )}

        {/* Qualité Details */}
        {lot.qualityDetails && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-brand-text mb-4">Détails Contrôle Qualité</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Conformité</span><span className={`font-bold ${lot.qualityDetails.conformity === 'CONFORME' ? 'text-brand-green' : 'text-red-600'}`}>{lot.qualityDetails.conformity}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contrôle Visuel</span><span className={`font-semibold ${lot.qualityDetails.visualControl === 'CONFORME' ? 'text-brand-green' : 'text-red-600'}`}>{lot.qualityDetails.visualControl}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contrôle Poids</span><span className={`font-semibold ${lot.qualityDetails.weightControl === 'CONFORME' ? 'text-brand-green' : 'text-red-600'}`}>{lot.qualityDetails.weightControl}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contrôle Température</span><span className={`font-semibold ${lot.qualityDetails.temperatureControl === 'CONFORME' ? 'text-brand-green' : 'text-red-600'}`}>{lot.qualityDetails.temperatureControl}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{lot.qualityDetails.date}</span></div>
              {lot.qualityDetails.comments && <div><span className="text-gray-500">Commentaires</span><p className="text-sm text-gray-600">{lot.qualityDetails.comments}</p></div>}
            </div>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-brand-text mb-4">Historique des Événements</h3>
        <WorkflowTimeline history={lot.history} />
      </div>
    </div>
  );
};
