// src/controllers/datasetController.js
import { parse } from 'csv-parse/sync';
import { pool } from '../config/db.js';

// Colonnes attendues dans le CSV (format type "Superstore") :
// Order Date, Ship Date, Region, Country, Category, Sub-Category,
// Product Name, Segment, Sales, Quantity, Discount, Profit
function parseCsvToRecords(csvText) {
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });

  return rows.map((row) => ({
    orderDate: row['Order Date'],
    shipDate: row['Ship Date'] || null,
    region: row['Region'] || null,
    country: row['Country'] || null,
    category: row['Category'] || null,
    subCategory: row['Sub-Category'] || null,
    productName: row['Product Name'] || null,
    customerSegment: row['Segment'] || null,
    sales: Number(row['Sales']),
    quantity: Number(row['Quantity']),
    discount: Number(row['Discount'] ?? 0),
    profit: Number(row['Profit']),
  }));
}

export async function listDatasets(req, res) {
  const result = await pool.query(
    'SELECT id, title, description, category, source, row_count, column_count, created_at FROM datasets WHERE owner_id = $1 ORDER BY created_at DESC',
    [req.user.id],
  );
  res.json(result.rows);
}

export async function uploadDataset(req, res) {
  const { title, description, category, source } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title est obligatoire' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Fichier CSV manquant' });
  }

  let records;
  try {
    records = parseCsvToRecords(req.file.buffer.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'CSV invalide ou mal formé' });
  }
  if (records.length === 0) {
    return res.status(400).json({ error: 'Le fichier CSV ne contient aucune ligne' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const datasetResult = await client.query(
      `INSERT INTO datasets (owner_id, title, description, category, source, row_count, column_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, category, source, row_count, column_count, created_at`,
      [req.user.id, title, description ?? null, category ?? null, source ?? null, records.length, 12],
    );
    const dataset = datasetResult.rows[0];

    for (const r of records) {
      await client.query(
        `INSERT INTO sales_records
           (dataset_id, order_date, ship_date, region, country, category, sub_category,
            product_name, customer_segment, sales, quantity, discount, profit)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [dataset.id, r.orderDate, r.shipDate, r.region, r.country, r.category, r.subCategory,
          r.productName, r.customerSegment, r.sales, r.quantity, r.discount, r.profit],
      );
    }

    await client.query('COMMIT');
    res.status(201).json(dataset);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
