import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    date?: string;
    title?: string;
    type?: string;
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get('SELECT id, date, title, type FROM calendar_events WHERE id = ?', [id]);
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const date = patch.date ?? existing.date;
  const title = patch.title ?? existing.title;
  const type = patch.type ?? existing.type;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE calendar_events SET date = ?, title = ?, type = ?, updatedAt = ? WHERE id = ?',
      [date, title, type, updatedAt, id]
    );
  } catch {
    return NextResponse.json({ error: 'failed to update event' }, { status: 500 });
  }

  const event = await db.get(
    'SELECT id, date, title, type, createdAt, updatedAt FROM calendar_events WHERE id = ?',
    [id]
  );
  return NextResponse.json({ event });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const result = await db.run('DELETE FROM calendar_events WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
