// src/api/analyses.js : analyses sauvegardées (privées ou publiques)
import { api } from './client.js';

export async function saveAnalysis({ datasetId, title, config, isPublic }) {
  const res = await api.post('/analyses', { datasetId, title, config, isPublic });
  return res.data;
}

export async function listMyAnalyses() {
  const res = await api.get('/analyses');
  return res.data;
}

export async function listPublicAnalyses() {
  const res = await api.get('/analyses/public');
  return res.data;
}

export async function deleteAnalysis(id) {
  await api.delete(`/analyses/${id}`);
}
