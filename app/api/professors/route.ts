import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const professors = await db.all(
    'SELECT id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt FROM professors ORDER BY createdAt DESC'
  );
  return NextResponse.json({ professors });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birth?: string;
    specialization?: string;
    type?: string;
    hourlyRate?: number;
    monthlySalary?: number;
    avatar?: string;
    status?: 'active' | 'inactive';
  };

  if (!body?.name || !body?.email || !body?.phone || !body?.specialization || !body?.type) {
    return NextResponse.json({ error: 'name, email, phone, specialization, type are required' }, { status: 400 });
  }

  const db = await getDb();
  const id = makeId();
  const t = nowIso();
  const status = body.status ?? 'active';
  const cpf = body.cpf ?? null;
  const birth = typeof body.birth === 'string' ? body.birth : null;
  const hourlyRate = typeof body.hourlyRate === 'number' ? body.hourlyRate : null;
  const monthlySalary = typeof body.monthlySalary === 'number' ? body.monthlySalary : null;
  const avatar = typeof body.avatar === 'string' ? body.avatar : null;

  try {
    await db.run(
      'INSERT INTO professors (id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.email, body.phone, cpf, birth, body.specialization, body.type, hourlyRate, monthlySalary, avatar, status, t, t]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create professor' }, { status: 500 });
  }

  const professor = await db.get(
    'SELECT id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt FROM professors WHERE id = ?',
    [id]
  );

  return NextResponse.json({ professor }, { status: 201 });
}
