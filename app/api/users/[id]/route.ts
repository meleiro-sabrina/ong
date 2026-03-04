import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const user = await db.get(
    'SELECT id, name, email, avatar, role, permissions, status, createdAt, updatedAt FROM users WHERE id = ?',
    [id]
  );
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    password?: string;
    avatar?: string;
    permissions?: string;
    role?: string;
    status?: 'active' | 'inactive';
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, name, email, avatar, role, permissions, status, createdAt, updatedAt FROM users WHERE id = ?',
    [id]
  );

  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const name = patch.name ?? existing.name;
  const email = patch.email ?? existing.email;
  const avatar = patch.avatar ?? existing.avatar;
  const permissions = patch.permissions ?? existing.permissions;
  const role = patch.role ?? existing.role;
  const status = patch.status ?? existing.status;
  const updatedAt = nowIso();

  try {
    // Build dynamic query based on whether password is being updated
    if (patch.password && patch.password.trim()) {
      await db.run(
        'UPDATE users SET name = ?, email = ?, password = ?, avatar = ?, permissions = ?, role = ?, status = ?, updatedAt = ? WHERE id = ?',
        [name, email, patch.password, avatar, permissions, role, status, updatedAt, id]
      );
    } else {
      await db.run(
        'UPDATE users SET name = ?, email = ?, avatar = ?, permissions = ?, role = ?, status = ?, updatedAt = ? WHERE id = ?',
        [name, email, avatar, permissions, role, status, updatedAt, id]
      );
    }
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to update user' }, { status: 500 });
  }

  const user = await db.get(
    'SELECT id, name, email, avatar, role, permissions, status, createdAt, updatedAt FROM users WHERE id = ?',
    [id]
  );
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const db = await getDb();
  const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
