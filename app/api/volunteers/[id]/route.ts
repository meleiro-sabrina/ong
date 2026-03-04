import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const volunteer = await db.get(
    'SELECT id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt FROM volunteers WHERE id = ?',
    [id]
  );
  if (!volunteer) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ volunteer });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    hours?: number;
    avatar?: string;
    status?: 'active' | 'inactive';
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, name, email, phone, role, hours, avatar, status FROM volunteers WHERE id = ?',
    [id]
  );
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const name = patch.name ?? existing.name;
  const email = patch.email ?? existing.email;
  const phone = patch.phone ?? existing.phone;
  const role = patch.role ?? existing.role;
  const hours = typeof patch.hours === 'number' ? patch.hours : existing.hours;
  const avatar = typeof patch.avatar === 'string' ? patch.avatar : existing.avatar;
  const status = patch.status ?? existing.status;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE volunteers SET name = ?, email = ?, phone = ?, role = ?, hours = ?, avatar = ?, status = ?, updatedAt = ? WHERE id = ?',
      [name, email, phone, role, hours, avatar, status, updatedAt, id]
    );
  } catch {
    return NextResponse.json({ error: 'failed to update volunteer' }, { status: 500 });
  }

  const volunteer = await db.get(
    'SELECT id, name, email, phone, role, hours, avatar, status, createdAt, updatedAt FROM volunteers WHERE id = ?',
    [id]
  );
  return NextResponse.json({ volunteer });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const result = await db.run('DELETE FROM volunteers WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
