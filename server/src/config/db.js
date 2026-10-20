// src/config/db.js : pool de connexions PostgreSQL
import pg from 'pg';
import 'dotenv/config';

const { Pool, types } = pg;

// Les colonnes DATE (OID 1082) sont renvoyées telles quelles ("2016-10-01"),
// sans les convertir en objet Date JS (qui applique le fuseau horaire local
// et décale la date affichée, ex: 23:00 la veille).
types.setTypeParser(1082, (value) => value);

// Les colonnes NUMERIC/DECIMAL (OID 1700, ex: sum(sales)::numeric) sont renvoyées
// en chaîne par défaut (pg évite les pertes de précision) : on les convertit en
// nombre JS, sinon des libs comme Recharts ne tracent rien (elles ignorent les
// valeurs texte sans erreur visible).
types.setTypeParser(1700, (value) => (value === null ? null : parseFloat(value)));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}
