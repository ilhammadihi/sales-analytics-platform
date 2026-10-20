import { Router } from 'express';
import {
  getPlatformStats, listAllDatasets, listUsers, updateUserRole,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole('admin'));
adminRoutes.get('/users', listUsers);
adminRoutes.patch('/users/:id/role', updateUserRole);
adminRoutes.get('/datasets', listAllDatasets);
adminRoutes.get('/stats', getPlatformStats);
