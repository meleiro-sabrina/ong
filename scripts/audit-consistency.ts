import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

type Schema = Record<string, Set<string>>;

type ModuleAudit = {
  module: string;
  file: string;
  table: string;
  formDataKeys: string[];
  payloadKeys: string[];
  missingInDbFromFormData: string[];
  missingInDbFromPayload: string[];
  onlyInDbLikelyLegacy: string[];
};

function dbPath() {
  return path.join(process.cwd(), '.data', 'app.db');
}

async function readSchema(dbFile: string): Promise<Schema> {
  const db = await open({ filename: dbFile, driver: sqlite3.Database });
  const tables = (await db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )) as Array<{ name: string }>;

  const schema: Schema = {};
  for (const t of tables) {
    const cols = (await db.all(`PRAGMA table_info(${t.name})`)) as Array<{ name: string }>;
    schema[t.name] = new Set(cols.map((c) => c.name));
  }
  await db.close();
  return schema;
}

function extractObjectKeysFromUseState(source: string, varName: string): string[] {
  const idx = source.indexOf(`const [${varName},`);
  if (idx < 0) return [];
  const useStateIdx = source.indexOf('useState', idx);
  if (useStateIdx < 0) return [];
  const braceIdx = source.indexOf('{', useStateIdx);
  if (braceIdx < 0) return [];

  let depth = 0;
  let end = -1;
  for (let i = braceIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return [];
  const obj = source.slice(braceIdx + 1, end);

  const keys = new Set<string>();
  const re = /\n\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(obj))) {
    keys.add(m[1]);
  }
  return Array.from(keys).sort();
}

function extractPayloadKeys(source: string): string[] {
  const keys = new Set<string>();
  const payloadRe = /const\s+payload\s*=\s*\{/g;
  let m: RegExpExecArray | null;

  while ((m = payloadRe.exec(source))) {
    const start = payloadRe.lastIndex - 1;
    const braceIdx = source.indexOf('{', start);
    if (braceIdx < 0) continue;

    let depth = 0;
    let end = -1;
    for (let i = braceIdx; i < source.length; i++) {
      const ch = source[i];
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;

    const obj = source.slice(braceIdx + 1, end);
    const re = /\n\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
    let km: RegExpExecArray | null;
    while ((km = re.exec(obj))) {
      keys.add(km[1]);
    }
  }

  return Array.from(keys).sort();
}

function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function diffMissing(keys: string[], dbCols: Set<string>) {
  return keys.filter((k) => !dbCols.has(k)).sort();
}

async function main() {
  const schema = await readSchema(dbPath());

  const modules: Array<{ module: string; file: string; table: string; formVar?: string }> = [
    { module: 'Alunos', file: 'app/(app)/alunos/page.tsx', table: 'students', formVar: 'formData' },
    { module: 'Professores', file: 'app/(app)/professores/page.tsx', table: 'professors', formVar: 'formData' },
    { module: 'Voluntários', file: 'app/(app)/voluntarios/page.tsx', table: 'volunteers', formVar: 'formData' },
    { module: 'Doações', file: 'app/(app)/doacoes/page.tsx', table: 'donations', formVar: 'formData' },
    { module: 'Estoque', file: 'app/(app)/estoque/page.tsx', table: 'stock_items', formVar: 'formData' },
    { module: 'Turmas', file: 'app/(app)/turmas/page.tsx', table: 'classes', formVar: 'formData' },
    { module: 'Usuários', file: 'app/(app)/usuarios/page.tsx', table: 'users', formVar: 'formData' },
  ];

  const audits: ModuleAudit[] = [];

  for (const mod of modules) {
    const abs = path.join(process.cwd(), mod.file);
    const source = readFileSafe(abs);

    const dbCols = schema[mod.table] ?? new Set<string>();
    const formDataKeys = mod.formVar ? extractObjectKeysFromUseState(source, mod.formVar) : [];
    const payloadKeys = extractPayloadKeys(source);

    const missingInDbFromFormData = diffMissing(formDataKeys, dbCols);
    const missingInDbFromPayload = diffMissing(payloadKeys, dbCols);

    const onlyInDbLikelyLegacy = Array.from(dbCols)
      .filter((c) => !formDataKeys.includes(c) && !payloadKeys.includes(c))
      .filter((c) => !['id', 'createdAt', 'updatedAt'].includes(c))
      .sort();

    audits.push({
      module: mod.module,
      file: mod.file,
      table: mod.table,
      formDataKeys,
      payloadKeys,
      missingInDbFromFormData,
      missingInDbFromPayload,
      onlyInDbLikelyLegacy,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    dbFile: dbPath(),
    tables: Object.keys(schema).sort(),
    audits,
  };

  process.stdout.write(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  process.stderr.write(String(e?.stack || e?.message || e));
  process.exit(1);
});
