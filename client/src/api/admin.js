// src/api/admin.js : espace administrateur
import { api } from './client.js';

export async function listUsers() {
  const res = await api.get('/admin/users');
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await api.patch(`/admin/users/${id}/role`, { role });
  return res.data;
}

export async function listAllDatasets() {
  const res = await api.get('/admin/datasets');
  return res.data;
}

export async function getPlatformStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}
