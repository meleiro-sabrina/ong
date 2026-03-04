import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const items = await db.all(
    'SELECT id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt FROM stock_items ORDER BY createdAt DESC'
  );
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    minQuantity?: number;
    notes?: string;
  };

  if (!body?.name || !body?.category || !body?.unit) {
    return NextResponse.json({ error: 'name, category, unit are required' }, { status: 400 });
  }

  const quantity = typeof body.quantity === 'number' ? body.quantity : 0;
  const minQuantity = typeof body.minQuantity === 'number' ? body.minQuantity : 0;
  const notes = typeof body.notes === 'string' ? body.notes : null;

  const db = await getDb();
  const id = makeId();
  const t = nowIso();

  try {
    await db.run(
      'INSERT INTO stock_items (id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.category, quantity, body.unit, minQuantity, notes, t, t]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create item' }, { status: 500 });
  }

  const item = await db.get(
    'SELECT id, name, category, quantity, unit, minQuantity, notes, createdAt, updatedAt FROM stock_items WHERE id = ?',
    [id]
  );
  return NextResponse.json({ item }, { status: 201 });
}
