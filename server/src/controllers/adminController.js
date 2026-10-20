// src/controllers/adminController.js : espace administrateur (CdC section 10)
import { pool } from '../config/db.js';

const ASSIGNABLE_ROLES = ['analyst', 'admin'];

export async function listUsers(req, res) {
  const result = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
            count(DISTINCT d.id) AS dataset_count
     FROM users u
     LEFT JOIN datasets d ON d.owner_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
  );
  res.json(result.rows);
}

export async function updateUserRole(req, res) {
  const id = Number(req.params.id);
  const { role } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return res.status(400).json({ error: `role doit être l'un de : ${ASSIGNABLE_ROLES.join(', ')}` });
  }
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Tu ne peux pas changer ton propre rôle' });
  }

  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
    [role, id],
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  res.json(result.rows[0]);
}

export async function listAllDatasets(req, res) {
  const result = await pool.query(
    `SELECT d.id, d.title, d.category, d.row_count, d.created_at,
            u.full_name AS owner_name, u.email AS owner_email
     FROM datasets d
     JOIN users u ON u.id = d.owner_id
     ORDER BY d.created_at DESC`,
  );
  res.json(result.rows);
}

export async function getPlatformStats(req, res) {
  const [users, datasets, analyses, rows] = await Promise.all([
    pool.query(`SELECT count(*) AS total, count(*) FILTER (WHERE role = 'admin') AS admins,
                       count(*) FILTER (WHERE role = 'analyst') AS analysts
                FROM users`),
    pool.query('SELECT count(*) AS total FROM datasets'),
    pool.query(`SELECT count(*) AS total, count(*) FILTER (WHERE is_public) AS public_count FROM analyses`),
    pool.query('SELECT count(*) AS total FROM sales_records'),
  ]);

  res.json({
    users: users.rows[0],
    datasets: datasets.rows[0],
    analyses: analyses.rows[0],
    totalRows: rows.rows[0].total,
  });
}
