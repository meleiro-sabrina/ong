import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  const db = await getDb();
  const rows = await db.all(
    `
    SELECT
      e.id as enrollmentId,
      e.entryDate as entryDate,
      e.exitDate as exitDate,
      e.status as enrollmentStatus,
      s.id as studentId,
      s.enrollment as enrollment,
      s.name as name,
      s.status as studentStatus
    FROM class_enrollments e
    JOIN students s ON s.id = e.studentId
    WHERE e.classId = ?
    ORDER BY s.name ASC
    `,
    [classId]
  );

  return NextResponse.json({ roster: rows });
}
