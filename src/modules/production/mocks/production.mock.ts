
import { ProductionLot, ProductionStep, QualityStatus } from '../types';
import pouletEntierImg from '../../products/assets/poulet-entier.jpeg';
import cuissePouletImg from '../../products/assets/cuisse-poulet.jpeg';
import blancPouletImg from '../../products/assets/blanc-poulet.jpeg';
import merguezImg from '../../products/assets/merguez.jpeg';
import { MOCK_LOTS } from '../../elevage/mocks/lots.mock';

// Create mock products similar to MOCK_PRODUCTS
const MOCK_PRODUCTS = [
  { id: '1', name: 'Poulet entier', image: pouletEntierImg, category: '1', price: 2600, description: 'Poulet entier frais de qualité supérieure.', availability: true, unit: 'Sachet' },
  { id: '3', name: 'Cuisse de poulet', image: cuissePouletImg, category: '2', price: 2200, description: '3 à 4 cuisses par sachet.', availability: true, unit: 'Sachet' },
  { id: '5', name: 'Blanc de poulet', image: blancPouletImg, category: '2', price: 6000, description: 'Tranches de poitrine de poulet sans os.', availability: true, unit: 'Sachet' },
  { id: '9', name: 'Merguez', image: merguezImg, category: '3', price: 6000, description: '500 grammes.', availability: true, unit: 'kg' },
];

export const MOCK_PRODUCTION_LOTS: ProductionLot[] = [
  {
    id: 'prod1',
    elevageLotId: '3',
    elevageLotNumber: 'LOT-2024-0401',
    product: MOCK_PRODUCTS[0],
    quantity: 150,
    weight: 450,
    dateFabrication: '2024-07-18',
    dateLimite: '2024-07-28',
    responsible: 'Koffi Mensah',
    status: ProductionStep.STOCK,
    qualityStatus: QualityStatus.PASSED,
    history: [
      { id: 'h1', date: '2024-07-18', time: '08:00', step: ProductionStep.RECEPTION, responsible: 'Koffi Mensah', comment: 'Réception du lot depuis l\'élevage' },
      { id: 'h2', date: '2024-07-18', time: '10:00', step: ProductionStep.ABATTAGE, responsible: 'Amadou Koné', comment: 'Abattage effectué' },
      { id: 'h3', date: '2024-07-18', time: '14:00', step: ProductionStep.DECOUPE, responsible: 'Amadou Koné', comment: 'Découpe et préparation' },
      { id: 'h4', date: '2024-07-19', time: '09:00', step: ProductionStep.TRANSFORMATION, responsible: 'Awa Sy', comment: 'Transformation terminée' },
      { id: 'h5', date: '2024-07-19', time: '13:00', step: ProductionStep.CONDITIONNEMENT, responsible: 'Fatou Diop', comment: 'Conditionnement effectué' },
      { id: 'h6', date: '2024-07-20', time: '08:00', step: ProductionStep.CONTROLE_QUALITE, responsible: 'Moussa Sow', comment: 'Contrôle qualité validé' },
      { id: 'h7', date: '2024-07-20', time: '10:00', step: ProductionStep.STOCK, responsible: 'Moussa Sow', comment: 'Transfert vers stock' },
    ],
  },
  {
    id: 'prod2',
    elevageLotId: '1',
    elevageLotNumber: 'LOT-2024-0501',
    product: MOCK_PRODUCTS[1],
    quantity: 300,
    weight: 240,
    dateFabrication: '2024-07-20',
    dateLimite: '2024-07-30',
    responsible: 'Awa Sy',
    status: ProductionStep.CONTROLE_QUALITE,
    qualityStatus: QualityStatus.PENDING,
    history: [
      { id: 'h8', date: '2024-07-20', time: '09:00', step: ProductionStep.RECEPTION, responsible: 'Awa Sy', comment: 'Réception du lot depuis l\'élevage' },
      { id: 'h9', date: '2024-07-20', time: '11:00', step: ProductionStep.ABATTAGE, responsible: 'Amadou Koné', comment: 'Abattage effectué' },
      { id: 'h10', date: '2024-07-20', time: '14:00', step: ProductionStep.DECOUPE, responsible: 'Amadou Koné', comment: 'Découpe et préparation' },
      { id: 'h11', date: '2024-07-20', time: '16:00', step: ProductionStep.TRANSFORMATION, responsible: 'Awa Sy', comment: 'Transformation terminée' },
      { id: 'h12', date: '2024-07-21', time: '08:00', step: ProductionStep.CONDITIONNEMENT, responsible: 'Fatou Diop', comment: 'Conditionnement effectué' },
    ],
  },
  {
    id: 'prod3',
    elevageLotId: '2',
    elevageLotNumber: 'LOT-2024-0615',
    product: MOCK_PRODUCTS[2],
    quantity: 250,
    weight: 187.5,
    dateFabrication: '2024-07-21',
    dateLimite: '2024-07-31',
    responsible: 'Fatou Diop',
    status: ProductionStep.TRANSFORMATION,
    qualityStatus: QualityStatus.PENDING,
    history: [
      { id: 'h13', date: '2024-07-21', time: '08:30', step: ProductionStep.RECEPTION, responsible: 'Fatou Diop', comment: 'Réception du lot depuis l\'élevage' },
      { id: 'h14', date: '2024-07-21', time: '10:30', step: ProductionStep.ABATTAGE, responsible: 'Amadou Koné', comment: 'Abattage effectué' },
      { id: 'h15', date: '2024-07-21', time: '13:30', step: ProductionStep.DECOUPE, responsible: 'Amadou Koné', comment: 'Découpe et préparation' },
    ],
  },
];
