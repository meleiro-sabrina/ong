import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export type DbStudent = {
  id: string;
  enrollment: string;
  name: string;
  age?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export type DbClass = {
  id: string;
  code: string;
  name: string;
  professor: string;
  schedule: string;
  status: 'active' | 'suspended' | 'ended';
  currentStudents: number;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
};

export type DbClassEnrollment = {
  id: string;
  classId: string;
  studentId: string;
  entryDate: string;
  exitDate?: string;
  status: 'active' | 'removed';
};

export type DbDonation = {
  id: string;
  donor: string;
  amount: number;
  date: string;
  type: string;
  method: string;
  status: 'completed' | 'pending';
  campaign: string;
  createdAt: string;
  updatedAt: string;
};

export type DbMessage = {
  id: string;
  channel: 'whatsapp' | 'email';
  audience: string;
  message: string;
  createdAt: string;
};

export type DbAttendance = {
  id: string;
  classId: string;
  date: string;
  records: Array<{ studentId: string; status: 'P' | 'F' | 'J' }>;
  createdAt: string;
};

export type DbShape = {
  users: DbUser[];
  students: DbStudent[];
  classes: DbClass[];
  classEnrollments: DbClassEnrollment[];
  donations: DbDonation[];
  messages: DbMessage[];
  attendance: DbAttendance[];
};

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

async function ensureDbFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: DbShape = {
      users: [],
      students: [],
      classes: [],
      classEnrollments: [],
      donations: [],
      messages: [],
      attendance: [],
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

export async function readDb(): Promise<DbShape> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw) as DbShape;
}

export async function writeDb(db: DbShape): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

export async function withDb<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const db = await readDb();
  const result = await fn(db);
  await writeDb(db);
  return result;
}

export function createUser(input: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): DbUser {
  const t = nowIso();
  return { ...input, id: makeId(), createdAt: t, updatedAt: t };
}

export function updateUser(existing: DbUser, patch: Partial<Omit<DbUser, 'id' | 'createdAt'>>): DbUser {
  return { ...existing, ...patch, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
}

export function createStudent(input: Omit<DbStudent, 'id' | 'createdAt' | 'updatedAt'>): DbStudent {
  const t = nowIso();
  return { ...input, id: makeId(), createdAt: t, updatedAt: t };
}

export function updateStudent(existing: DbStudent, patch: Partial<Omit<DbStudent, 'id' | 'createdAt'>>): DbStudent {
  return { ...existing, ...patch, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
}

export function createClass(input: Omit<DbClass, 'id' | 'createdAt' | 'updatedAt'>): DbClass {
  const t = nowIso();
  return { ...input, id: makeId(), createdAt: t, updatedAt: t };
}

export function updateClass(existing: DbClass, patch: Partial<Omit<DbClass, 'id' | 'createdAt'>>): DbClass {
  return { ...existing, ...patch, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
}

export function createDonation(input: Omit<DbDonation, 'id' | 'createdAt' | 'updatedAt'>): DbDonation {
  const t = nowIso();
  return { ...input, id: makeId(), createdAt: t, updatedAt: t };
}

export function updateDonation(existing: DbDonation, patch: Partial<Omit<DbDonation, 'id' | 'createdAt'>>): DbDonation {
  return { ...existing, ...patch, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
}

export function createMessage(input: Omit<DbMessage, 'id' | 'createdAt'>): DbMessage {
  return { ...input, id: makeId(), createdAt: nowIso() };
}

export function createAttendance(input: Omit<DbAttendance, 'id' | 'createdAt'>): DbAttendance {
  return { ...input, id: makeId(), createdAt: nowIso() };
}
