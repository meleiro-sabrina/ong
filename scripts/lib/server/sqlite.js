"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.makeId = makeId;
exports.nowIso = nowIso;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const sqlite_1 = require("sqlite");
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = require("fs");
let dbPromise = null;
function dbPath() {
    return path_1.default.join(process.cwd(), '.data', 'app.db');
}
async function ensureDir(dir) {
    try {
        await fs_1.promises.mkdir(dir, { recursive: true });
    }
    catch {
        // ignore
    }
}
async function init(db) {
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
      donor TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('completed','pending')),
      campaign TEXT NOT NULL,
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
    await ensureColumn(db, 'donations', 'notes', 'TEXT');
    await ensureColumn(db, 'classes', 'professor_substituto', 'TEXT');
    await ensureColumn(db, 'classes', 'startDate', 'TEXT');
    await ensureColumn(db, 'classes', 'endDate', 'TEXT');
    await ensureColumn(db, 'classes', 'costPerClass', 'REAL');
    await ensureColumn(db, 'classes', 'professorPaymentType', 'TEXT');
    await ensureColumn(db, 'stock_items', 'notes', 'TEXT');
}
async function ensureColumn(db, table, column, type) {
    const rows = (await db.all(`PRAGMA table_info(${table})`));
    const exists = rows.some((r) => r.name === column);
    if (exists)
        return;
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
}
async function getDb() {
    if (!dbPromise) {
        dbPromise = (async () => {
            const dir = path_1.default.join(process.cwd(), '.data');
            await ensureDir(dir);
            const db = await (0, sqlite_1.open)({
                filename: dbPath(),
                driver: sqlite3_1.default.Database,
            });
            await init(db);
            return db;
        })();
    }
    return dbPromise;
}
function makeId() {
    return crypto_1.default.randomUUID();
}
function nowIso() {
    return new Date().toISOString();
}
