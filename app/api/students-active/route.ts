import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/sqlite';

export async function GET() {
  const db = await getDb();
  const students = await db.all(
    `SELECT id, enrollment, name, birth, guardian, phone, avatar, status FROM students WHERE status = 'active' ORDER BY name ASC`
  );
  return NextResponse.json({ students });
}
