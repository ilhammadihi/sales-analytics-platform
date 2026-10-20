// src/app.js : configuration de l'application Express
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes.js';
import { datasetRoutes } from './routes/datasetRoutes.js';
import { analysisRoutes } from './routes/analysisRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/datasets', datasetRoutes);
app.use('/analyses', analysisRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});
