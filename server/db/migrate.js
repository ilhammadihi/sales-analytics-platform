// db/migrate.js : exécute les fichiers .sql de db/migrations/ dans l'ordre alphabétique
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../src/config/db.js';

const migrationsDir = path.join(import.meta.dirname, 'migrations');

async function run() {
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    console.log(`Exécution de ${file}...`);
    await pool.query(sql);
  }

  console.log(`${files.length} migration(s) appliquée(s).`);
  await pool.end();
}

run().catch((err) => {
  console.error('Erreur de migration :', err.message);
  process.exit(1);
});
