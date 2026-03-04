'use client';

import { Plus, Search, Filter, Edit2, Trash2, Download, X, Users, Clock, Calendar as CalendarIcon, Info, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePagination } from '@/hooks/usePagination';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';
import { useToast } from '@/components/ToastProvider';
import { useDeleteConfirmation } from '@/components/ConfirmationProvider';

const initialClasses = [
  { id: 1, code: 'TUR-2024-0001', name: 'Informática Básica', professor: 'Carlos Silva', schedule: 'Seg, Qua - 14:00 às 16:00', status: 'active', currentStudents: 15, maxStudents: 20 },
  { id: 2, code: 'TUR-2024-0002', name: 'Reforço Escolar - Matemática', professor: 'Ana Paula', schedule: 'Ter, Qui - 09:00 às 11:00', status: 'active', currentStudents: 12, maxStudents: 15 },
  { id: 3, code: 'TUR-2024-0003', name: 'Inglês Intermediário', professor: 'John Doe', schedule: 'Sex - 14:00 às 17:00', status: 'suspended', currentStudents: 10, maxStudents: 20 },
  { id: 4, code: 'TUR-2023-0015', name: 'Artes Plásticas', professor: 'Mariana Costa', schedule: 'Sáb - 09:00 às 12:00', status: 'ended', currentStudents: 20, maxStudents: 20 },
];

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professors, setProfessors] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  
  const [schedules, setSchedules] = useState([{ id: 1, day: '', start: '', end: '' }]);

  // Use modal body class hook
  useModalBodyClass(isModalOpen);
  
  // Toast hook
  const toast = useToast();
  
  // Delete confirmation hook
  const { confirmDelete } = useDeleteConfirmation();

  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    professor: '',
    professor_substituto: '',
    schedule: '',
    startDate: '',
    endDate: '',
    costPerClass: '',
    professorPaymentType: '',
    status: 'active',
    currentStudents: 0,
    maxStudents: 20
  });

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/classes', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar turmas');
      const json = (await res.json()) as any;
      setClasses(Array.isArray(json.classes) ? json.classes : []);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const loadProfessors = async () => {
    try {
      const res = await fetch('/api/professors', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar professores');
      const json = await res.json();
      setProfessors(Array.isArray(json.professors) ? json.professors : []);
    } catch (e: any) {
      console.error('Erro ao carregar professores:', e);
    }
  };

  useEffect(() => {
    reload();
    loadProfessors();
  }, []);

  const handleNew = () => {
    setFormData({
      id: '',
      code: `TUR-2024-000${classes.length + 1}`,
      name: '',
      professor: '',
      professor_substituto: '',
      schedule: '',
      startDate: '',
      endDate: '',
      costPerClass: '',
      professorPaymentType: '',
      status: 'active',
      currentStudents: 0,
      maxStudents: 20
    });
    setSchedules([{ id: 1, day: '', start: '', end: '' }]);
    setActiveTab(1);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (cls: any) => {
    setFormData({
      id: cls.id || '',
      code: cls.code || '',
      name: cls.name || '',
      professor: cls.professor || '',
      professor_substituto: cls.professor_substituto || '',
      schedule: cls.schedule || '',
      startDate: cls.startDate || '',
      endDate: cls.endDate || '',
      costPerClass: typeof cls.costPerClass === 'number' ? String(cls.costPerClass) : (cls.costPerClass ? String(cls.costPerClass) : ''),
      professorPaymentType: cls.professorPaymentType || '',
      status: cls.status || 'active',
      currentStudents: cls.currentStudents || 0,
      maxStudents: cls.maxStudents || 20,
    });
    setActiveTab(1);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Turma', async () => {
      try {
        const res = await fetch(`/api/classes/${id}` as any, { method: 'DELETE' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Falha ao excluir turma (HTTP ${res.status})${txt ? `: ${txt}` : ''}`);
        }
        toast.deleted('Turma');
        await reload();
      } catch (e: any) {
        console.error('DELETE class error:', e);
        toast.error('Erro ao excluir turma', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    });
  };

  const inputClass = (fieldKey?: string) => {
    const base = 'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all';
    if (fieldKey && fieldErrors[fieldKey]) {
      return `${base} border-ngo-danger focus:border-ngo-danger focus:ring-ngo-danger`;
    }
    return `${base} border-slate-300 focus:border-ngo-secondary focus:ring-ngo-secondary`;
  };

  const validateTabsBefore = (targetTab: number) => {
    const nextErrors: Record<string, boolean> = {};
    const missingLabels: string[] = [];

    if (targetTab > activeTab) {
      if (!formData.name || formData.name.trim() === '') {
        nextErrors.name = true;
        missingLabels.push('Nome da Turma');
      }
      if (!formData.professor || formData.professor.trim() === '') {
        nextErrors.professor = true;
        missingLabels.push('Professor Responsável');
      }
    }

    setFieldErrors(prev => ({ ...prev, ...nextErrors }));
    const ok = missingLabels.length === 0;
    if (!ok) {
      toast.warning('Campos obrigatórios', 'Preencha os campos obrigatórios antes de avançar:\n' + missingLabels.map(l => '• ' + l).join('\n'));
    }
    return ok;
  };

  const goToTab = (nextTab: number) => {
    if (nextTab <= activeTab) {
      setActiveTab(nextTab);
      return;
    }

    if (validateTabsBefore(nextTab)) {
      setActiveTab(nextTab);
    }
  };

  const handleSave = () => {
    (async () => {
      try {
        const requiredFields = [
          { field: formData.name, label: 'Nome da Turma' },
          { field: formData.professor, label: 'Professor Responsável' },
          { field: formData.startDate, label: 'Data de Início' },
        ];

        const emptyFields = requiredFields.filter(item => !item.field || item.field.trim() === '');
        if (emptyFields.length > 0) {
          toast.error('Campos obrigatórios', 'Preencha os campos obrigatórios:\n' + emptyFields.map(item => '• ' + item.label).join('\n'));
          return;
        }

        const emptySchedules = schedules.filter(s => !s.day || !s.start || !s.end);
        if (emptySchedules.length > 0) {
          setFieldErrors(prev => ({ ...prev, schedules: true }));
          toast.error('Horários incompletos', 'Preencha todos os horários:\n• Dia da Semana\n• Horário de Início\n• Horário de Término');
          return;
        }

        const payload = {
          code: formData.code,
          name: formData.name,
          professor: formData.professor,
          professor_substituto: formData.professor_substituto || null,
          schedule: formData.schedule,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          costPerClass: formData.costPerClass ? Number(formData.costPerClass) : null,
          professorPaymentType: formData.professorPaymentType || null,
          status: formData.status,
          maxStudents: formData.maxStudents,
        };

        if (!formData.id) {
          const res = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`Falha ao salvar turma (HTTP ${res.status})${txt ? `: ${txt}` : ''}`);
          }
          toast.created('Turma');
        } else {
          const res = await fetch(`/api/classes/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`Falha ao atualizar turma (HTTP ${res.status})${txt ? `: ${txt}` : ''}`);
          }
          toast.updated('Turma');
        }

        setIsModalOpen(false);
        await reload();
      } catch (e: any) {
        toast.error('Erro ao salvar turma', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    })();
  };

  const filteredClasses = useMemo(() => classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cls.professor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todas' || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [classes, searchQuery, statusFilter]);

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
  } = usePagination({ items: filteredClasses, itemsPerPage: 10 });

  const tabs = [
    { id: 1, label: 'Dados Principais' },
    { id: 2, label: 'Horários' },
  ];

  const addSchedule = () => {
    setSchedules([...schedules, { id: Date.now(), day: '', start: '', end: '' }]);
  };

  const removeSchedule = (id: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const updateSchedule = (id: number, patch: Partial<{ day: string; start: string; end: string }>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
    if (fieldErrors.schedules) {
      setFieldErrors(prev => ({ ...prev, schedules: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Turmas</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie as turmas, horários e professores.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button 
            onClick={handleNew}
            className="bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, código ou professor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
        <div className="flex space-x-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white text-slate-600"
          >
            <option value="todas">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="suspended">Suspensas</option>
            <option value="ended">Encerradas</option>
          </select>
        </div>
      </div>

      {/* Table & Mobile List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nome da Turma</th>
                <th className="px-6 py-4">Professor</th>
                <th className="px-6 py-4">Horários</th>
                <th className="px-6 py-4">Ocupação</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500">{cls.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{cls.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>
                      <div>{cls.professor}</div>
                      {cls.professor_substituto && (
                        <div className="text-xs text-slate-500">Sub: {cls.professor_substituto}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {cls.schedule}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-slate-400" />
                      <span className={`font-medium ${cls.currentStudents >= cls.maxStudents ? 'text-ngo-danger' : 'text-slate-700'}`}>
                        {cls.currentStudents}
                      </span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-slate-500">{cls.maxStudents}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${cls.currentStudents >= cls.maxStudents ? 'bg-ngo-danger' : 'bg-ngo-secondary'}`} 
                        style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cls.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(cls)} className="p-1.5 text-slate-400 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors" title="Editar Turma">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-slate-400 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors" title="Excluir Turma">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link href={`/turmas/${cls.id}`} className="p-1.5 text-slate-400 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors" title="Gerenciar Alunos">
                        <Users className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-200">
          {paginatedItems.map((cls) => (
            <div key={cls.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{cls.name}</div>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">Código: {cls.code}</div>
                </div>
                <StatusBadge status={cls.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Professor</div>
                  <div className="text-slate-700">{cls.professor}</div>
                  {cls.professor_substituto && (
                    <div className="text-xs text-slate-500">Sub: {cls.professor_substituto}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Horários</div>
                  <div className="text-slate-700 flex items-center text-xs">
                    <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    <span className="truncate">{cls.schedule}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Ocupação</span>
                  <span className={`font-medium ${cls.currentStudents >= cls.maxStudents ? 'text-ngo-danger' : 'text-slate-700'}`}>
                    {cls.currentStudents} / {cls.maxStudents}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${cls.currentStudents >= cls.maxStudents ? 'bg-ngo-danger' : 'bg-ngo-secondary'}`} 
                    style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleEdit(cls)} className="p-2 text-slate-600 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </button>
                <button onClick={() => handleDelete(cls.id)} className="p-2 text-slate-600 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors flex items-center text-xs font-medium">
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </button>
                <Link href={`/turmas/${cls.id}`} className="p-2 text-slate-600 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <Users className="w-4 h-4 mr-1" /> Alunos
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredClasses.length} turmas</div>
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
      </div>

      {/* Modal Nova Turma */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{!formData.id ? 'Criar Nova Turma' : 'Editar Turma'}</h2>
                <p className="text-sm text-slate-500">Configure os detalhes e horários da turma.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Sidebar Tabs */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Sidebar Tabs */}
              <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 shrink-0 overflow-y-auto hidden md:block">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => goToTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-100 text-ngo-primary' 
                          : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 ${
                        activeTab === tab.id ? 'bg-ngo-primary text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {tab.id}
                      </span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form className="space-y-6">
                  
                  {/* 1. Dados Principais */}
                  <div className={activeTab === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">1. Dados Principais da Turma</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Turma <span className="text-ngo-danger">*</span></label>
                          <input type="text" value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false })); }} className={inputClass('name')} placeholder="Ex: Informática Básica" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Código Interno</label>
                          <div className="relative">
                            <input type="text" value={formData.code} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-500 font-mono" readOnly />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                              <Info className="w-4 h-4 text-slate-400 cursor-help" />
                              <div className="absolute hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg -top-10 -right-2 z-10">
                                Gerado automaticamente. Não pode ser editado.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                            <option value="active">Ativa</option>
                            <option value="suspended">Suspensa</option>
                            <option value="ended">Encerrada</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Professor Responsável <span className="text-ngo-danger">*</span></label>
                          <select value={formData.professor} onChange={(e) => { setFormData({...formData, professor: e.target.value}); if (fieldErrors.professor) setFieldErrors(prev => ({ ...prev, professor: false })); }} className={`${inputClass('professor')} bg-white`}>
                            <option value="">Selecione um professor...</option>
                            {professors.map((prof) => (
                              <option key={prof.id} value={prof.name}>{prof.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Professor Substituto (Opcional)</label>
                          <select 
                            value={formData.professor_substituto} 
                            onChange={(e) => setFormData({...formData, professor_substituto: e.target.value})} 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione um professor...</option>
                            {professors.map((prof) => (
                              <option key={prof.id} value={prof.name}>{prof.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional)</label>
                          <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none" placeholder="Breve descrição sobre o conteúdo da turma..."></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início <span className="text-ngo-danger">*</span></label>
                          <div className="relative">
                            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Término (Opcional)</label>
                          <div className="relative">
                            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-600"
                            />
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 md:col-span-2 my-2"></div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Máximo de Alunos (Opcional)</label>
                          <input type="number" value={formData.maxStudents} onChange={(e) => setFormData({...formData, maxStudents: Number(e.target.value)})} min="1" placeholder="Ex: 20" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Custo por Aula (Opcional)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.costPerClass}
                              onChange={(e) => setFormData({ ...formData, costPerClass: e.target.value })}
                              placeholder="0,00"
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Pagamento do Professor</label>
                          <select
                            value={formData.professorPaymentType}
                            onChange={(e) => setFormData({ ...formData, professorPaymentType: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="hora">Por Hora</option>
                            <option value="aula">Por Aula</option>
                            <option value="mensal">Mensal Fixo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Horários */}
                  <div className={activeTab === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-slate-900">2. Horários da Turma</h3>
                        <button 
                          type="button"
                          onClick={addSchedule}
                          className="text-sm font-medium text-ngo-secondary hover:text-blue-700 flex items-center transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar Horário
                        </button>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start">
                        <Info className="w-5 h-5 text-ngo-secondary mr-2 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600">
                          Adicione os dias e horários em que a turma acontece. O sistema validará sobreposições e garantirá que o horário de término seja maior que o de início.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {schedules.map((schedule, index) => (
                          <div key={schedule.id} className="flex items-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-700 mb-1">Dia da Semana <span className="text-ngo-danger">*</span></label>
                              <select value={schedule.day} onChange={(e) => updateSchedule(schedule.id, { day: e.target.value })} className={`${inputClass(fieldErrors.schedules ? 'schedules' : undefined)} bg-white`}>
                                <option value="">Selecione...</option>
                                <option value="1">Segunda-feira</option>
                                <option value="2">Terça-feira</option>
                                <option value="3">Quarta-feira</option>
                                <option value="4">Quinta-feira</option>
                                <option value="5">Sexta-feira</option>
                                <option value="6">Sábado</option>
                                <option value="0">Domingo</option>
                              </select>
                            </div>
                            <div className="w-32">
                              <label className="block text-xs font-medium text-slate-700 mb-1">Início <span className="text-ngo-danger">*</span></label>
                              <input type="time" value={schedule.start} onChange={(e) => updateSchedule(schedule.id, { start: e.target.value })} className={`${inputClass(fieldErrors.schedules ? 'schedules' : undefined)} bg-white`} />
                            </div>
                            <div className="w-32">
                              <label className="block text-xs font-medium text-slate-700 mb-1">Término <span className="text-ngo-danger">*</span></label>
                              <input type="time" value={schedule.end} onChange={(e) => updateSchedule(schedule.id, { end: e.target.value })} className={`${inputClass(fieldErrors.schedules ? 'schedules' : undefined)} bg-white`} />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeSchedule(schedule.id)}
                              disabled={schedules.length === 1}
                              className="p-2 text-slate-400 hover:text-ngo-danger hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                              title="Remover horário"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (activeTab < 2) {
                    goToTab(activeTab + 1);
                  } else {
                    handleSave();
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-ngo-accent rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                {activeTab < 2 ? 'Próximo →' : 'Salvar Turma'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Ativa</span>;
    case 'suspended':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-ngo-warning border border-amber-200">Suspensa</span>;
    case 'ended':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Encerrada</span>;
    default:
      return null;
  }
}
