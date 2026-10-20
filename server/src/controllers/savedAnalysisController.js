// src/controllers/savedAnalysisController.js : analyses sauvegardées (CdC section 8)
import { pool } from '../config/db.js';

export async function createAnalysis(req, res) {
  const { datasetId, title, config, isPublic } = req.body;

  if (!datasetId || !title || !config) {
    return res.status(400).json({ error: 'datasetId, title et config sont obligatoires' });
  }

  const dataset = await pool.query('SELECT id FROM datasets WHERE id = $1 AND owner_id = $2', [datasetId, req.user.id]);
  if (dataset.rows.length === 0) {
    return res.status(404).json({ error: 'Dataset introuvable' });
  }

  const result = await pool.query(
    `INSERT INTO analyses (owner_id, dataset_id, title, config, is_public)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dataset_id, title, config, is_public, created_at`,
    [req.user.id, datasetId, title, JSON.stringify(config), Boolean(isPublic)],
  );

  res.status(201).json(result.rows[0]);
}

export async function listMyAnalyses(req, res) {
  const result = await pool.query(
    `SELECT a.id, a.title, a.config, a.is_public, a.created_at,
            d.id AS dataset_id, d.title AS dataset_title
     FROM analyses a
     JOIN datasets d ON d.id = a.dataset_id
     WHERE a.owner_id = $1
     ORDER BY a.created_at DESC`,
    [req.user.id],
  );
  res.json(result.rows);
}

export async function listPublicAnalyses(req, res) {
  const result = await pool.query(
    `SELECT a.id, a.title, a.config, a.created_at,
            d.id AS dataset_id, d.title AS dataset_title,
            u.full_name AS owner_name
     FROM analyses a
     JOIN datasets d ON d.id = a.dataset_id
     JOIN users u ON u.id = a.owner_id
     WHERE a.is_public = true
     ORDER BY a.created_at DESC`,
  );
  res.json(result.rows);
}

export async function getAnalysis(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  const result = await pool.query(
    `SELECT a.*, d.title AS dataset_title
     FROM analyses a
     JOIN datasets d ON d.id = a.dataset_id
     WHERE a.id = $1`,
    [id],
  );
  const analysis = result.rows[0];
  if (!analysis) {
    return res.status(404).json({ error: 'Analyse introuvable' });
  }
  const isOwner = req.user != null && analysis.owner_id === req.user.id;
  const isAdmin = req.user != null && req.user.role === 'admin';
  if (!analysis.is_public && !isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Accès refusé à cette analyse' });
  }

  res.json(analysis);
}

export async function deleteAnalysis(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  const result = await pool.query('DELETE FROM analyses WHERE id = $1 AND owner_id = $2 RETURNING id', [id, req.user.id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Analyse introuvable' });
  }
  res.status(204).end();
}
