import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get('classId');
  const studentId = url.searchParams.get('studentId');

  const db = await getDb();
  const where: string[] = [];
  const params: any[] = [];
  if (classId) {
    where.push('classId = ?');
    params.push(classId);
  }
  if (studentId) {
    where.push('studentId = ?');
    params.push(studentId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const enrollments = await db.all(
    `SELECT id, classId, studentId, entryDate, exitDate, status FROM class_enrollments ${whereSql} ORDER BY entryDate DESC`,
    params
  );
  return NextResponse.json({ enrollments });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    classId?: string;
    studentId?: string;
    entryDate?: string;
  };

  if (!body?.classId || !body?.studentId || !body?.entryDate) {
    return NextResponse.json({ error: 'classId, studentId, entryDate are required' }, { status: 400 });
  }

  const classId = body.classId;
  const studentId = body.studentId;
  const entryDate = body.entryDate;

  const db = await getDb();
  const cls = await db.get(
    "SELECT id, status, maxStudents FROM classes WHERE id = ?",
    [classId]
  );
  if (!cls) return NextResponse.json({ error: 'class not found' }, { status: 404 });
  if (cls.status !== 'active') return NextResponse.json({ error: 'class is not active' }, { status: 400 });

  const student = await db.get("SELECT id, status FROM students WHERE id = ?", [studentId]);
  if (!student) return NextResponse.json({ error: 'student not found' }, { status: 404 });
  if (student.status !== 'active') return NextResponse.json({ error: 'student is not active' }, { status: 400 });

  const currentActiveRow = await db.get(
    "SELECT COUNT(1) as cnt FROM class_enrollments WHERE classId = ? AND status = 'active'",
    [classId]
  );
  const currentActive = Number(currentActiveRow?.cnt ?? 0);
  if (currentActive >= Number(cls.maxStudents)) {
    return NextResponse.json({ error: 'class is full' }, { status: 400 });
  }

  const existingActive = await db.get(
    "SELECT id FROM class_enrollments WHERE classId = ? AND studentId = ? AND status = 'active'",
    [classId, studentId]
  );
  if (existingActive) {
    return NextResponse.json({ error: 'student already enrolled' }, { status: 400 });
  }

  const id = makeId();
  try {
    await db.exec('BEGIN');
    await db.run(
      "INSERT INTO class_enrollments (id, classId, studentId, entryDate, exitDate, status) VALUES (?, ?, ?, ?, NULL, 'active')",
      [id, classId, studentId, entryDate]
    );

    const updatedAt = nowIso();
    await db.run(
      "UPDATE classes SET currentStudents = (SELECT COUNT(1) FROM class_enrollments WHERE classId = ? AND status = 'active'), updatedAt = ? WHERE id = ?",
      [classId, updatedAt, classId]
    );
    await db.exec('COMMIT');
  } catch (e: any) {
    try {
      await db.exec('ROLLBACK');
    } catch {}
    console.error('POST /api/enrollments failed:', e);
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'student already enrolled' }, { status: 400 });
    }
    return NextResponse.json({ error: msg ? `failed to create enrollment: ${msg}` : 'failed to create enrollment' }, { status: 500 });
  }

  const enrollment = await db.get(
    'SELECT id, classId, studentId, entryDate, exitDate, status FROM class_enrollments WHERE id = ?',
    [id]
  );
  return NextResponse.json({ enrollment }, { status: 201 });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.get('SELECT id, classId FROM class_enrollments WHERE id = ?', [id]);
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const exitDate = new Date().toISOString().slice(0, 10);
  const updatedAt = nowIso();

  try {
    await db.exec('BEGIN');
    await db.run(
      "UPDATE class_enrollments SET status = 'removed', exitDate = ? WHERE id = ?",
      [exitDate, id]
    );
    await db.run(
      "UPDATE classes SET currentStudents = (SELECT COUNT(1) FROM class_enrollments WHERE classId = ? AND status = 'active'), updatedAt = ? WHERE id = ?",
      [existing.classId, updatedAt, existing.classId]
    );
    await db.exec('COMMIT');
  } catch {
    try {
      await db.exec('ROLLBACK');
    } catch {}
    return NextResponse.json({ error: 'failed to remove enrollment' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
