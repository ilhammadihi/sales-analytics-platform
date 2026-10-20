// src/api/datasets.js : appels API liés aux datasets (exploration + analyse)
import { api } from './client.js';

export async function listDatasets() {
  const res = await api.get('/datasets');
  return res.data;
}

export async function uploadDataset({ title, description, category, source, file }) {
  const form = new FormData();
  form.append('title', title);
  if (description) form.append('description', description);
  if (category) form.append('category', category);
  if (source) form.append('source', source);
  form.append('file', file);

  const res = await api.post('/datasets', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getDatasetStats(id) {
  const res = await api.get(`/datasets/${id}`);
  return res.data;
}

export async function listRecords(id, params) {
  const res = await api.get(`/datasets/${id}/records`, { params });
  return res.data;
}

export async function getSummary(id) {
  const res = await api.get(`/datasets/${id}/analysis/summary`);
  return res.data;
}

export async function getAggregate(id, { groupBy, metric, agg }) {
  const res = await api.get(`/datasets/${id}/analysis/aggregate`, { params: { groupBy, metric, agg } });
  return res.data;
}

export async function getTimeseries(id, { metric, agg }) {
  const res = await api.get(`/datasets/${id}/analysis/timeseries`, { params: { metric, agg } });
  return res.data;
}
