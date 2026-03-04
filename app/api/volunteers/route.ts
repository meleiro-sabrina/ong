import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const volunteers = await db.all(
    'SELECT id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt FROM volunteers ORDER BY createdAt DESC'
  );
  return NextResponse.json({ volunteers });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    hours?: number;
    avatar?: string;
    status?: 'active' | 'inactive';
  };

  if (!body?.name || !body?.email || !body?.phone || !body?.role) {
    return NextResponse.json({ error: 'name, email, phone, role are required' }, { status: 400 });
  }

  const db = await getDb();
  const id = makeId();
  const t = nowIso();
  const hours = typeof body.hours === 'number' ? body.hours : 0;
  const status = body.status ?? 'active';
  const avatar = typeof body.avatar === 'string' ? body.avatar : null;

  try {
    await db.run(
      'INSERT INTO volunteers (id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.email, body.phone, body.role, hours, avatar, status, t, t]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create volunteer' }, { status: 500 });
  }

  const volunteer = await db.get(
    'SELECT id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt FROM volunteers WHERE id = ?',
    [id]
  );
  return NextResponse.json({ volunteer }, { status: 201 });
}
