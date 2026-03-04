import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const users = await db.all(
    'SELECT id, name, email, avatar, role, permissions, status, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
  );
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    role?: string;
    permissions?: string;
    status?: 'active' | 'inactive';
  };

  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  const name = body.name;
  const email = body.email;

  const db = await getDb();
  const id = makeId();
  const t = nowIso();
  const role = body.role ?? 'Voluntário';
  const status = body.status ?? 'active';
  const permissions = body.permissions ?? null;

  try {
    await db.run(
      'INSERT INTO users (id, name, email, role, permissions, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, role, permissions, status, t, t]
    );
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to create user' }, { status: 500 });
  }

  const user = await db.get('SELECT id, name, email, role, permissions, status, createdAt, updatedAt FROM users WHERE id = ?', [id]);
  return NextResponse.json({ user }, { status: 201 });
}
