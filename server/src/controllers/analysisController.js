// src/controllers/analysisController.js : analyses agrégées (CdC section 6)
import { pool } from '../config/db.js';

const GROUPABLE_COLUMNS = ['region', 'country', 'category', 'sub_category', 'customer_segment'];
const METRICS = ['sales', 'quantity', 'discount', 'profit'];
const AGGREGATIONS = ['sum', 'avg', 'min', 'max'];

// Répartition / classement : une métrique agrégée par groupe (ex: ventes totales par région)
export async function aggregateByGroup(req, res) {
  const datasetId = req.dataset.id;
  const groupBy = req.query.groupBy;
  const metric = req.query.metric ?? 'sales';
  const agg = req.query.agg ?? 'sum';

  if (!GROUPABLE_COLUMNS.includes(groupBy)) {
    return res.status(400).json({ error: `groupBy doit être l'un de : ${GROUPABLE_COLUMNS.join(', ')}` });
  }
  if (!METRICS.includes(metric)) {
    return res.status(400).json({ error: `metric doit être l'un de : ${METRICS.join(', ')}` });
  }
  if (!AGGREGATIONS.includes(agg)) {
    return res.status(400).json({ error: `agg doit être l'un de : ${AGGREGATIONS.join(', ')}` });
  }

  const result = await pool.query(
    `SELECT ${groupBy} AS "group", ${agg}(${metric})::numeric(12,2) AS value, count(*) AS count
     FROM sales_records
     WHERE dataset_id = $1
     GROUP BY ${groupBy}
     ORDER BY value DESC`,
    [datasetId],
  );

  res.json({ groupBy, metric, agg, results: result.rows });
}

// Évolution dans le temps : métrique agrégée par mois
export async function timeseries(req, res) {
  const datasetId = req.dataset.id;
  const metric = req.query.metric ?? 'sales';
  const agg = req.query.agg ?? 'sum';

  if (!METRICS.includes(metric)) {
    return res.status(400).json({ error: `metric doit être l'un de : ${METRICS.join(', ')}` });
  }
  if (!AGGREGATIONS.includes(agg)) {
    return res.status(400).json({ error: `agg doit être l'un de : ${AGGREGATIONS.join(', ')}` });
  }

  const result = await pool.query(
    `SELECT to_char(date_trunc('month', order_date), 'YYYY-MM') AS period,
            ${agg}(${metric})::numeric(12,2) AS value
     FROM sales_records
     WHERE dataset_id = $1
     GROUP BY period
     ORDER BY period ASC`,
    [datasetId],
  );

  res.json({ metric, agg, results: result.rows });
}

// Vue d'ensemble rapide : les indicateurs clés (cartes KPI du dashboard)
export async function summary(req, res) {
  const datasetId = req.dataset.id;

  const result = await pool.query(
    `SELECT
       sum(sales)::numeric(12,2) AS total_sales,
       sum(profit)::numeric(12,2) AS total_profit,
       sum(quantity) AS total_quantity,
       count(DISTINCT region) AS region_count,
       count(*) AS order_count
     FROM sales_records WHERE dataset_id = $1`,
    [datasetId],
  );

  res.json(result.rows[0]);
}
