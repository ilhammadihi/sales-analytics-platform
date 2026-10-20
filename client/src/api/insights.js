// src/api/insights.js : fonctionnalités avancées (CdC section 9)
import { api } from './client.js';

export async function getOutliers(id, column) {
  const res = await api.get(`/datasets/${id}/insights/outliers`, { params: { column } });
  return res.data;
}

export async function getCorrelation(id, x, y) {
  const res = await api.get(`/datasets/${id}/insights/correlation`, { params: { x, y } });
  return res.data;
}

export async function getQualityScore(id) {
  const res = await api.get(`/datasets/${id}/insights/quality`);
  return res.data;
}
