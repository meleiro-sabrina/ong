import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const item = await db.get(
    'SELECT id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt FROM stock_items WHERE id = ?',
    [id]
  );
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    minQuantity?: number;
    notes?: string;
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, name, category, quantity, unit, minQuantity, notes FROM stock_items WHERE id = ?',
    [id]
  );
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const name = patch.name ?? existing.name;
  const category = patch.category ?? existing.category;
  const quantity = typeof patch.quantity === 'number' ? patch.quantity : existing.quantity;
  const unit = patch.unit ?? existing.unit;
  const minQuantity = typeof patch.minQuantity === 'number' ? patch.minQuantity : existing.minQuantity;
  const notes = typeof patch.notes === 'string' ? patch.notes : existing.notes;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE stock_items SET name = ?, category = ?, quantity = ?, unit = ?, minQuantity = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [name, category, quantity, unit, minQuantity, notes, updatedAt, id]
    );
  } catch {
    return NextResponse.json({ error: 'failed to update item' }, { status: 500 });
  }

  const item = await db.get(
    'SELECT id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt FROM stock_items WHERE id = ?',
    [id]
  );
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const result = await db.run('DELETE FROM stock_items WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
