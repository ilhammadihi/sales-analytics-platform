// src/controllers/insightsController.js : fonctionnalités avancées (CdC section 9)
import { pool } from '../config/db.js';

const METRICS = ['sales', 'quantity', 'discount', 'profit'];
const CHECKED_COLUMNS = ['region', 'country', 'category', 'sub_category', 'customer_segment', 'product_name', 'ship_date'];

// 1. Détection de valeurs aberrantes (méthode IQR : 1.5x l'écart interquartile)
export async function detectOutliers(req, res) {
  const datasetId = req.dataset.id;
  const column = req.query.column ?? 'profit';

  if (!METRICS.includes(column)) {
    return res.status(400).json({ error: `column doit être l'un de : ${METRICS.join(', ')}` });
  }

  const boundsResult = await pool.query(
    `SELECT
       percentile_cont(0.25) WITHIN GROUP (ORDER BY ${column}) AS q1,
       percentile_cont(0.75) WITHIN GROUP (ORDER BY ${column}) AS q3
     FROM sales_records WHERE dataset_id = $1`,
    [datasetId],
  );
  const { q1, q3 } = boundsResult.rows[0];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliersResult = await pool.query(
    `SELECT id, order_date, region, category, product_name, sales, quantity, discount, profit,
            ABS(${column} - $2) AS deviation
     FROM sales_records
     WHERE dataset_id = $1 AND (${column} < $3 OR ${column} > $4)
     ORDER BY deviation DESC
     LIMIT 50`,
    [datasetId, (q1 + q3) / 2, lowerBound, upperBound],
  );

  const countResult = await pool.query(
    `SELECT count(*) FROM sales_records WHERE dataset_id = $1 AND (${column} < $2 OR ${column} > $3)`,
    [datasetId, lowerBound, upperBound],
  );

  res.json({
    column,
    q1,
    q3,
    lowerBound,
    upperBound,
    totalOutliers: Number(countResult.rows[0].count),
    sample: outliersResult.rows,
  });
}

// 2. Analyse de corrélation (coefficient de Pearson entre deux métriques)
export async function getCorrelation(req, res) {
  const datasetId = req.dataset.id;
  const x = req.query.x ?? 'discount';
  const y = req.query.y ?? 'profit';

  if (!METRICS.includes(x) || !METRICS.includes(y)) {
    return res.status(400).json({ error: `x et y doivent être l'un de : ${METRICS.join(', ')}` });
  }

  const result = await pool.query(
    `SELECT corr(${y}, ${x})::numeric(6,4) AS coefficient FROM sales_records WHERE dataset_id = $1`,
    [datasetId],
  );

  const coefficient = result.rows[0].coefficient;
  let strength = 'très faible';
  const abs = Math.abs(coefficient ?? 0);
  if (abs >= 0.7) strength = 'forte';
  else if (abs >= 0.4) strength = 'modérée';
  else if (abs >= 0.2) strength = 'faible';

  res.json({ x, y, coefficient, strength });
}

// 3. Score de qualité des données (taux de valeurs manquantes par colonne)
export async function getQualityScore(req, res) {
  const datasetId = req.dataset.id;

  const totalResult = await pool.query('SELECT count(*) AS total FROM sales_records WHERE dataset_id = $1', [datasetId]);
  const total = Number(totalResult.rows[0].total);

  if (total === 0) {
    return res.json({ total: 0, columns: [], score: 0 });
  }

  const selectParts = CHECKED_COLUMNS.map((col) => `count(*) FILTER (WHERE ${col} IS NULL) AS "${col}"`).join(', ');
  const result = await pool.query(
    `SELECT ${selectParts} FROM sales_records WHERE dataset_id = $1`,
    [datasetId],
  );
  const missingCounts = result.rows[0];

  const columns = CHECKED_COLUMNS.map((col) => {
    const missing = Number(missingCounts[col]);
    return { column: col, missing, missingRate: Number(((missing / total) * 100).toFixed(2)) };
  });

  const avgMissingRate = columns.reduce((sum, c) => sum + c.missingRate, 0) / columns.length;
  const score = Math.round(100 - avgMissingRate);

  res.json({ total, columns, score });
}
