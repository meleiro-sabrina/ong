import { getDb } from './sqlite';

export async function optimizeDatabase() {
  const db = await getDb();
  
  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA cache_size = 10000;
    PRAGMA temp_store = MEMORY;
    PRAGMA mmap_size = 268435456;
  `);
}

export async function vacuumDatabase() {
  const db = await getDb();
  await db.exec('VACUUM');
}

export async function analyzeDatabase() {
  const db = await getDb();
  await db.exec('ANALYZE');
}
