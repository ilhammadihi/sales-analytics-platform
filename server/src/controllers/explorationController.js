// src/controllers/explorationController.js : exploration d'un dataset (CdC section 5)
import { pool } from '../config/db.js';

const SORTABLE_COLUMNS = ['order_date', 'ship_date', 'region', 'country', 'category',
  'sub_category', 'product_name', 'customer_segment', 'sales', 'quantity', 'discount', 'profit'];

// Vue tabulaire : recherche, filtres, tri, pagination
export async function listRecords(req, res) {
  const datasetId = req.dataset.id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const sortBy = SORTABLE_COLUMNS.includes(req.query.sortBy) ? req.query.sortBy : 'order_date';
  const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

  const conditions = ['dataset_id = $1'];
  const params = [datasetId];

  if (req.query.category) {
    params.push(req.query.category);
    conditions.push(`category = $${params.length}`);
  }
  if (req.query.region) {
    params.push(req.query.region);
    conditions.push(`region = $${params.length}`);
  }
  if (req.query.q) {
    params.push(`%${req.query.q}%`);
    conditions.push(`product_name ILIKE $${params.length}`);
  }

  const whereClause = conditions.join(' AND ');

  const [rowsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM sales_records WHERE ${whereClause}
       ORDER BY ${sortBy} ${sortDir}
       LIMIT ${limit} OFFSET ${offset}`,
      params,
    ),
    pool.query(`SELECT count(*) FROM sales_records WHERE ${whereClause}`, params),
  ]);

  res.json({
    items: rowsResult.rows,
    total: Number(countResult.rows[0].count),
    page,
    limit,
  });
}

// Caractéristiques du dataset : types, valeurs manquantes, statistiques descriptives
export async function getDatasetStats(req, res) {
  const datasetId = req.dataset.id;

  const result = await pool.query(
    `SELECT
       count(*) AS row_count,
       count(*) FILTER (WHERE region IS NULL) AS missing_region,
       count(*) FILTER (WHERE category IS NULL) AS missing_category,
       count(*) FILTER (WHERE customer_segment IS NULL) AS missing_segment,
       count(*) FILTER (WHERE ship_date IS NULL) AS missing_ship_date,
       avg(sales)::numeric(12,2) AS sales_avg,
       min(sales)::numeric(12,2) AS sales_min,
       max(sales)::numeric(12,2) AS sales_max,
       stddev(sales)::numeric(12,2) AS sales_stddev,
       avg(profit)::numeric(12,2) AS profit_avg,
       min(profit)::numeric(12,2) AS profit_min,
       max(profit)::numeric(12,2) AS profit_max,
       avg(discount)::numeric(12,4) AS discount_avg,
       avg(quantity)::numeric(12,2) AS quantity_avg
     FROM sales_records WHERE dataset_id = $1`,
    [datasetId],
  );

  res.json({
    dataset: {
      id: req.dataset.id,
      title: req.dataset.title,
      category: req.dataset.category,
      rowCount: req.dataset.row_count,
      columnCount: req.dataset.column_count,
    },
    columns: [
      { name: 'order_date', type: 'date' },
      { name: 'ship_date', type: 'date' },
      { name: 'region', type: 'text' },
      { name: 'country', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'sub_category', type: 'text' },
      { name: 'product_name', type: 'text' },
      { name: 'customer_segment', type: 'text' },
      { name: 'sales', type: 'numeric' },
      { name: 'quantity', type: 'integer' },
      { name: 'discount', type: 'numeric' },
      { name: 'profit', type: 'numeric' },
    ],
    stats: result.rows[0],
  });
}
