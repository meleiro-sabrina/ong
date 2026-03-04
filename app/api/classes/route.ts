import { NextResponse } from 'next/server';
import { getDb, makeId, nowIso } from '@/lib/server/sqlite';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

export async function GET(req: Request) {
  const db = await getDb();
  
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    let userRole = '';
    let userName = '';
    
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        if (userId) {
          const user = await db.get('SELECT name, role FROM users WHERE id = ?', [userId]);
          if (user) {
            userRole = user.role;
            userName = user.name;
          }
        }
      } catch {
      }
    }
    
    let query = 'SELECT id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt FROM classes';
    const where: string[] = [];
    const params: any[] = [];
    
    if (userRole === 'Professor') {
      where.push('(professor = ? OR professor_substituto = ?)');
      params.push(userName, userName);
    }

    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    if (where.length) {
      query += ` WHERE ${where.join(' AND ')}`;
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const classes = await db.all(query, params);
    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return NextResponse.json({ error: 'Falha ao carregar turmas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
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
    maxStudents?: number;
  };

  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: 'code and name are required' }, { status: 400 });
  }

  const code = body.code;
  const name = body.name;

  const db = await getDb();
  const id = makeId();
  const t = nowIso();
  const professor = body.professor ?? '';
  const professor_substituto = body.professor_substituto ?? null;
  const schedule = body.schedule ?? '';
  const startDate = typeof body.startDate === 'string' ? body.startDate : null;
  const endDate = typeof body.endDate === 'string' ? body.endDate : null;
  const costPerClass = typeof body.costPerClass === 'number' ? body.costPerClass : null;
  const professorPaymentType = typeof body.professorPaymentType === 'string' ? body.professorPaymentType : null;
  const status = body.status ?? 'active';
  const maxStudents = typeof body.maxStudents === 'number' ? body.maxStudents : 20;

  try {
    await db.run(
      'INSERT INTO classes (id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, 0, maxStudents, t, t]
    );
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : '';
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to create class' }, { status: 500 });
  }

  const cls = await db.get(
    'SELECT id, code, name, professor, professor_substituto, schedule, startDate, endDate, costPerClass, professorPaymentType, status, currentStudents, maxStudents, createdAt, updatedAt FROM classes WHERE id = ?',
    [id]
  );
  return NextResponse.json({ class: cls }, { status: 201 });
}
