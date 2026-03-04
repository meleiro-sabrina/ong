import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const messages = await db.all(
    'SELECT id, channel, audience, message, createdAt FROM messages ORDER BY createdAt DESC'
  );
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    channel?: 'whatsapp' | 'email';
    audience?: string;
    message?: string;
  };

  if (!body?.channel || !body?.audience || !body?.message) {
    return NextResponse.json({ error: 'channel, audience and message are required' }, { status: 400 });
  }

  const channel = body.channel;
  const audience = body.audience;
  const message = body.message;

  const db = await getDb();
  const id = makeId();
  const createdAt = nowIso();

  try {
    await db.run(
      'INSERT INTO messages (id, channel, audience, message, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, channel, audience, message, createdAt]
    );
  } catch {
    return NextResponse.json({ error: 'failed to create message' }, { status: 500 });
  }

  const msg = await db.get(
    'SELECT id, channel, audience, message, createdAt FROM messages WHERE id = ?',
    [id]
  );

  return NextResponse.json({ message: msg }, { status: 201 });
}
