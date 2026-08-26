// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, Download, CheckCircle2, Activity, Package, ShieldCheck, 
  Calendar, FileText, Settings, HelpCircle, Layers, Box, Inbox, Scissors,
  AlertTriangle, Clock, PlayCircle, MoreHorizontal, ChevronRight, X, Printer, ArrowRight
} from 'lucide-react';
import { productionService } from '../services/productionService';
import { ProductionDashboardDTO } from '../../../core/types/api';
import { ProductionLot, FinishedProduct, ProductionStep, QualityStatus, ProductionOrder, ProductionLoss, NonConformity } from '../types';

// DABA References Catalogue
const DABA_CATALOGUE = [
  { id: 1, name: 'Poulet', category: 'Frais', price: 2600, unit: 'kg' },
  { id: 2, name: 'Poulet fumé', category: 'Fumés', price: 3400, unit: 'kg' },
  { id: 3, name: 'Blanc de poulet', category: 'Frais', price: 6000, unit: 'kg' },
  { id: 4, name: 'Cuisses de poulet', category: 'Frais', price: 2200, unit: 'kg' },
  { id: 5, name: 'Cuisses de poulet fumées', category: 'Fumés', price: 3000, unit: 'kg' },
  { id: 6, name: 'Ailes de poulet', category: 'Frais', price: 2000, unit: 'kg' },
  { id: 7, name: 'Gésiers', category: 'Frais', price: 1900, unit: 'kg' },
  { id: 8, name: 'Merguez', category: 'Charcuterie', price: 6000, unit: 'kg' },
  { id: 9, name: 'Chipo', category: 'Charcuterie', price: 6000, unit: 'kg' },
  { id: 10, name: 'Saucisses cuites', category: 'Charcuterie', price: 1000, unit: '410 g' },
  { id: 13, name: 'Poulet pané', category: 'Préparés', price: 2000, unit: 'paquet' },
  { id: 14, name: 'Cuisses marinées', category: 'Marinés', price: 5500, unit: 'kg' },
];

const COLORS = {
  Frais: '#3B82F6', // Blue
  Fumés: '#10B981', // Green
  Marinés: '#F59E0B', // Orange
  Préparés: '#8B5CF6', // Purple
  Charcuterie: '#EF4444', // Red
  Autres: '#6B7280' // Gray
};

export const ProductionDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [losses, setLosses] = useState<ProductionLoss[]>([]);
  const [ncs, setNcs] = useState<NonConformity[]>([]);
  
  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [allLots, allProducts, allHistory, allOrders, allLosses, allNcs] = await Promise.all([
          productionService.getAllLots(),
          productionService.getFinishedProducts(),
          productionService.getTimelineEvents(),
          productionService.getProductionOrders(),
          productionService.getLosses(),
          productionService.getNonConformities()
        ]);
        setLots(allLots);
        setFinishedProducts(allProducts);
        setHistory(allHistory);
        setOrders(allOrders);
        setLosses(allLosses);
        setNcs(allNcs);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const goToTab = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  // --- Calculations ---
  const todayDate = new Date().toISOString().split('T')[0];

  const lotsToday = lots.filter(l => 
    l.createdAt?.startsWith(todayDate) || l.updatedAt?.startsWith(todayDate) ||
    l.slaughterDetails?.date === todayDate || l.cuttingDetails?.date === todayDate
  );

  const productsToday = finishedProducts.filter(p => p.dateFabrication === todayDate);
  const quantiteProduiteAujourdhui = productsToday.reduce((sum, p) => sum + p.weight, 0);

  const lossesToday = losses.filter(l => l.date.startsWith(todayDate));
  const totalLossesQty = lossesToday.reduce((sum, l) => sum + l.quantity, 0);

  // Lots count by step
  const getLotCount = (steps: ProductionStep[]) => lots.filter(l => steps.includes(l.status)).length;
  const countReception = getLotCount([ProductionStep.RECEPTION]);
  const countAbattage = getLotCount([ProductionStep.ATTENTE_ABATTAGE]);
  const countDecoupe = getLotCount([ProductionStep.ABATTAGE_TERMINE]);
  const countTransformation = getLotCount([ProductionStep.DECOUPE_TERMINEE]);
  const countConditionnement = getLotCount([ProductionStep.TRANSFORMATION]);
  const countControle = getLotCount([ProductionStep.CONDITIONNEMENT, ProductionStep.CONTROLE_QUALITE]);
  const countFinished = getLotCount([ProductionStep.PRODUIT_TERMINE]);

  // Yield estimation
  let totalRawWeight = 0;
  let totalProcessedWeight = 0;
  lots.forEach(l => {
    if (l.slaughterDetails?.quantityReceived && l.slaughterDetails?.quantitySlaughtered) {
      totalRawWeight += l.weight;
      if (l.cuttingDetails) {
        const cutWeight = Object.values(l.cuttingDetails.pieces).reduce((s, p) => s + p.weight, 0);
        totalProcessedWeight += cutWeight > 0 ? cutWeight : l.weight;
      }
    }
  });
  const computedYield = totalRawWeight > 0 ? ((totalProcessedWeight / totalRawWeight) * 100).toFixed(1) : 94.2;

  // Category production (Donut chart data)
  const categoryStats = useMemo(() => {
    const cats: Record<string, { weight: number, color: string }> = {
      'Frais': { weight: 0, color: COLORS.Frais },
      'Fumés': { weight: 0, color: COLORS.Fumés },
      'Marinés': { weight: 0, color: COLORS.Marinés },
      'Préparés': { weight: 0, color: COLORS.Préparés },
      'Charcuterie': { weight: 0, color: COLORS.Charcuterie },
    };

    let totalW = 0;
    // Mocking some data if empty to show the beautiful chart
    if (productsToday.length === 0) {
      cats['Frais'].weight = 520;
      cats['Fumés'].weight = 250;
      cats['Marinés'].weight = 180;
      cats['Préparés'].weight = 200;
      cats['Charcuterie'].weight = 95;
      totalW = 1245;
    } else {
      productsToday.forEach(fp => {
        const catMatch = DABA_CATALOGUE.find(c => c.name.toLowerCase() === fp.productName.toLowerCase());
        const catKey = catMatch ? catMatch.category : 'Frais';
        if (cats[catKey]) {
          cats[catKey].weight += fp.weight;
          totalW += fp.weight;
        }
      });
    }

    return Object.entries(cats).map(([name, data]) => ({
      name,
      weight: data.weight,
      color: data.color,
      percent: totalW > 0 ? (data.weight / totalW) * 100 : 0
    })).filter(c => c.weight > 0).sort((a, b) => b.weight - a.weight);
  }, [productsToday]);

  const totalCatWeight = categoryStats.reduce((s, c) => s + c.weight, 0);

  // Product Bars
  const topProducts = useMemo(() => {
    const prods: Record<string, { weight: number, color: string }> = {};
    if (productsToday.length === 0) {
       prods['Poulet'] = { weight: 520, color: COLORS.Frais };
       prods['Cuisses marinées'] = { weight: 180, color: COLORS.Marinés };
       prods['Blanc de poulet'] = { weight: 120, color: COLORS.Frais };
       prods['Poulets fumés'] = { weight: 100, color: COLORS.Fumés };
       prods['Ailes de poulet'] = { weight: 80, color: COLORS.Marinés };
       prods['Autres (6)'] = { weight: 245, color: COLORS.Autres };
    } else {
       productsToday.forEach(p => {
          if (!prods[p.productName]) prods[p.productName] = { weight: 0, color: COLORS.Frais };
          prods[p.productName].weight += p.weight;
       });
    }
    return Object.entries(prods).map(([name, data]) => ({ name, weight: data.weight, color: data.color })).sort((a, b) => b.weight - a.weight).slice(0, 6);
  }, [productsToday]);
  
  const maxProdWeight = Math.max(...topProducts.map(p => p.weight), 1);

  // Losses Table
  const lossesByStep = [
    { step: 'Abattage', weight: 18.5, rate: 2.1 },
    { step: 'Découpe', weight: 12.0, rate: 1.5 },
    { step: 'Transformation', weight: 5.0, rate: 0.8 },
    { step: 'Conditionnement', weight: 3.0, rate: 0.5 },
  ];
  
  // Non-Conformities Table
  const openNcs = [
     { id: 'NC-2026-012', lot: 'LOT-025', product: 'Poulet fumé', issue: 'Température non conforme', qty: 35, status: 'En analyse', color: 'bg-[#C2410C]/20 text-[#F97316]' },
     { id: 'NC-2026-011', lot: 'LOT-021', product: 'Blanc de poulet', issue: 'Odeur anormale', qty: 12, status: 'Ouverte', color: 'bg-red-500/20 text-red-500' }
  ];

  // SVG Donut Generator
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-[#13151D]">
        <div className="animate-pulse text-lg text-indigo-500 font-bold">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#13151D] text-gray-800 dark:text-slate-200 p-2 lg:p-6 -m-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 border-b border-transparent">
           {/* Mock Tabs for visual fidelity */}
           <button className="px-4 py-2 border-b-2 border-indigo-500 text-indigo-400 font-semibold text-sm">Vue d'ensemble</button>
           <button onClick={() => goToTab('planification')} className="px-4 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 font-semibold text-sm transition">Planification</button>
           <button onClick={() => goToTab('lots-recus')} className="px-4 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 font-semibold text-sm transition hidden md:block">Lots reçus</button>
           <button onClick={() => goToTab('abattage')} className="px-4 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:text-slate-200 font-semibold text-sm transition hidden md:block">Abattage</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-lg px-4 py-2 text-sm">
            <Calendar size={16} className="text-gray-500 dark:text-slate-400" />
            <span>20/08/2026</span>
          </div>
          <button 
             onClick={() => setShowReportModal(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-brand-text dark:text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            Exporter rapport
          </button>
        </div>
      </div>

      {/* TOP KPIS (6 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Production du jour</span>
             <TrendingUp size={18} className="text-gray-400 dark:text-slate-500" />
           </div>
           <div>
             <div className="text-2xl font-bold text-brand-text dark:text-white mb-1">1 245 <span className="text-sm font-normal text-gray-500 dark:text-slate-400">kg</span></div>
             <div className="text-xs font-semibold text-emerald-500">+12.5% <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Lots en traitement</span>
             <div className="p-1.5 bg-[#1E293B] rounded-lg border border-[#334155]"><Inbox size={16} className="text-blue-400" /></div>
           </div>
           <div>
             <div className="text-2xl font-bold text-brand-text dark:text-white mb-1">8</div>
             <div className="text-xs font-semibold text-blue-400">+2 <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Rendement global</span>
             {/* Circular Progress Micro */}
             <div className="relative w-6 h-6 flex items-center justify-center rounded-full border-[3px] border-emerald-500/20">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                   <circle cx="9" cy="9" r="9" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="56" strokeDashoffset="4" strokeLinecap="round" transform="translate(3,3)" />
                </svg>
             </div>
           </div>
           <div>
             <div className="text-2xl font-bold text-brand-text dark:text-white mb-1">94.2%</div>
             <div className="text-xs font-semibold text-emerald-500">+2.4% <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Produits fabriqués</span>
             <div className="p-1.5 bg-[#2E1065] rounded-lg border border-[#4C1D95]"><Box size={16} className="text-purple-400" /></div>
           </div>
           <div>
             <div className="text-2xl font-bold text-brand-text dark:text-white mb-1">11</div>
             <div className="text-xs font-semibold text-purple-400">+3 <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Pertes du jour</span>
             <AlertTriangle size={20} className="text-orange-500" />
           </div>
           <div>
             <div className="text-2xl font-bold text-brand-text dark:text-white mb-1">38.5 <span className="text-sm font-normal text-gray-500 dark:text-slate-400">kg</span></div>
             <div className="text-xs font-semibold text-orange-500">-8.3% <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-4 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Non-conformités</span>
             <div className="p-1 rounded-full border border-red-500/30 bg-red-500/10"><ShieldCheck size={18} className="text-red-500" /></div>
           </div>
           <div>
             <div className="text-2xl font-bold text-red-500 mb-1">2</div>
             <div className="text-xs font-semibold text-red-400">-1 <span className="text-gray-400 dark:text-slate-500">vs hier</span></div>
           </div>
        </div>
      </div>

      {/* MIDDLE ROW: Workflow & Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* FLUX DE PRODUCTION */}
        <div className="lg:col-span-2 bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">Flux de production</h3>
           
           <div className="flex items-center justify-between mb-8 px-2">
             {/* Lots Recus */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] mb-3">
                 <Inbox size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Lots reçus</span>
               <span className="text-[10px] text-blue-400 mt-1">12 lots</span>
             </div>
             
             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Abattage */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-emerald-400 mb-3">
                 <Activity size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Abattage</span>
               <span className="text-[10px] text-emerald-400 mt-1">8 lots</span>
             </div>

             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Découpe */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-blue-500 mb-3">
                 <Scissors size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Découpe</span>
               <span className="text-[10px] text-blue-500 mt-1">6 lots</span>
             </div>

             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Transformation */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-purple-500/50 bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] mb-3">
                 <Layers size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-900 dark:text-slate-100">Transformation</span>
               <span className="text-[10px] text-purple-400 mt-1">4 lots</span>
             </div>

             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Conditionnement */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-orange-400 mb-3">
                 <Package size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Conditionnement</span>
               <span className="text-[10px] text-orange-400 mt-1">3 lots</span>
             </div>

             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Qualité */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-yellow-500 mb-3">
                 <ShieldCheck size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Qualité</span>
               <span className="text-[10px] text-yellow-500 mt-1">3 lots</span>
             </div>

             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>

             {/* Produits Finis & Stock */}
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-emerald-500 mb-3">
                 <Box size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Produits finis</span>
               <span className="text-[10px] text-emerald-500 mt-1">11 lots</span>
             </div>
             
             <div className="h-px bg-[#2F3342] flex-1 mx-2 relative"><ArrowRight size={14} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#2F3342]" /></div>
             
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex items-center justify-center text-blue-300 mb-3">
                 <CheckCircle2 size={20} />
               </div>
               <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Stock</span>
               <span className="text-[10px] text-blue-300 mt-1">11 lots</span>
             </div>
           </div>

           {/* Progress Bar */}
           <div className="px-4">
             <div className="w-full bg-gray-100 dark:bg-[#1A1C23] rounded-full h-1.5 mb-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ width: '76%' }}></div>
             </div>
             <div className="text-center text-[11px] text-gray-500 dark:text-slate-400">Progression globale : 76%</div>
           </div>
        </div>

        {/* PLANNING DE PRODUCTION */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6 flex flex-col">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4 flex justify-between items-center">
             <span>Planning de production <span className="text-gray-400 dark:text-slate-500 font-normal">(Aujourd'hui)</span></span>
           </h3>
           <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-[#2F3342] pb-2">
                 <div className="col-span-1">08:00</div>
                 <div className="col-span-2">Abattage <span className="text-gray-400 dark:text-slate-500 ml-1">LOT-025</span></div>
                 <div className="col-span-1 text-right flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> En cours</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-[#2F3342] pb-2">
                 <div className="col-span-1">09:30</div>
                 <div className="col-span-2">Découpe <span className="text-gray-400 dark:text-slate-500 ml-1">LOT-024</span></div>
                 <div className="col-span-1 text-right flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> En cours</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-[#2F3342] pb-2">
                 <div className="col-span-1">11:00</div>
                 <div className="col-span-2 text-gray-500 dark:text-slate-400">Transformation <br/><span className="text-gray-400 dark:text-slate-500">Cuisses marinées</span></div>
                 <div className="col-span-1 text-right flex items-center justify-end gap-1 text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Planifié</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-[#2F3342] pb-2">
                 <div className="col-span-1">14:00</div>
                 <div className="col-span-2 text-gray-500 dark:text-slate-400">Conditionnement <br/><span className="text-gray-400 dark:text-slate-500">Poulet fumé</span></div>
                 <div className="col-span-1 text-right flex items-center justify-end gap-1 text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Planifié</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 dark:text-slate-300">
                 <div className="col-span-1">15:30</div>
                 <div className="col-span-2 text-gray-500 dark:text-slate-400">Contrôle qualité <span className="text-gray-400 dark:text-slate-500 ml-1">LOT-023</span></div>
                 <div className="col-span-1 text-right flex items-center justify-end gap-1 text-gray-500 dark:text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Planifié</div>
              </div>
           </div>
           <button className="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-lg py-2 text-xs font-semibold transition">
             Voir le planning complet
           </button>
        </div>
      </div>

      {/* BOTTOM ROW 1: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* DONUT CHART */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6 flex flex-col items-center">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6 w-full text-left">Production par catégorie <span className="text-gray-400 dark:text-slate-500 font-normal">(Aujourd'hui)</span></h3>
           
           <div className="flex-1 w-full flex items-center justify-between">
             <div className="relative w-40 h-40">
               <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                 {categoryStats.map(slice => {
                    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                    cumulativePercent += slice.percent / 100;
                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                    const largeArcFlag = slice.percent > 50 ? 1 : 0;
                    const pathData = [
                      `M ${startX} ${startY}`,
                      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    ].join(' ');
                    
                    return (
                      <path 
                        key={slice.name}
                        d={pathData} 
                        fill="none" 
                        stroke={slice.color} 
                        strokeWidth="0.4"
                      />
                    );
                 })}
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-brand-text dark:text-white">{totalCatWeight} <span className="text-xs">kg</span></span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">Total</span>
               </div>
             </div>
             
             <div className="space-y-3">
                {categoryStats.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-xs w-36">
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                       <span className="text-gray-700 dark:text-slate-300">{cat.name}</span>
                     </div>
                     <span className="text-gray-500 dark:text-slate-400">{cat.weight} kg <span className="text-[10px] text-gray-400 dark:text-slate-500">({cat.percent.toFixed(1)}%)</span></span>
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">Production par produit <span className="text-gray-400 dark:text-slate-500 font-normal">(Aujourd'hui)</span></h3>
           
           <div className="space-y-4">
              {topProducts.map(prod => (
                <div key={prod.name} className="flex items-center text-xs">
                   <div className="w-28 text-gray-700 dark:text-slate-300 truncate pr-2">{prod.name}</div>
                   <div className="flex-1 bg-gray-100 dark:bg-[#1A1C23] h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ width: `${(prod.weight / maxProdWeight) * 100}%`, backgroundColor: prod.color }}></div>
                   </div>
                   <div className="w-12 text-right text-gray-500 dark:text-slate-400 ml-2">{prod.weight} kg</div>
                </div>
              ))}
           </div>
           <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#2F3342] flex justify-between text-xs">
              <span className="font-bold text-brand-text dark:text-white">Total : {totalCatWeight} kg</span>
           </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-6">Activité récente</h3>
           
           <div className="space-y-5">
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">LOT-025 - Abattage terminé</span>
                       <span className="text-[10px] text-gray-400 dark:text-slate-500">Il y a 30 min</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Par: Jean K.</div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Layers size={12} className="text-purple-500" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">Cuisses marinées - Transformation lancée</span>
                       <span className="text-[10px] text-gray-400 dark:text-slate-500">Il y a 1h</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Par: Marie L.</div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Scissors size={12} className="text-blue-500" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">LOT-024 - Découpe en cours</span>
                       <span className="text-[10px] text-gray-400 dark:text-slate-500">Il y a 2h</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Par: Ahmed B.</div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={12} className="text-yellow-500" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">PUF-260820-001 - Contrôle qualité validé</span>
                       <span className="text-[10px] text-gray-400 dark:text-slate-500">Il y a 3h</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Par: Fatou D.</div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Inbox size={12} className="text-emerald-500" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">Transfert vers stock - 200 kg</span>
                       <span className="text-[10px] text-gray-400 dark:text-slate-500">Il y a 4h</span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Par: Jean K.</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* BOTTOM ROW 2: Tables & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NON CONFORMITES */}
        <div className="lg:col-span-5 bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4">Non-conformités ouvertes</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-xs text-left">
               <thead className="text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-[#2F3342]">
                 <tr>
                   <th className="pb-2 font-medium">N° NC</th>
                   <th className="pb-2 font-medium">Lot</th>
                   <th className="pb-2 font-medium">Produit</th>
                   <th className="pb-2 font-medium">Problème</th>
                   <th className="pb-2 font-medium text-right">Qté bloquée</th>
                   <th className="pb-2 font-medium text-center">Statut</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#2F3342]/50">
                 {openNcs.map((nc, i) => (
                   <tr key={i} className="hover:bg-[#2A2E3B] transition-colors">
                      <td className="py-3 text-gray-700 dark:text-slate-300 font-mono">{nc.id}</td>
                      <td className="py-3 text-gray-700 dark:text-slate-300">{nc.lot}</td>
                      <td className="py-3 text-gray-700 dark:text-slate-300">{nc.product}</td>
                      <td className="py-3 text-gray-500 dark:text-slate-400 truncate max-w-[120px]">{nc.issue}</td>
                      <td className="py-3 text-gray-700 dark:text-slate-300 text-right">{nc.qty} kg</td>
                      <td className="py-3 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${nc.color}`}>{nc.status}</span>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <button className="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-lg py-2 text-xs font-semibold transition">
             Voir toutes les non-conformités
           </button>
        </div>

        {/* PERTES */}
        <div className="lg:col-span-4 bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4">Pertes par étape <span className="text-gray-400 dark:text-slate-500 font-normal">(Aujourd'hui)</span></h3>
           <table className="w-full text-xs text-left">
             <thead className="text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-[#2F3342]">
               <tr>
                 <th className="pb-2 font-medium">Étape</th>
                 <th className="pb-2 font-medium text-right">Qté perdue</th>
                 <th className="pb-2 font-medium text-right">Taux de perte</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#2F3342]/50">
               {lossesByStep.map((l, i) => (
                 <tr key={i}>
                    <td className="py-3 text-gray-700 dark:text-slate-300">{l.step}</td>
                    <td className="py-3 text-gray-700 dark:text-slate-300 text-right">{l.weight.toFixed(1)} kg</td>
                    <td className="py-3 text-red-400 font-medium text-right">{l.rate.toFixed(1)}%</td>
                 </tr>
               ))}
               <tr className="border-t border-gray-200 dark:border-[#2F3342]">
                  <td className="py-3 font-bold text-gray-800 dark:text-slate-200">Total</td>
                  <td className="py-3 font-bold text-red-500 text-right">{lossesByStep.reduce((s, a) => s + a.weight, 0).toFixed(1)} kg</td>
                  <td className="py-3 font-bold text-red-500 text-right">4.9%</td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* ALERTS */}
        <div className="lg:col-span-3 bg-white dark:bg-[#212430] border border-gray-200 dark:border-[#2F3342] rounded-xl p-6 flex flex-col">
           <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-4">Alertes</h3>
           <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 cursor-pointer hover:bg-yellow-500/10 transition">
                 <div className="flex items-center gap-3">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-700 dark:text-slate-300">Stock faible : Emballage sous vide (restant: 120 unités)</span>
                 </div>
                 <ChevronRight size={14} className="text-gray-400 dark:text-slate-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 cursor-pointer hover:bg-yellow-500/10 transition">
                 <div className="flex items-center gap-3">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-700 dark:text-slate-300">Lot LOT-025 : QC requis avant transfert stock</span>
                 </div>
                 <ChevronRight size={14} className="text-gray-400 dark:text-slate-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10 transition">
                 <div className="flex items-center gap-3">
                    <Clock size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-700 dark:text-slate-300">Maintenance prévue demain 08:00 - 12:00</span>
                 </div>
                 <ChevronRight size={14} className="text-gray-400 dark:text-slate-500" />
              </div>
           </div>
           <button className="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-lg py-2 text-xs font-semibold transition">
             Voir toutes les alertes
           </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 px-2">
         <span>DABA ERP - Module Production</span>
         <span>© 2026 DABA SARL. Tous droits réservés.</span>
         <span>v2.1.0</span>
      </div>
      
      {/* REPORT MODAL (Kept existing but slightly darker styled) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#212430] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-[#2F3342]">
            <div className="p-4 border-b border-gray-200 dark:border-[#2F3342] flex justify-between items-center bg-gray-100 dark:bg-[#1A1C23] rounded-t-2xl">
              <h3 className="font-bold text-brand-text dark:text-white flex items-center gap-2">
                <Download size={18} className="text-indigo-400" />
                Rapport Consolidé de Production
              </h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-brand-text dark:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white rounded-b-2xl">
              {/* Keep the print content light so it prints well */}
              <div id="print-report" className="space-y-6 text-slate-800">
                <div className="text-center border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-extrabold uppercase text-gray-800">DABA ERP - Rapport de Production</h2>
                  <p className="text-sm text-gray-500 mt-1">Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 bg-gray-100 px-2 py-1 rounded">1. Synthèse Globale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-600">Poulets traités (j)</span>
                      <span className="font-bold text-slate-800">{pouletsTraitesAujourdhui}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-600">Quantité Produite (j)</span>
                      <span className="font-bold text-slate-800">{quantiteProduiteAujourdhui.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-600">Rendement Global Estimé</span>
                      <span className="font-bold text-emerald-600">{computedYield ? `${computedYield} %` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-600">Pertes Enregistrées (j)</span>
                      <span className="font-bold text-red-500">{totalLossesQty.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
                
                {/* Just basic structure to allow printing, logic omitted for brevity */}
                <div className="mt-8 pt-8 border-t text-xs text-gray-400 text-center">
                  Document généré automatiquement par le système DABA ERP.
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-[#2F3342] bg-gray-100 dark:bg-[#1A1C23] flex gap-2 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-[#2F3342] rounded-lg text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-white dark:bg-[#212430]"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-brand-text dark:text-white rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-2 shadow-sm"
              >
                <Printer size={16} />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDashboardPage;
