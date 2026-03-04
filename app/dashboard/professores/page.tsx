'use client';

import { Plus, Search, Filter, Edit2, Download, X, Mail, Phone, BookOpen, UserSquare2, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { AvatarUpload } from '@/components/AvatarUpload';

// Funções de formatação
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const initialProfessors = [
  { id: 1, name: 'Carlos Silva', email: 'carlos.silva@email.com', phone: '(11) 98765-4321', specialization: 'Informática e Tecnologia', type: 'Voluntário', activeClasses: 2, status: 'active' },
  { id: 2, name: 'Ana Paula Souza', email: 'ana.paula@email.com', phone: '(11) 91234-5678', specialization: 'Matemática e Exatas', type: 'Horista', activeClasses: 3, status: 'active' },
  { id: 3, name: 'John Doe', email: 'john.doe@email.com', phone: '(11) 99999-8888', specialization: 'Idiomas (Inglês)', type: 'CLT', activeClasses: 1, status: 'inactive' },
  { id: 4, name: 'Mariana Costa', email: 'mariana.costa@email.com', phone: '(11) 97777-6666', specialization: 'Artes e Cultura', type: 'Voluntário', activeClasses: 0, status: 'active' },
];

export default function ProfessorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [professors, setProfessors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contractType, setContractType] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialization: '',
    type: 'Voluntário',
    activeClasses: 0,
    status: 'active',
    cpf: '',
    birth: '',
    hourlyRate: '',
    monthlySalary: '',
    avatar: '',
  });

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/professors', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar professores');
      const json = (await res.json()) as any;
      const list = Array.isArray(json.professors) ? json.professors : [];
      // activeClasses is computed client-side for now.
      setProfessors(list.map((p: any) => ({ ...p, activeClasses: 0 })));
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
    } finally {
      setContractType('');
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleNew = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      specialization: '',
      type: '',
      activeClasses: 0,
      status: 'active',
      cpf: '',
      birth: '',
      hourlyRate: '',
      monthlySalary: '',
      avatar: '',
    });
    setContractType('');
    setIsModalOpen(true);
  };

  const handleEdit = (prof: any) => {
    setFormData({
      id: prof.id || '',
      name: prof.name || '',
      email: prof.email || '',
      phone: prof.phone || '',
      specialization: prof.specialization || '',
      type: prof.type || '',
      activeClasses: prof.activeClasses || 0,
      status: prof.status || 'active',
      cpf: prof.cpf || '',
      birth: prof.birth || '',
      hourlyRate: typeof prof.hourlyRate === 'number' ? String(prof.hourlyRate) : (prof.hourlyRate ? String(prof.hourlyRate) : ''),
      monthlySalary: typeof prof.monthlySalary === 'number' ? String(prof.monthlySalary) : (prof.monthlySalary ? String(prof.monthlySalary) : ''),
      avatar: prof.avatar || '',
    });
    const ct = String(prof.type || '').toLowerCase();
    setContractType(ct === 'voluntário' ? 'voluntario' : ct);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      (async () => {
        try {
          const res = await fetch(`/api/professors/${id}` as any, { method: 'DELETE' });
          if (!res.ok) throw new Error('Falha ao excluir professor');
          await reload();
        } catch (e: any) {
          alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
        }
      })();
    }
  };

  const handleSave = () => {
    (async () => {
      try {
        // Validação de campos obrigatórios
        const requiredFields = [
          { field: formData.name, label: 'Nome Completo' },
          { field: formData.cpf, label: 'CPF' },
          { field: formData.email, label: 'E-mail' },
          { field: formData.phone, label: 'Telefone / WhatsApp' },
          { field: formData.specialization, label: 'Especialidade / Disciplinas' },
          { field: formData.type, label: 'Tipo de Vínculo' },
        ];

        const emptyFields = requiredFields.filter(item => !item.field || item.field.trim() === '');
        if (emptyFields.length > 0) {
          alert(`Preencha os campos obrigatórios:\n${emptyFields.map(item => `• ${item.label}`).join('\n')}`);
          return;
        }

        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          type: formData.type,
          status: formData.status,
          cpf: formData.cpf,
          birth: formData.birth,
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
          monthlySalary: formData.monthlySalary ? Number(formData.monthlySalary) : null,
          avatar: formData.avatar,
        };

        if (!formData.id) {
          const res = await fetch('/api/professors', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao salvar professor' }));
            throw new Error(err.error || `Erro ${res.status}`);
          }
        } else {
          const res = await fetch(`/api/professors/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao atualizar professor' }));
            throw new Error(err.error || `Erro ${res.status}`);
          }
        }

        setIsModalOpen(false);
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  const filteredProfessors = useMemo(() => professors.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prof.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prof.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'todos' || prof.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  }), [professors, searchQuery, typeFilter]);

  // Paginação
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
  } = usePagination({ items: filteredProfessors, itemsPerPage: 10 });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Professores</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie o corpo docente, voluntários e seus vínculos.</p>
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
            Novo Professor
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou especialidade..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
        <div className="flex space-x-3">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white text-slate-600"
          >
            <option value="todos">Todos os Vínculos</option>
            <option value="voluntário">Voluntário</option>
            <option value="horista">Horista</option>
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
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
                <th className="px-6 py-4">Nome do Professor</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Especialidade</th>
                <th className="px-6 py-4">Vínculo</th>
                <th className="px-6 py-4 text-center">Turmas Ativas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((prof) => (
                <tr key={prof.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-ngo-primary flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                        {prof.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{prof.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-slate-600 text-xs">
                        <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                        {prof.email}
                      </div>
                      <div className="flex items-center text-slate-600 text-xs">
                        <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                        {prof.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{prof.specialization}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                      prof.type === 'Voluntário' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      prof.type === 'Horista' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {prof.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                      {prof.activeClasses}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {prof.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(prof)} className="p-1.5 text-slate-400 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors" title="Editar Professor">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prof.id)} className="p-1.5 text-slate-400 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors" title="Excluir Professor">
                        <Trash className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors" title="Ver Turmas">
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-200">
          {paginatedItems.map((prof) => (
            <div key={prof.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-ngo-primary flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                    {prof.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{prof.name}</div>
                    <div className="text-xs text-slate-500">{prof.specialization}</div>
                  </div>
                </div>
                {prof.status === 'active' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <div className="flex items-center text-slate-600 text-xs mb-1">
                    <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                    <span className="truncate">{prof.email}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-xs">
                    <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                    {prof.phone}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border mb-1 ${
                    prof.type === 'Voluntário' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    prof.type === 'Horista' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {prof.type}
                  </span>
                  <span className="text-xs text-slate-500">{prof.activeClasses} turmas ativas</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleEdit(prof)} className="p-2 text-slate-600 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </button>
                <button onClick={() => handleDelete(prof.id)} className="p-2 text-slate-600 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors flex items-center text-xs font-medium">
                  <Trash className="w-4 h-4 mr-1" /> Excluir
                </button>
                <button className="p-2 text-slate-600 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <BookOpen className="w-4 h-4 mr-1" /> Turmas
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredProfessors.length} professores</div>
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

      {/* Modal Novo Professor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{!formData.id ? 'Cadastrar Professor' : 'Editar Professor'}</h2>
                <p className="text-sm text-slate-500">Preencha os dados pessoais e o tipo de vínculo com a ONG.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form className="space-y-6">
                
                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <UserSquare2 className="w-4 h-4 mr-2 text-ngo-secondary" />
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
                      <AvatarUpload 
                        value={formData.avatar} 
                        onChange={(value: string) => setFormData({...formData, avatar: value})}
                        size="lg"
                        label="Foto do Professor"
                      />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-ngo-danger">*</span></label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: Carlos Silva" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF <span className="text-ngo-danger">*</span></label>
                      <input type="text" value={formData.cpf || ''} onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.birth || ''}
                        onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Contato */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-ngo-secondary" />
                    Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail <span className="text-ngo-danger">*</span></label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp <span className="text-ngo-danger">*</span></label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Vínculo e Especialidade */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-ngo-secondary" />
                    Atuação na ONG
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Especialidade / Disciplinas <span className="text-ngo-danger">*</span></label>
                      <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: Matemática, Informática Básica, Artes..." />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vínculo <span className="text-ngo-danger">*</span></label>
                      <select 
                        value={contractType}
                        onChange={(e) => {
                          const selectedType = e.target.value;
                          const typeMap: Record<string, string> = {
                            'voluntario': 'Voluntário',
                            'horista': 'Horista',
                            'clt': 'CLT',
                            'pj': 'PJ'
                          };
                          setFormData({...formData, type: typeMap[selectedType] || selectedType});
                          setContractType(selectedType);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                      >
                        <option value="">Selecione...</option>
                        <option value="voluntario">Voluntário</option>
                        <option value="horista">Horista</option>
                        <option value="clt">CLT</option>
                        <option value="pj">PJ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </div>

                    {/* Campos condicionais baseados no tipo de vínculo */}
                    {(contractType === 'horista' || contractType === 'pj') && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Valor por Hora/Aula (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                          placeholder="0,00"
                        />
                      </div>
                    )}

                    {contractType === 'clt' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Salário Mensal (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.monthlySalary}
                          onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                          placeholder="0,00"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </form>
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
                onClick={handleSave}
                className="px-6 py-2 text-sm font-medium text-white bg-ngo-accent rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                Salvar Professor
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
