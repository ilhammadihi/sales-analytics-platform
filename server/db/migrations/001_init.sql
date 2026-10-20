-- 001_init.sql : schéma initial de la plateforme d'analyse de données (domaine Ventes/Retail)

CREATE TYPE user_role AS ENUM ('visitor', 'analyst', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jeux de données importés par les utilisateurs (CdC section 4)
CREATE TABLE datasets (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  source TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  column_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lignes brutes du dataset "Ventes" (une ligne = une commande du fichier Superstore)
CREATE TABLE sales_records (
  id SERIAL PRIMARY KEY,
  dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  ship_date DATE,
  region TEXT,
  country TEXT,
  category TEXT,
  sub_category TEXT,
  product_name TEXT,
  customer_segment TEXT,
  sales NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
  profit NUMERIC(12, 2) NOT NULL
);
CREATE INDEX idx_sales_records_dataset ON sales_records(dataset_id);
CREATE INDEX idx_sales_records_order_date ON sales_records(order_date);

-- Analyses sauvegardées (CdC section 8) : dataset + filtres + indicateurs + visualisations
CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  config JSONB NOT NULL, -- { filters, indicators, charts }
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tableaux de bord regroupant plusieurs analyses (CdC section 7)
CREATE TABLE dashboards (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]', -- disposition des widgets
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dashboard_analyses (
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  analysis_id INTEGER NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dashboard_id, analysis_id)
);
