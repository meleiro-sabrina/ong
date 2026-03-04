import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  const db = await getDb();

  const students = await db.all(
    `
    SELECT s.id, s.enrollment, s.name, s.birth, s.guardian, s.phone, s.avatar, s.status
    FROM students s
    WHERE s.status = 'active'
      AND NOT EXISTS (
        SELECT 1
        FROM class_enrollments e
        WHERE e.classId = ?
          AND e.studentId = s.id
          AND e.status = 'active'
      )
    ORDER BY s.name ASC
    `,
    [classId]
  );

  return NextResponse.json({ students });
}
