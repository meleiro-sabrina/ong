'use client';

import { Plus, Search, Filter, Trash2, Download, X, ArrowLeft, Users, UserPlus, CheckCircle2, AlertCircle, Info, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClassStudentsPage() {
  const params = useParams();
  const classId = params.id as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledSearchQuery, setEnrolledSearchQuery] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classDetails, setClassDetails] = useState<any>({
    id: classId,
    code: '',
    name: '',
    professor: '',
    schedule: '',
    status: 'active',
    currentStudents: 0,
    maxStudents: 20,
    startDate: '',
  });

  // Load class details and roster on mount
  useEffect(() => {
    if (!classId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Load class details
        const classRes = await fetch(`/api/classes/${classId}`, { cache: 'no-store' });
        if (!classRes.ok) throw new Error('Falha ao carregar turma');
        const classJson = await classRes.json();
        if (classJson.class) {
          setClassDetails({
            ...classJson.class,
            currentStudents: 0,
            professor: 'Não definido',
            schedule: 'Não definido',
            startDate: new Date(classJson.class.createdAt).toLocaleDateString('pt-BR'),
          });
        }

        // Load roster
        await loadRoster();
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const loadRoster = async () => {
    if (!classId) return;
    try {
      const rosterRes = await fetch(`/api/roster?classId=${classId}`, { cache: 'no-store' });
      if (!rosterRes.ok) throw new Error('Falha ao carregar alunos vinculados');
      const rosterJson = await rosterRes.json();
      const roster = Array.isArray(rosterJson.roster) ? rosterJson.roster : [];
      
      const mapped = roster.map((r: any) => ({
        id: r.studentId,
        enrollment: r.enrollment,
        name: r.name,
        entryDate: r.entryDate ? new Date(r.entryDate).toLocaleDateString('pt-BR') : '-',
        exitDate: r.exitDate ? new Date(r.exitDate).toLocaleDateString('pt-BR') : null,
        status: r.enrollmentStatus === 'active' ? 'active' : 'removed',
        enrollmentId: r.enrollmentId,
      }));
      
      setEnrolledStudents(mapped);
      setClassDetails((prev: any) => ({ ...prev, currentStudents: mapped.filter((s: any) => s.status === 'active').length }));
    } catch (e: any) {
      console.error('Error loading roster:', e);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const res = await fetch('/api/students?status=active', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar alunos');
      const json = await res.json();
      const allStudents = Array.isArray(json.students) ? json.students : [];
      
      // Filter out students already enrolled
      const enrolledIds = new Set(enrolledStudents.filter(s => s.status === 'active').map(s => s.id));
      const available = allStudents.filter((s: any) => !enrolledIds.has(s.id));
      
      setAvailableStudents(available.map((s: any) => ({
        id: s.id,
        enrollment: s.enrollment,
        name: s.name,
        age: s.age || '-',
      })));
    } catch (e: any) {
      console.error('Error loading available students:', e);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          classId,
          studentId,
          entryDate: new Date().toISOString().split('T')[0],
        }),
      });
      if (!res.ok) throw new Error('Falha ao vincular aluno');
      
      await loadRoster();
      await loadAvailableStudents();
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Erro ao vincular aluno');
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma?')) return;
    try {
      // We don't have a specific enrollment delete endpoint, so we'll use PATCH to update status
      // or we could use the enrollments/[id] endpoint if it exists
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao remover aluno');
      
      await loadRoster();
      await loadAvailableStudents();
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Erro ao remover aluno');
    }
  };

  const openAddModal = () => {
    loadAvailableStudents();
    setIsAddModalOpen(true);
  };

  const openAttendanceModal = () => {
    const initialState: Record<string, string> = {};
    enrolledStudents.filter(s => s.status === 'active').forEach(s => {
      initialState[s.id] = 'P';
    });
    setAttendanceState(initialState);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          classId,
          date: attendanceDate,
          records,
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar chamada');
      setIsAttendanceModalOpen(false);
      alert('Chamada salva com sucesso!');
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Erro ao salvar chamada');
    } finally {
      setSavingAttendance(false);
    }
  };

  const isClassFull = classDetails.currentStudents >= classDetails.maxStudents;
  const isClassActive = classDetails.status === 'active';

  const filteredAvailableStudents = availableStudents.filter((student: any) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar turma</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/turmas" className="mt-4 inline-flex items-center text-ngo-primary hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Turmas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link href="/turmas" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-ngo-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Turmas
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{classDetails.name}</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-sm border border-slate-200">
                {classDetails.code}
              </span>
              {classDetails.status === 'active' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-ngo-accent text-xs font-medium border border-green-200">Ativa</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">Encerrada</span>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-4 mt-2">
              <span>Prof. {classDetails.professor}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{classDetails.schedule}</span>
            </p>
          </div>

          {/* Capacity Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Ocupação
              </span>
              <span className={`text-sm font-bold ${isClassFull ? 'text-ngo-danger' : 'text-slate-900'}`}>
                {classDetails.currentStudents} / {classDetails.maxStudents}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${isClassFull ? 'bg-ngo-danger' : 'bg-ngo-secondary'}`} 
                style={{ width: `${(classDetails.currentStudents / classDetails.maxStudents) * 100}%` }}
              ></div>
            </div>
            {isClassFull && (
              <p className="text-xs text-ngo-danger mt-2 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Turma lotada
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar aluno nesta turma..." 
            value={enrolledSearchQuery}
            onChange={(e) => setEnrolledSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button 
            onClick={openAttendanceModal}
            disabled={!isClassActive}
            className="flex-1 sm:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Fazer Chamada
          </button>
          <button 
            onClick={openAddModal}
            disabled={isClassFull || !isClassActive}
            className="flex-1 sm:flex-none bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isClassActive ? "Turma não está ativa" : isClassFull ? "Turma atingiu limite máximo" : "Adicionar Aluno"}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Vincular Aluno
          </button>
        </div>
      </div>

      {/* Warning if cannot add students */}
      {(!isClassActive || isClassFull) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 text-ngo-warning mr-3 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Não é possível vincular novos alunos</h4>
            <p className="text-sm text-amber-700 mt-1">
              {!isClassActive 
                ? "Esta turma não está ativa (Suspensa ou Encerrada). Altere o status da turma para permitir novas matrículas." 
                : "Esta turma atingiu o limite máximo de alunos configurado. Aumente o limite ou remova alunos inativos."}
            </p>
          </div>
        </div>
      )}

      {/* Enrolled Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Alunos Vinculados</h2>
          <span className="text-sm text-slate-500">Total: {enrolledStudents.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4">Nome do Aluno</th>
                <th className="px-6 py-4">Data de Entrada</th>
                <th className="px-6 py-4">Data de Saída</th>
                <th className="px-6 py-4">Status na Turma</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledStudents.map((student) => (
                <tr key={student.id} className={`hover:bg-slate-50 transition-colors group ${student.status === 'removed' ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-6 py-4 font-mono text-slate-500">{student.enrollment}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600">{student.entryDate}</td>
                  <td className="px-6 py-4 text-slate-500">{student.exitDate || '-'}</td>
                  <td className="px-6 py-4">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Removido
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {student.status === 'active' && (
                      <button 
                        onClick={() => handleRemoveStudent(student.enrollmentId)}
                        className="text-sm font-medium text-ngo-danger hover:text-red-800 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover aluno da turma (Mantém histórico)"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Vincular Aluno */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Vincular Aluno à Turma</h2>
                <p className="text-sm text-slate-500">Selecione os alunos que deseja adicionar a {classDetails.code}.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col flex-1 overflow-hidden">
              
              {/* Search */}
              <div className="relative mb-4 shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar aluno por nome ou matrícula..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                />
              </div>

              {/* Available Students List */}
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                <ul className="divide-y divide-slate-100">
                  {filteredAvailableStudents.map((student) => (
                    <li key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Matrícula: <span className="font-mono">{student.enrollment}</span> • Idade: {student.age} anos
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        className="flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-ngo-primary hover:border-blue-200 transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                      </button>
                    </li>
                  ))}
                  {filteredAvailableStudents.length === 0 && (
                    <li className="p-8 text-center text-slate-500 text-sm">
                      Nenhum aluno disponível encontrado.
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="mt-4 flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100 shrink-0">
                <Info className="w-4 h-4 text-ngo-secondary mr-2 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  Apenas alunos com status &quot;Ativo&quot; na ONG e que não estejam atualmente vinculados a esta turma aparecem nesta lista.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Fazer Chamada */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Fazer Chamada</h2>
                <p className="text-sm text-slate-500">{classDetails.name} • {classDetails.schedule}</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4 shrink-0">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data da Aula</label>
                  <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                  />
                </div>
                <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg border border-blue-100 flex items-center flex-1">
                  <Info className="w-4 h-4 mr-2 shrink-0" />
                  Dias de aula: Segunda e Quarta. O sistema validará a data no momento de salvar.
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">Aluno</th>
                      <th className="px-4 py-3 text-center w-48">Presença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledStudents.filter(s => s.status === 'active').map(student => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.enrollment}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-1 bg-slate-100 p-1 rounded-lg w-fit mx-auto">
                            <button 
                              onClick={() => handleAttendanceChange(student.id, 'P')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                attendanceState[student.id] === 'P' 
                                  ? 'bg-white text-green-700 shadow-sm border border-slate-200' 
                                  : 'text-slate-500 hover:bg-white hover:text-green-600'
                              }`}
                            >
                              P
                            </button>
                            <button 
                              onClick={() => handleAttendanceChange(student.id, 'F')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                attendanceState[student.id] === 'F' 
                                  ? 'bg-white text-red-700 shadow-sm border border-slate-200' 
                                  : 'text-slate-500 hover:bg-white hover:text-red-600'
                              }`}
                            >
                              F
                            </button>
                            <button 
                              onClick={() => handleAttendanceChange(student.id, 'J')}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                attendanceState[student.id] === 'J' 
                                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200' 
                                  : 'text-slate-500 hover:bg-white hover:text-amber-600'
                              }`}
                              title="Falta Justificada"
                            >
                              J
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-6 py-2 text-sm font-medium text-white bg-ngo-primary rounded-lg hover:bg-blue-900 transition-colors shadow-sm flex items-center disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {savingAttendance ? 'Salvando...' : 'Salvar Chamada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
