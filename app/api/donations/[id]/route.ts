import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const donation = await db.get(
    'SELECT id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt FROM donations WHERE id = ?',
    [id]
  );
  if (!donation) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ donation });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    donor?: string;
    amount?: number;
    date?: string;
    type?: string;
    method?: string;
    status?: 'completed' | 'pending';
    campaign?: string;
    notes?: string;
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt FROM donations WHERE id = ?',
    [id]
  );
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const donor = patch.donor ?? existing.donor;
  const amount = typeof patch.amount === 'number' ? patch.amount : existing.amount;
  const date = patch.date ?? existing.date;
  const type = patch.type ?? existing.type;
  const method = patch.method ?? existing.method;
  const status = patch.status ?? existing.status;
  const campaign = patch.campaign ?? existing.campaign;
  const notes = patch.notes ?? existing.notes;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE donations SET donor = ?, amount = ?, date = ?, type = ?, method = ?, status = ?, campaign = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [donor, amount, date, type, method, status, campaign, notes, updatedAt, id]
    );
  } catch {
    return NextResponse.json({ error: 'failed to update donation' }, { status: 500 });
  }

  const donation = await db.get(
    'SELECT id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt FROM donations WHERE id = ?',
    [id]
  );
  return NextResponse.json({ donation });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const db = await getDb();
  const result = await db.run('DELETE FROM donations WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
