import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get('classId');
  const date = url.searchParams.get('date');

  const db = await getDb();

  const where: string[] = [];
  const params: any[] = [];
  if (classId) {
    where.push('a.classId = ?');
    params.push(classId);
  }
  if (date) {
    where.push('a.date = ?');
    params.push(date);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await db.all(
    `
    SELECT
      a.id as id,
      a.classId as classId,
      a.date as date,
      a.createdAt as createdAt,
      r.studentId as studentId,
      r.status as status
    FROM attendance a
    LEFT JOIN attendance_records r ON r.attendanceId = a.id
    ${whereSql}
    ORDER BY a.date DESC, a.createdAt DESC
    `,
    params
  );

  const byId = new Map<string, any>();
  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        classId: row.classId,
        date: row.date,
        createdAt: row.createdAt,
        records: [],
      });
    }
    if (row.studentId) {
      byId.get(row.id).records.push({ studentId: row.studentId, status: row.status });
    }
  }

  return NextResponse.json({ attendance: Array.from(byId.values()) });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    classId?: string;
    date?: string;
    records?: Array<{ studentId: string; status: 'P' | 'F' | 'J' }>;
  };

  if (!body?.classId || !body?.date || !body?.records) {
    return NextResponse.json({ error: 'classId, date, records are required' }, { status: 400 });
  }

  const classId = body.classId;
  const date = body.date;
  const records = body.records;

  const db = await getDb();

  const cls = await db.get('SELECT id FROM classes WHERE id = ?', [classId]);
  if (!cls) return NextResponse.json({ error: 'class not found' }, { status: 404 });

  const enrolled = await db.all(
    "SELECT studentId FROM class_enrollments WHERE classId = ? AND status = 'active'",
    [classId]
  );
  const activeStudentIds = new Set(enrolled.map((r: any) => r.studentId));
  const invalid = records.filter((r) => !activeStudentIds.has(r.studentId));
  if (invalid.length > 0) {
    return NextResponse.json({ error: 'records contain students not enrolled in class' }, { status: 400 });
  }

  const id = makeId();
  const createdAt = nowIso();

  try {
    await db.exec('BEGIN');
    await db.run('INSERT INTO attendance (id, classId, date, createdAt) VALUES (?, ?, ?, ?)', [
      id,
      classId,
      date,
      createdAt,
    ]);
    for (const r of records) {
      await db.run(
        'INSERT INTO attendance_records (attendanceId, studentId, status) VALUES (?, ?, ?)',
        [id, r.studentId, r.status]
      );
    }
    await db.exec('COMMIT');
  } catch {
    try {
      await db.exec('ROLLBACK');
    } catch {}
    return NextResponse.json({ error: 'failed to create attendance' }, { status: 500 });
  }

  return NextResponse.json(
    {
      attendance: {
        id,
        classId,
        date,
        createdAt,
        records,
      },
    },
    { status: 201 }
  );
}
