import path from 'path';
import crypto from 'crypto';
import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';

let dbPromise: Promise<Database> | null = null;

function dbPath() {
  return path.join(process.cwd(), '.data', 'app.db');
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
  }
}

async function init(db: Database) {
  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      avatar TEXT,
      role TEXT NOT NULL,
      permissions TEXT,
      status TEXT NOT NULL CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      enrollment TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      birth TEXT,
      guardian TEXT,
      phone TEXT,
      avatar TEXT,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      professor TEXT NOT NULL,
      professor_substituto TEXT,
      schedule TEXT NOT NULL,
      startDate TEXT,
      endDate TEXT,
      costPerClass REAL,
      professorPaymentType TEXT,
      status TEXT NOT NULL CHECK(status IN ('active','suspended','ended')),
      currentStudents INTEGER NOT NULL DEFAULT 0,
      maxStudents INTEGER NOT NULL DEFAULT 20,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS class_enrollments (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      entryDate TEXT NOT NULL,
      exitDate TEXT,
      status TEXT NOT NULL CHECK(status IN ('active','removed')),
      UNIQUE(classId, studentId, status),
      FOREIGN KEY(classId) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      donor TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      method TEXT,
      status TEXT NOT NULL CHECK(status IN ('completed','pending')),
      campaign TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      hours INTEGER NOT NULL DEFAULT 0,
      avatar TEXT,
      status TEXT NOT NULL CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS professors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      cpf TEXT,
      birth TEXT,
      specialization TEXT NOT NULL,
      type TEXT NOT NULL,
      hourlyRate REAL,
      monthlySalary REAL,
      avatar TEXT,
      status TEXT NOT NULL CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      minQuantity INTEGER NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL CHECK(channel IN ('whatsapp','email')),
      audience TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      classId TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(classId) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      attendanceId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('P','F','J')),
      justification TEXT,
      PRIMARY KEY(attendanceId, studentId),
      FOREIGN KEY(attendanceId) REFERENCES attendance(id) ON DELETE CASCADE,
      FOREIGN KEY(studentId) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_class ON class_enrollments(classId);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(studentId);
    CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(classId, date);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
  `);

  // Lightweight migrations for existing local DBs.
  await ensureColumn(db, 'students', 'birth', 'TEXT');
  await ensureColumn(db, 'students', 'guardian', 'TEXT');
  await ensureColumn(db, 'students', 'phone', 'TEXT');
  await ensureColumn(db, 'students', 'avatar', 'TEXT');
  await ensureColumn(db, 'attendance_records', 'justification', 'TEXT');
  await ensureColumn(db, 'users', 'password', 'TEXT');
  await ensureColumn(db, 'users', 'avatar', 'TEXT');
  await ensureColumn(db, 'users', 'permissions', 'TEXT');
  await ensureColumn(db, 'professors', 'cpf', 'TEXT');
  await ensureColumn(db, 'professors', 'birth', 'TEXT');
  await ensureColumn(db, 'professors', 'hourlyRate', 'REAL');
  await ensureColumn(db, 'professors', 'monthlySalary', 'REAL');
  await ensureColumn(db, 'professors', 'avatar', 'TEXT');
  await ensureColumn(db, 'volunteers', 'avatar', 'TEXT');
  // New student fields
  await ensureColumn(db, 'students', 'relationship', 'TEXT');
  await ensureColumn(db, 'students', 'phone2', 'TEXT');
  await ensureColumn(db, 'students', 'cep', 'TEXT');
  await ensureColumn(db, 'students', 'street', 'TEXT');
  await ensureColumn(db, 'students', 'number', 'TEXT');
  await ensureColumn(db, 'students', 'complement', 'TEXT');
  await ensureColumn(db, 'students', 'neighborhood', 'TEXT');
  await ensureColumn(db, 'students', 'city', 'TEXT');
  await ensureColumn(db, 'students', 'state', 'TEXT');
  await ensureColumn(db, 'students', 'cpf', 'TEXT');
  await ensureColumn(db, 'students', 'rg', 'TEXT');
  await ensureColumn(db, 'students', 'guardianCpf', 'TEXT');
  await ensureColumn(db, 'students', 'guardianRg', 'TEXT');
  await ensureColumn(db, 'students', 'sexo', 'TEXT');
  await ensureColumn(db, 'students', 'rede', 'TEXT');
  await ensureColumn(db, 'students', 'turno', 'TEXT');
  await ensureColumn(db, 'students', 'renda', 'TEXT');
  await ensureColumn(db, 'students', 'turma', 'TEXT');
  await ensureColumn(db, 'donations', 'donor', 'TEXT');
  await ensureColumn(db, 'donations', 'method', 'TEXT');
  await ensureColumn(db, 'donations', 'status', "TEXT NOT NULL DEFAULT 'completed'");
  await ensureColumn(db, 'donations', 'campaign', 'TEXT');
  await ensureColumn(db, 'donations', 'notes', 'TEXT');
  await ensureColumn(db, 'classes', 'professor_substituto', 'TEXT');
  await ensureColumn(db, 'classes', 'startDate', 'TEXT');
  await ensureColumn(db, 'classes', 'endDate', 'TEXT');
  await ensureColumn(db, 'classes', 'costPerClass', 'REAL');
  await ensureColumn(db, 'classes', 'professorPaymentType', 'TEXT');
  await ensureColumn(db, 'stock_items', 'notes', 'TEXT');
  await ensureColumn(db, 'students', 'nomeSocial', 'TEXT');
  await ensureColumn(db, 'students', 'nacionalidade', 'TEXT');
  await ensureColumn(db, 'students', 'orgaoEmissor', 'TEXT');
  await ensureColumn(db, 'students', 'email', 'TEXT');
  await ensureColumn(db, 'students', 'autorizadoBuscar', 'INTEGER');
  await ensureColumn(db, 'students', 'escolaAtual', 'TEXT');
  await ensureColumn(db, 'students', 'serieAno', 'TEXT');
  await ensureColumn(db, 'students', 'frequentandoRegularmente', 'INTEGER');
  await ensureColumn(db, 'students', 'jaRepetiuAno', 'INTEGER');
  await ensureColumn(db, 'students', 'numeroMoradores', 'TEXT');
  await ensureColumn(db, 'students', 'recebeBeneficio', 'INTEGER');
  await ensureColumn(db, 'students', 'qualBeneficio', 'TEXT');
  await ensureColumn(db, 'students', 'situacaoVulnerabilidade', 'TEXT');
  await ensureColumn(db, 'students', 'possuiAlergias', 'INTEGER');
  await ensureColumn(db, 'students', 'quaisAlergias', 'TEXT');
  await ensureColumn(db, 'students', 'usaMedicacao', 'INTEGER');
  await ensureColumn(db, 'students', 'quaisMedicacoes', 'TEXT');
  await ensureColumn(db, 'students', 'possuiDeficiencia', 'INTEGER');
  await ensureColumn(db, 'students', 'qualDeficiencia', 'TEXT');
  await ensureColumn(db, 'students', 'observacoesMedicas', 'TEXT');
  await ensureColumn(db, 'students', 'contatoEmergenciaNome', 'TEXT');
  await ensureColumn(db, 'students', 'contatoEmergenciaTelefone', 'TEXT');
  await ensureColumn(db, 'students', 'dataEntradaONG', 'TEXT');
  await ensureColumn(db, 'students', 'observacoesAdministrativas', 'TEXT');
}

async function ensureColumn(db: Database, table: string, column: string, type: string) {
  const rows = (await db.all(`PRAGMA table_info(${table})`)) as Array<{ name: string }>;
  const exists = rows.some((r) => r.name === column);
  if (exists) return;
  await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
}

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const dir = path.join(process.cwd(), '.data');
      await ensureDir(dir);
      const db = await open({
        filename: dbPath(),
        driver: sqlite3.Database,
      });
      await init(db);
      return db;
    })();
  }
  return dbPromise;
}

export function makeId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
