import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/sqlite';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  
  const offset = (page - 1) * limit;
  
  const db = await getDb();
  
  let whereClause = '';
  let params: any[] = [];
  
  if (search) {
    whereClause += ' WHERE (name LIKE ? OR enrollment LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (status && status !== 'todos') {
    whereClause += whereClause ? ' AND status = ?' : ' WHERE status = ?';
    params.push(status);
  }
  
  const countQuery = `SELECT COUNT(*) as total FROM students${whereClause}`;
  const count = await db.get(countQuery, params);
  
  const studentsQuery = `
    SELECT id, enrollment, name, status, avatar, birth, guardian, phone 
    FROM students${whereClause} 
    ORDER BY name ASC 
    LIMIT ? OFFSET ?
  `;
  const students = await db.all(studentsQuery, [...params, limit, offset]);
  
  return NextResponse.json({ 
    students,
    pagination: {
      page,
      limit,
      total: count.total,
      totalPages: Math.ceil(count.total / limit)
    }
  });
}
