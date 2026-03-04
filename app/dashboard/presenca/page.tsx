'use client';

import { Search, Filter, Download, Calendar as CalendarIcon, Check, X, AlertCircle, Clock, Save, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePagination } from '@/hooks/usePagination';

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false);
  const [justificationModal, setJustificationModal] = useState<{isOpen: boolean, studentId: string | null, text: string}>({ isOpen: false, studentId: null, text: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/classes?status=active', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar turmas');
        const json = await res.json();
        setClasses(Array.isArray(json.classes) ? json.classes : []);
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Erro ao carregar turmas');
      }
    })();
  }, []);

  const handleBuscarLista = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setError(null);
    try {
      const rosterRes = await fetch(`/api/roster?classId=${selectedClass}`, { cache: 'no-store' });
      if (!rosterRes.ok) throw new Error('Falha ao carregar alunos da turma');
      const rosterJson = await rosterRes.json();
      const roster = Array.isArray(rosterJson.roster) ? rosterJson.roster : [];

      const activeEnrollments = roster.filter((r: any) => r.enrollmentStatus === 'active');

      const attendanceRes = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`, { cache: 'no-store' });
      const attendanceJson = await attendanceRes.json();
      const attendanceList = Array.isArray(attendanceJson.attendance) ? attendanceJson.attendance : [];
      const existingAttendance = attendanceList[0];

      const mappedStudents = activeEnrollments.map((e: any) => {
        const record = existingAttendance?.records?.find((r: any) => r.studentId === e.studentId);
        return {
          id: e.studentId,
          enrollment: e.enrollment,
          name: e.name,
          status: record ? mapStatusFromBackend(record.status) : 'pending',
          justification: record?.justification || undefined,
        };
      });

      setStudents(mappedStudents);
      setIsListVisible(true);
      setIsEditing(!existingAttendance);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro ao buscar lista');
    } finally {
      setLoading(false);
    }
  };

  const mapStatusFromBackend = (status: string) => {
    switch (status) {
      case 'P': return 'present';
      case 'F': return 'absent';
      case 'J': return 'justified';
      default: return 'pending';
    }
  };

  const mapStatusToBackend = (status: string) => {
    switch (status) {
      case 'present': return 'P';
      case 'absent': return 'F';
      case 'justified': return 'J';
      default: return 'P';
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    if (newStatus === 'justified') {
      setJustificationModal({ isOpen: true, studentId, text: '' });
      return;
    }
    
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, status: newStatus, justification: undefined } : s
    ));
  };

  const saveJustification = () => {
    if (justificationModal.studentId) {
      setStudents(students.map(s => 
        s.id === justificationModal.studentId 
          ? { ...s, status: 'justified', justification: justificationModal.text } 
          : s
      ));
    }
    setJustificationModal({ isOpen: false, studentId: null, text: '' });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: mapStatusToBackend(s.status),
        justification: s.justification,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          records,
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar presenças');
      setIsEditing(false);
      alert('Presenças salvas com sucesso!');
    } catch (e: any) {
      alert(typeof e?.message === 'string' ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const pendingCount = students.filter(s => s.status === 'pending').length;

  const {
    currentPage,
    paginatedItems,
    totalPages,
    startItem,
    endItem,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
  } = usePagination({ items: students, itemsPerPage: 10 });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Presença</h1>
          <p className="text-sm text-slate-500 mt-1">Registre e audite a frequência dos alunos nas turmas.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Relatório do Mês
          </button>
        </div>
      </div>

      {/* Selection Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selecione a Turma <span className="text-ngo-danger">*</span></label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
            >
              <option value="">Selecione uma turma ativa...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data da Aula <span className="text-ngo-danger">*</span></label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-700"
              />
            </div>
          </div>
          <div>
            <button 
              onClick={handleBuscarLista}
              disabled={!selectedClass || loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : 'Buscar Lista'}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {isListVisible ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Total de Alunos</p>
              <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
              <p className="text-sm text-green-600 font-medium mb-1">Presentes</p>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
              <p className="text-sm text-red-600 font-medium mb-1">Faltas</p>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-slate-700">{pendingCount}</p>
            </div>
          </div>

          {/* Action Bar for List */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-2" />
              {selectedDate && new Date(selectedDate).toLocaleDateString('pt-BR')}
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Editar Lista
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="bg-ngo-accent hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Presenças'}
                </button>
              </div>
            )}
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="hidden sm:table-cell px-6 py-4 w-32">Matrícula</th>
                    <th className="px-6 py-4">Nome do Aluno</th>
                    <th className="hidden sm:table-cell px-6 py-4">Status Atual</th>
                    <th className="px-6 py-4 text-center">Registro</th>
                    <th className="hidden sm:table-cell px-6 py-4">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedItems.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="hidden sm:table-cell px-6 py-4 font-mono text-slate-500">{student.enrollment}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        {student.status === 'present' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Presente</span>}
                        {student.status === 'absent' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-ngo-danger border border-red-200">Falta</span>}
                        {student.status === 'justified' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Justificada</span>}
                        {student.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Pendente</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button 
                            disabled={!isEditing}
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              student.status === 'present' 
                                ? 'bg-ngo-accent text-white shadow-md scale-110' 
                                : 'bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-ngo-accent'
                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Marcar Presente"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={!isEditing}
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              student.status === 'absent' 
                                ? 'bg-ngo-danger text-white shadow-md scale-110' 
                                : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-ngo-danger'
                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Marcar Falta"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={!isEditing}
                            onClick={() => handleStatusChange(student.id, 'justified')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              student.status === 'justified' 
                                ? 'bg-ngo-warning text-white shadow-md scale-110' 
                                : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-ngo-warning'
                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Justificar Falta"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        {student.justification ? (
                          <span className="text-xs text-slate-500 italic">{student.justification}</span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
            <div>Mostrando {startItem} a {endItem} de {students.length} alunos</div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPrevPage}
                disabled={!hasPrevPage}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          
          {/* Audit Trail Info */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
            <Info className="w-5 h-5 text-ngo-secondary mr-3 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-slate-800">Auditoria de Presença</h4>
              <p className="text-xs text-slate-600 mt-1">
                Todas as alterações realizadas nesta lista são registradas no histórico do sistema.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma lista selecionada</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Selecione uma turma e a data da aula no filtro acima para visualizar ou registrar a presença dos alunos.
          </p>
        </div>
      )}

      {/* Justification Modal */}
      {justificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Justificar Falta</h3>
              <button 
                onClick={() => setJustificationModal({ isOpen: false, studentId: null, text: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Motivo da falta</label>
              <textarea 
                value={justificationModal.text}
                onChange={(e) => setJustificationModal({ ...justificationModal, text: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none"
                rows={4}
                placeholder="Ex: Atestado médico entregue, problema de transporte..."
                autoFocus
              ></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setJustificationModal({ isOpen: false, studentId: null, text: '' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveJustification}
                disabled={!justificationModal.text.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-ngo-warning rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                Salvar Justificativa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
