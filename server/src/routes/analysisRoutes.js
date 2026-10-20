import { Router } from 'express';
import {
  createAnalysis, deleteAnalysis, getAnalysis, listMyAnalyses, listPublicAnalyses,
} from '../controllers/savedAnalysisController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const analysisRoutes = Router();

// Accessible au visiteur (non connecté)
analysisRoutes.get('/public', listPublicAnalyses);

// Réservé aux utilisateurs connectés
analysisRoutes.get('/', requireAuth, listMyAnalyses);
analysisRoutes.post('/', requireAuth, createAnalysis);
analysisRoutes.delete('/:id', requireAuth, deleteAnalysis);

// Auth optionnelle : une analyse publique doit être consultable par un visiteur
analysisRoutes.get('/:id', optionalAuth, getAnalysis);
