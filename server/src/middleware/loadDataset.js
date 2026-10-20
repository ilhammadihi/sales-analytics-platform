// src/middleware/loadDataset.js : charge le dataset ciblé et vérifie les droits d'accès
import { pool } from '../config/db.js';

export async function loadDataset(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Identifiant de dataset invalide' });
  }

  const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [id]);
  const dataset = result.rows[0];
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset introuvable' });
  }

  const isOwner = req.user != null && dataset.owner_id === req.user.id;
  const isAdmin = req.user != null && req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    // Un dataset relié à au moins une analyse publique devient consultable par
    // tous les utilisateurs connectés (c'est le sens de "rendre public").
    const publicCheck = await pool.query(
      'SELECT 1 FROM analyses WHERE dataset_id = $1 AND is_public = true LIMIT 1',
      [id],
    );
    if (publicCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Accès refusé à ce dataset' });
    }
  }

  req.dataset = dataset;
  next();
}
