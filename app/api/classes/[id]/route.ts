import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const cls = await db.get(
    'SELECT id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt FROM classes WHERE id = ?',
    [id]
  );
  if (!cls) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ class: cls });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    code?: string;
    name?: string;
    professor?: string;
    professor_substituto?: string;
    schedule?: string;
    startDate?: string;
    endDate?: string;
    costPerClass?: number;
    professorPaymentType?: string;
    status?: 'active' | 'suspended' | 'ended';
    currentStudents?: number;
    maxStudents?: number;
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt FROM classes WHERE id = ?',
    [id]
  );
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const code = patch.code ?? existing.code;
  const name = patch.name ?? existing.name;
  const professor = patch.professor ?? existing.professor;
  const professor_substituto = patch.professor_substituto ?? existing.professor_substituto;
  const schedule = patch.schedule ?? existing.schedule;
  const startDate = typeof patch.startDate === 'string' ? patch.startDate : existing.startDate;
  const endDate = typeof patch.endDate === 'string' ? patch.endDate : existing.endDate;
  const costPerClass = typeof patch.costPerClass === 'number' ? patch.costPerClass : existing.costPerClass;
  const professorPaymentType = typeof patch.professorPaymentType === 'string' ? patch.professorPaymentType : existing.professorPaymentType;
  const status = patch.status ?? existing.status;
  const maxStudents = typeof patch.maxStudents === 'number' ? patch.maxStudents : existing.maxStudents;
  const currentStudents = existing.currentStudents;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE classes SET code = ?, name = ?, professor = ?, professor_substituto = ?, schedule = ?, startDate = ?, endDate = ?, costPerClass = ?, professorPaymentType = ?, status = ?, currentStudents = ?, maxStudents = ?, updatedAt = ? WHERE id = ?',
      [code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, updatedAt, id]
    );
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to update class' }, { status: 500 });
  }

  const cls = await db.get(
    'SELECT id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt FROM classes WHERE id = ?',
    [id]
  );
  return NextResponse.json({ class: cls });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const db = await getDb();
  const result = await db.run('DELETE FROM classes WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
