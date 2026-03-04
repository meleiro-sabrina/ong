import { NextResponse } from 'next/server';
import { getDb } from '@/lib/server/sqlite';

function yyyyMm(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function GET() {
  const db = await getDb();

  const monthPrefix = `${yyyyMm(new Date())}-`;
  const todayIso = new Date().toISOString().slice(0, 10);
  const cutoff3DaysIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cutoff30DaysIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const studentsTotalRow = await db.get('SELECT COUNT(1) as cnt FROM students');
  const studentsActiveRow = await db.get("SELECT COUNT(1) as cnt FROM students WHERE status = 'active'");
  const classesActiveRow = await db.get(
    "SELECT COUNT(1) as cnt FROM classes WHERE status = 'active'"
  );

  const donationsMonthCompletedRow = await db.get(
    "SELECT COALESCE(SUM(amount), 0) as sum FROM donations WHERE status = 'completed' AND date LIKE ?",
    [monthPrefix + '%']
  );
  const donationsMonthPendingRow = await db.get(
    "SELECT COALESCE(SUM(amount), 0) as sum FROM donations WHERE status = 'pending' AND date LIKE ?",
    [monthPrefix + '%']
  );

  const donationsPendingTotalRow = await db.get(
    "SELECT COALESCE(SUM(amount), 0) as sum FROM donations WHERE status = 'pending'"
  );

  const donationsCompletedTotalRow = await db.get(
    "SELECT COALESCE(SUM(amount), 0) as sum FROM donations WHERE status = 'completed'"
  );

  const donationsLast30CompletedRow = await db.get(
    "SELECT COALESCE(SUM(amount), 0) as sum FROM donations WHERE status = 'completed' AND date >= ?",
    [cutoff30DaysIso]
  );

  const attendanceMonthRow = await db.get(
    "SELECT COUNT(1) as cnt FROM attendance WHERE date LIKE ?",
    [monthPrefix + '%']
  );

  const attendanceCountsRow = await db.get(
    "SELECT COUNT(1) as total, SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present FROM attendance_records ar JOIN attendance a ON a.id = ar.attendanceId WHERE a.date LIKE ?",
    [monthPrefix + '%']
  );

  const totalRecords = Number(attendanceCountsRow?.total ?? 0);
  const presentRecords = Number(attendanceCountsRow?.present ?? 0);
  const attendanceAvg = totalRecords > 0 ? presentRecords / totalRecords : null;

  // Occupancy: top 3 classes by % filled
  const occupancy = await db.all(
    `
    SELECT id, name, professor, schedule, currentStudents, maxStudents
    FROM classes
    WHERE maxStudents > 0
    ORDER BY (CAST(currentStudents AS REAL) / CAST(maxStudents AS REAL)) DESC, currentStudents DESC
    LIMIT 3
    `
  );

  const overdueClasses = await db.all(
    "SELECT id, name, code, professor, endDate FROM classes WHERE status = 'active' AND endDate IS NOT NULL AND endDate <> '' AND endDate < ? ORDER BY endDate ASC",
    [todayIso]
  );

  const attendanceLagClasses = await db.all(
    `
    SELECT 
      c.id as id,
      c.name as name,
      c.code as code,
      c.professor as professor,
      c.startDate as startDate,
      MAX(a.date) as lastAttendanceDate
    FROM classes c
    LEFT JOIN attendance a ON a.classId = c.id
    WHERE c.status = 'active'
    GROUP BY c.id
    HAVING (
      lastAttendanceDate IS NULL AND (c.startDate IS NOT NULL AND c.startDate <> '' AND c.startDate <= ?)
    ) OR (
      lastAttendanceDate IS NOT NULL AND lastAttendanceDate < ?
    )
    ORDER BY COALESCE(lastAttendanceDate, c.startDate) ASC
    `,
    [cutoff3DaysIso, cutoff3DaysIso]
  );

  const lowStockItems = await db.all(
    `
    SELECT id, name, category, quantity, unit, minQuantity
    FROM stock_items
    WHERE quantity < minQuantity
    ORDER BY (minQuantity - quantity) DESC, name ASC
    LIMIT 10
    `
  );

  const alerts: Array<{ type: 'danger' | 'warning' | 'info'; title: string; description: string; href: string }> = [];

  for (const c of overdueClasses) {
    alerts.push({
      type: 'warning',
      title: 'Turma com data final vencida',
      description: `${c.name} (${c.code}) terminou em ${c.endDate} e ainda está ativa.`,
      href: `/turmas/${c.id}`,
    });
  }

  for (const c of attendanceLagClasses) {
    const last = c.lastAttendanceDate ? String(c.lastAttendanceDate) : null;
    alerts.push({
      type: 'danger',
      title: 'Presença sem lançamento (3+ dias)',
      description: `${c.name} (${c.code}) ${last ? `último lançamento em ${last}` : 'sem registros de presença'}.`,
      href: `/presenca?classId=${c.id}`,
    });
  }

  for (const it of lowStockItems) {
    alerts.push({
      type: 'info',
      title: 'Estoque baixo',
      description: `${it.name} (${it.category}): ${it.quantity} ${it.unit} (mínimo ${it.minQuantity}).`,
      href: '/estoque',
    });
  }

  return NextResponse.json({
    stats: {
      studentsTotal: Number(studentsTotalRow?.cnt ?? 0),
      studentsActive: Number(studentsActiveRow?.cnt ?? 0),
      classesActive: Number(classesActiveRow?.cnt ?? 0),
      attendanceAvg,
      donationsMonthCompleted: Number(donationsMonthCompletedRow?.sum ?? 0),
      donationsMonthPending: Number(donationsMonthPendingRow?.sum ?? 0),
      donationsPendingTotal: Number(donationsPendingTotalRow?.sum ?? 0),
      donationsCompletedTotal: Number(donationsCompletedTotalRow?.sum ?? 0),
      donationsLast30Completed: Number(donationsLast30CompletedRow?.sum ?? 0),
      attendanceMonthCount: Number(attendanceMonthRow?.cnt ?? 0),
      attendanceDelayCutoffDays: 3,
    },
    occupancy,
    alerts,
  });
}
