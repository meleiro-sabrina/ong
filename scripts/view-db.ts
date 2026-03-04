import { getDb } from './lib/server/sqlite';

async function viewDatabase() {
  const db = await getDb();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                   VISUALIZADOR DO BANCO                   ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Listar todas as tabelas
  console.log('📋 TABELAS DO BANCO:');
  console.log('───────────────────────────────────────────────────────────');
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  for (const table of tables) {
    const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
    console.log(`  • ${table.name.padEnd(25)} (${(count as any).count} registros)`);
  }

  // 2. Estrutura de cada tabela
  console.log('\n\n🔍 ESTRUTURA DAS TABELAS:');
  console.log('───────────────────────────────────────────────────────────');
  
  for (const table of tables) {
    console.log(`\n📦 ${table.name.toUpperCase()}:`);
    const columns = await db.all(`PRAGMA table_info(${table.name})`);
    for (const col of columns) {
      const nullable = (col as any).notnull ? 'NOT NULL' : 'NULL';
      const pk = (col as any).pk ? 'PRIMARY KEY' : '';
      console.log(`   ${(col as any).name.padEnd(20)} ${(col as any).type.padEnd(10)} ${nullable} ${pk}`);
    }
  }

  // 3. Amostra de dados de cada tabela (primeiros 3 registros)
  console.log('\n\n📊 AMOSTRA DE DADOS (3 primeiros registros de cada tabela):');
  console.log('───────────────────────────────────────────────────────────');

  const mainTables = ['users', 'students', 'professors', 'classes', 'volunteers', 'donations', 'stock_items'];
  
  for (const tableName of mainTables) {
    const tableExists = tables.find((t: any) => t.name === tableName);
    if (!tableExists) continue;

    console.log(`\n📦 ${tableName.toUpperCase()}:`);
    const rows = await db.all(`SELECT * FROM ${tableName} LIMIT 3`);
    
    if (rows.length === 0) {
      console.log('   (vazio)');
    } else {
      for (const row of rows) {
        console.log('   ───────────────────────────────────────────────────');
        for (const [key, value] of Object.entries(row)) {
          if (value !== null && value !== undefined) {
            const valStr = String(value).substring(0, 50);
            console.log(`   ${key.padEnd(15)}: ${valStr}`);
          }
        }
      }
    }
  }

  // 4. Resumo geral
  console.log('\n\n📈 RESUMO GERAL:');
  console.log('───────────────────────────────────────────────────────────');
  let totalRecords = 0;
  for (const table of tables) {
    const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
    const c = (count as any).count;
    totalRecords += c;
    console.log(`  ${table.name.padEnd(25)} ${String(c).padStart(6)} registros`);
  }
  console.log('  ─────────────────────────────────────────────────────────');
  console.log(`  ${'TOTAL'.padEnd(25)} ${String(totalRecords).padStart(6)} registros`);

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

viewDatabase().catch(console.error);
