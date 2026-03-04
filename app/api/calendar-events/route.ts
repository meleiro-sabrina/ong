import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month');

  const db = await getDb();
  if (month) {
    const rows = await db.all(
      'SELECT id, date, title, type, createdAt, updatedAt FROM calendar_events WHERE date LIKE ? ORDER BY date ASC',
      [month + '%']
    );
    return NextResponse.json({ events: rows });
  }

  const events = await db.all(
    'SELECT id, date, title, type, createdAt, updatedAt FROM calendar_events ORDER BY date ASC'
  );
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    date?: string;
    title?: string;
    type?: string;
  };

  if (!body?.date || !body?.title || !body?.type) {
    return NextResponse.json({ error: 'date, title, type are required' }, { status: 400 });
  }

  const db = await getDb();
  const id = makeId();
  const t = nowIso();

  try {
    await db.run(
      'INSERT INTO calendar_events (id, date, title, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.date, body.title, body.type, t, t]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create event' }, { status: 500 });
  }

  const event = await db.get(
    'SELECT id, date, title, type, createdAt, updatedAt FROM calendar_events WHERE id = ?',
    [id]
  );
  return NextResponse.json({ event }, { status: 201 });
}
