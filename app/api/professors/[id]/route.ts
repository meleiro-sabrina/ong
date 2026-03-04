import { NextResponse } from 'next/server';
import { getDb, nowIso } from '@/lib/server/sqlite';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const professor = await db.get(
    'SELECT id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt FROM professors WHERE id = ?',
    [id]
  );
  if (!professor) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ professor });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const patch = (await req.json().catch(() => null)) as null | {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birth?: string;
    specialization?: string;
    type?: string;
    hourlyRate?: number;
    monthlySalary?: number;
    avatar?: string;
    status?: 'active' | 'inactive';
  };

  if (!patch) return NextResponse.json({ error: 'invalid json' }, { status: 400 });

  const db = await getDb();
  const existing = await db.get(
    'SELECT id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status FROM professors WHERE id = ?',
    [id]
  );
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const name = patch.name ?? existing.name;
  const email = patch.email ?? existing.email;
  const phone = patch.phone ?? existing.phone;
  const cpf = patch.cpf ?? existing.cpf;
  const birth = typeof patch.birth === 'string' ? patch.birth : existing.birth;
  const specialization = patch.specialization ?? existing.specialization;
  const type = patch.type ?? existing.type;
  const hourlyRate = typeof patch.hourlyRate === 'number' ? patch.hourlyRate : existing.hourlyRate;
  const monthlySalary = typeof patch.monthlySalary === 'number' ? patch.monthlySalary : existing.monthlySalary;
  const avatar = typeof patch.avatar === 'string' ? patch.avatar : existing.avatar;
  const status = patch.status ?? existing.status;
  const updatedAt = nowIso();

  try {
    await db.run(
      'UPDATE professors SET name = ?, email = ?, phone = ?, cpf = ?, birth = ?, specialization = ?, type = ?, hourlyRate = ?, monthlySalary = ?, avatar = ?, status = ?, updatedAt = ? WHERE id = ?',
      [name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, updatedAt, id]
    );
  } catch {
    return NextResponse.json({ error: 'failed to update professor' }, { status: 500 });
  }

  const professor = await db.get(
    'SELECT id, name, email, phone, cpf, birth, specialization, type, hourlyRate, monthlySalary, avatar, status, createdAt, updatedAt FROM professors WHERE id = ?',
    [id]
  );

  return NextResponse.json({ professor });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDb();
  const result = await db.run('DELETE FROM professors WHERE id = ?', [id]);
  if (!result.changes) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
