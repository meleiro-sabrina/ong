import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const donations = await db.all(
    'SELECT id, donor, amount, date, type, method, status, campaign, createdAt, updatedAt FROM donations ORDER BY date DESC, createdAt DESC'
  );
  return NextResponse.json({ donations });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    donor?: string;
    amount?: number;
    date?: string;
    type?: string;
    method?: string;
    status?: 'completed' | 'pending';
    campaign?: string;
    notes?: string;
  };

  if (!body?.amount || !body?.date) {
    return NextResponse.json({ error: 'amount and date are required' }, { status: 400 });
  }

  const amount = body.amount;
  const date = body.date;

  const db = await getDb();
  const id = makeId();
  const t = nowIso();
  const donor = body.donor ?? '';
  const type = body.type ?? 'Única';
  const method = body.method ?? 'PIX';
  const status = body.status ?? 'completed';
  const campaign = body.campaign ?? 'Geral';
  const notes = body.notes ?? '';

  try {
    await db.run(
      'INSERT INTO donations (id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, donor, amount, date, type, method, status, campaign, notes, t, t]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create donation' }, { status: 500 });
  }

  const donation = await db.get(
    'SELECT id, donor, amount, date, type, method, status, campaign, notes, createdAt, updatedAt FROM donations WHERE id = ?',
    [id]
  );

  return NextResponse.json({ donation }, { status: 201 });
}
