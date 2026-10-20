import { Router } from 'express';
import multer from 'multer';
import { listDatasets, uploadDataset } from '../controllers/datasetController.js';
import { getDatasetStats, listRecords } from '../controllers/explorationController.js';
import { aggregateByGroup, summary, timeseries } from '../controllers/analysisController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { loadDataset } from '../middleware/loadDataset.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

export const datasetRoutes = Router();

// Réservé aux utilisateurs connectés : gestion de ses propres datasets
datasetRoutes.get('/', requireAuth, listDatasets);
datasetRoutes.post('/', requireAuth, upload.single('file'), uploadDataset);

// Auth optionnelle : un visiteur peut consulter un dataset lié à une analyse
// publique (loadDataset vérifie les droits), un utilisateur connecté le sien.
datasetRoutes.get('/:id', optionalAuth, loadDataset, getDatasetStats);
datasetRoutes.get('/:id/records', optionalAuth, loadDataset, listRecords);
datasetRoutes.get('/:id/analysis/summary', optionalAuth, loadDataset, summary);
datasetRoutes.get('/:id/analysis/aggregate', optionalAuth, loadDataset, aggregateByGroup);
datasetRoutes.get('/:id/analysis/timeseries', optionalAuth, loadDataset, timeseries);
