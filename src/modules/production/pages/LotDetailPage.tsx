import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Package, Activity, CheckCircle2, ShieldCheck, Tag, Box, AlertTriangle, Wind, XCircle } from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionLot } from '../types';
import { ProductionStatusBadge } from '../components/ProductionStatusBadge';

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
    { status: 'Lot reçu', label: 'Réception', active: lot.status === 'Lot reçu' || (lot.history && lot.history.some(h => h.step === 'Lot reçu')) },
    { status: "En attente d'abattage", label: 'Attente Abattage', active: lot.status === "En attente d'abattage" || (lot.history && lot.history.some(h => h.step === "En attente d'abattage")) },
    { status: 'Abattage terminé', label: 'Abattage', active: lot.status === 'Abattage terminé' || (lot.history && lot.history.some(h => h.step === 'Abattage terminé')) },
    { status: 'Découpe terminée', label: 'Découpe', active: lot.status === 'Découpe terminée' || (lot.history && lot.history.some(h => h.step === 'Découpe terminée')) },
    { status: 'Transformation', label: 'Transformation', active: lot.status === 'Transformation' || (lot.history && lot.history.some(h => h.step === 'Transformation')) },
    { status: 'Conditionnement', label: 'Conditionnement', active: lot.status === 'Conditionnement' || (lot.history && lot.history.some(h => h.step === 'Conditionnement')) },
    { status: 'Contrôle qualité', label: 'Contrôle Qualité', active: lot.status === 'Contrôle qualité' || (lot.history && lot.history.some(h => h.step === 'Contrôle qualité')) },
    { status: 'Produit terminé', label: 'Produit Terminé', active: lot.status === 'Produit terminé' || (lot.history && lot.history.some(h => h.step === 'Produit terminé')) },
    { status: 'En stock', label: 'En Stock', active: lot.status === 'En stock' },
  ];

  const renderQualityIcon = (val: string) => {
     if (val === 'CONFORME') return <CheckCircle2 size={16} className="text-brand-green" />;
     if (val === 'A_SURVEILLER') return <AlertTriangle size={16} className="text-yellow-600" />;
     return <XCircle size={16} className="text-brand-red" />;
  };

  const getQualityColor = (val: string) => {
     if (val === 'CONFORME') return 'text-brand-green font-bold';
     if (val === 'A_SURVEILLER') return 'text-yellow-600 font-bold';
     return 'text-brand-red font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/production/lots-recus" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-brand-text dark:text-white">{lot.name}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Lot Élevage: {lot.elevageLotNumber} • Responsable: {lot.responsible}</p>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Quantité</p>
              <p className="text-2xl font-bold text-brand-text dark:text-white">{lot.quantity}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Poids</p>
              <p className="text-2xl font-bold text-brand-text dark:text-white">{lot.weight ? lot.weight.toFixed(1) : 0} kg</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Date Fabrication</p>
              <p className="text-2xl font-bold text-brand-text dark:text-white">{lot.dateFabrication}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 flex flex-col justify-center">
           <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Statut Actuel</p>
           <ProductionStatusBadge status={lot.status} />
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Progression du Workflow</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                step.active
                  ? 'bg-green-50 border-brand-green/30 text-brand-green shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 opacity-70'
              }`}
            >
              <CheckCircle2 size={18} className={step.active ? 'text-brand-green' : 'text-gray-300'} />
              <div>
                <p className="text-xs font-bold">{step.label}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">{step.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abattage Details */}
        {lot.slaughterDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4 border-b pb-2">Détails Abattage</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Date/Heure</span><span className="font-semibold text-sm bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">{lot.slaughterDetails.date} • {lot.slaughterDetails.time}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Quantité Reçue</span><span className="font-semibold text-sm">{lot.slaughterDetails.quantityReceived}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Quantité Abattue</span><span className="font-semibold text-sm">{lot.slaughterDetails.quantitySlaughtered}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Pertes / Morts</span><span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{lot.slaughterDetails.losses}</span></div>
              {lot.slaughterDetails.lossesReason && <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400 text-sm">Raison Pertes</span><span className="font-semibold text-sm">{lot.slaughterDetails.lossesReason}</span></div>}
              {lot.slaughterDetails.observations && <div><span className="text-gray-500 dark:text-slate-400 text-sm block mb-1">Observations</span><p className="text-sm text-gray-600 dark:text-slate-300 italic bg-gray-50 dark:bg-slate-800 p-2 rounded">{lot.slaughterDetails.observations}</p></div>}
            </div>
          </div>
        )}

        {/* Découpe Details */}
        {lot.cuttingDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4 border-b pb-2">Détails Découpe</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Date</span><span className="font-semibold text-sm bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">{lot.cuttingDetails.date}</span></div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Poulet Entier</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{lot.cuttingDetails.pieces.pouletEntier.weight} kg</p><p className="text-[10px] text-gray-400 dark:text-slate-500">{lot.cuttingDetails.pieces.pouletEntier.quantity} u</p></div>
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Cuisses</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{lot.cuttingDetails.pieces.cuisses.weight} kg</p><p className="text-[10px] text-gray-400 dark:text-slate-500">{lot.cuttingDetails.pieces.cuisses.quantity} u</p></div>
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Pilons</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{lot.cuttingDetails.pieces.pilons.weight} kg</p><p className="text-[10px] text-gray-400 dark:text-slate-500">{lot.cuttingDetails.pieces.pilons.quantity} u</p></div>
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Ailes</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{lot.cuttingDetails.pieces.ailes.weight} kg</p><p className="text-[10px] text-gray-400 dark:text-slate-500">{lot.cuttingDetails.pieces.ailes.quantity} u</p></div>
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Blancs</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{lot.cuttingDetails.pieces.blancs.weight} kg</p><p className="text-[10px] text-gray-400 dark:text-slate-500">{lot.cuttingDetails.pieces.blancs.quantity} u</p></div>
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold mb-1">Divers</p><p className="font-extrabold text-brand-text dark:text-white text-sm">{(lot.cuttingDetails.pieces.foies.weight + lot.cuttingDetails.pieces.gesiers.weight + lot.cuttingDetails.pieces.autres.weight).toFixed(1)} kg</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Transformation Details */}
        {lot.processingDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4 border-b pb-2">Détails Transformation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Produit</span><span className="font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded text-sm">{lot.processingDetails.productName}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Quantité Obtenue</span><span className="font-semibold text-sm">{lot.processingDetails.quantity} unités</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Poids Obtenu</span><span className="font-bold text-brand-green text-sm">{lot.processingDetails.weight} kg</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Date</span><span className="font-semibold text-sm">{lot.processingDetails.date}</span></div>
              {lot.processingDetails.observations && <div><span className="text-gray-500 dark:text-slate-400 text-sm block mb-1">Observations / Recette</span><p className="text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-2 rounded italic">{lot.processingDetails.observations}</p></div>}
            </div>
          </div>
        )}

        {/* Conditionnement Details */}
        {lot.packagingDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4 border-b pb-2 flex items-center gap-2"><Box size={20} className="text-brand-blue" /> Détails Conditionnement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Type Emballage</span><span className="font-semibold text-sm">{lot.packagingDetails.packagingType}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Nombre d'Emballages</span><span className="font-bold text-sm bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">{lot.packagingDetails.quantity}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Poids Total</span><span className="font-extrabold text-brand-green text-sm">{lot.packagingDetails.weight.toFixed(1)} kg</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Code Lot de Production</span><span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm border border-purple-100">{lot.packagingDetails.productionLotNumber}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Date</span><span className="font-semibold text-sm">{lot.packagingDetails.date}</span></div>
            </div>
          </div>
        )}

        {/* Qualité Details */}
        {lot.qualityDetails && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4 border-b pb-2 flex items-center gap-2"><ShieldCheck size={20} className="text-brand-green" /> Rapport Qualité</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-gray-500 dark:text-slate-400 text-sm">Verdict Global</span>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    lot.qualityDetails.conformity === 'CONFORME' ? 'bg-green-100 text-brand-green' : 
                    lot.qualityDetails.conformity === 'A_SURVEILLER' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-brand-red'
                 }`}>{lot.qualityDetails.conformity.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Visuel</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.visualControl)} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.visualControl)}`}>{lot.qualityDetails.visualControl.replace('_', ' ')}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Poids</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.weightControl)} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.weightControl)}`}>{lot.qualityDetails.weightControl.replace('_', ' ')}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Température</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.temperatureControl)} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.temperatureControl)}`}>{lot.qualityDetails.temperatureControl.replace('_', ' ')}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Olfactif</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.odorControl || 'N/A')} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.odorControl || 'N/A')}`}>{lot.qualityDetails.odorControl?.replace('_', ' ') || 'N/A'}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Emballage</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.packagingControl || 'N/A')} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.packagingControl || 'N/A')}`}>{lot.qualityDetails.packagingControl?.replace('_', ' ') || 'N/A'}</span></div></div>
                <div className="flex justify-between items-center"><span className="text-xs text-gray-500 dark:text-slate-400">Étiquetage</span><div className="flex items-center gap-1">{renderQualityIcon(lot.qualityDetails.labelControl || 'N/A')} <span className={`text-[10px] ${getQualityColor(lot.qualityDetails.labelControl || 'N/A')}`}>{lot.qualityDetails.labelControl?.replace('_', ' ') || 'N/A'}</span></div></div>
              </div>
              <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-slate-400 text-sm">Date</span><span className="font-semibold text-sm">{lot.qualityDetails.date}</span></div>
              {lot.qualityDetails.comments && <div><span className="text-gray-500 dark:text-slate-400 text-sm block mb-1">Commentaires</span><p className="text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 rounded italic">{lot.qualityDetails.comments}</p></div>}
            </div>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-brand-text dark:text-white mb-4">Historique de Traçabilité complet</h3>
        {(!lot.history || lot.history.length === 0) ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm">Aucun événement d'historique</p>
        ) : (
          <div className="space-y-4">
            {lot.history.map((h, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className="p-2.5 bg-brand-green/20 text-brand-green rounded-full mt-1">
                  <Activity size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                     <p className="text-sm font-bold text-brand-text dark:text-white uppercase">{h.step}</p>
                     <p className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-slate-800">{h.date} {h.time ? `à ${h.time}` : ''}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{h.comment}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-semibold">Réalisé par : {h.responsible}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LotDetailPage;
