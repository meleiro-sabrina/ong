'use client';

import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Download, X, Upload, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useStudents } from '@/hooks/useStudents';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';
import { useToast } from '@/components/ToastProvider';
import { useDeleteConfirmation } from '@/components/ConfirmationProvider';
import { useSaveLoading, useDeleteLoading } from '@/hooks/useLoadingStates';
import { LoadingButton } from '@/components/LoadingButton';

const formatDate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatRG = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
};

const initialStudents = [
  { id: 1, enrollment: '20240001', name: 'João Guilherme Silva', birth: '12/05/2010', guardian: 'Maria Silva', phone: '(11) 98765-4321', status: 'active' },
  { id: 2, enrollment: '20240002', name: 'Ana Clara Souza', birth: '23/08/2011', guardian: 'Carlos Souza', phone: '(11) 91234-5678', status: 'active' },
  { id: 3, enrollment: '20240003', name: 'Pedro Henrique Santos', birth: '04/11/2009', guardian: 'Fernanda Santos', phone: '(11) 99988-7766', status: 'inactive' },
  { id: 4, enrollment: '20240004', name: 'Beatriz Costa', birth: '15/02/2012', guardian: 'Roberto Costa', phone: '(11) 97766-5544', status: 'dropout' },
  { id: 5, enrollment: '20240005', name: 'Lucas Oliveira', birth: '30/07/2010', guardian: 'Juliana Oliveira', phone: '(11) 95544-3322', status: 'active' },
];

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [error, setError] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Use modal body class hook
  useModalBodyClass(isModalOpen);
  
  // Toast hook
  const toast = useToast();
  
  // Delete confirmation hook
  const { confirmDelete } = useDeleteConfirmation();
  
  // Loading states hooks
  const { executeSave, isSaving } = useSaveLoading();
  const { executeDelete, isDeleting } = useDeleteLoading();

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: studentsData, loading, error: studentsError, refetch } = useStudents(page, limit, statusFilter, searchQuery);
  const students = studentsData?.students || [];
  const pagination = studentsData?.pagination;

  const [formData, setFormData] = useState({
    id: '',
    enrollment: '',
    name: '',
    nomeSocial: '',
    birth: '',
    guardian: '',
    relationship: '',
    phone: '',
    status: 'active',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cpf: '',
    rg: '',
    guardianCpf: '',
    guardianRg: '',
    phone2: '',
    avatar: '',
    sexo: '',
    rede: '',
    turno: '',
    renda: '',
    turma: '',
    nacionalidade: 'Brasileira',
    orgaoEmissor: '',
    email: '',
    autorizadoBuscar: false,
    escolaAtual: '',
    serieAno: '',
    frequentandoRegularmente: true,
    jaRepetiuAno: false,
    numeroMoradores: '',
    recebeBeneficio: false,
    qualBeneficio: '',
    situacaoVulnerabilidade: '',
    possuiAlergias: false,
    quaisAlergias: '',
    usaMedicacao: false,
    quaisMedicacoes: '',
    possuiDeficiencia: false,
    qualDeficiencia: '',
    observacoesMedicas: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaTelefone: '',
    dataEntradaONG: '',
    observacoesAdministrativas: '',
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const handleNew = () => {
    setFormData({
      id: '',
      enrollment: `2024000${Math.floor(Math.random() * 1000)}`,
      name: '',
      nomeSocial: '',
      birth: '',
      guardian: '',
      relationship: '',
      phone: '',
      status: 'active',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cpf: '',
      rg: '',
      guardianCpf: '',
      guardianRg: '',
      phone2: '',
      avatar: '',
      sexo: '',
      rede: '',
      turno: '',
      renda: '',
      turma: '',
      nacionalidade: 'Brasileira',
      orgaoEmissor: '',
      email: '',
      autorizadoBuscar: false,
      escolaAtual: '',
      serieAno: '',
      frequentandoRegularmente: true,
      jaRepetiuAno: false,
      numeroMoradores: '',
      recebeBeneficio: false,
      qualBeneficio: '',
      situacaoVulnerabilidade: '',
      possuiAlergias: false,
      quaisAlergias: '',
      usaMedicacao: false,
      quaisMedicacoes: '',
      possuiDeficiencia: false,
      qualDeficiencia: '',
      observacoesMedicas: '',
      contatoEmergenciaNome: '',
      contatoEmergenciaTelefone: '',
      dataEntradaONG: '',
      observacoesAdministrativas: '',
    });
    setActiveTab(1);
    setCepError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (student: any) => {
    setFormData({
      id: student.id || '',
      enrollment: student.enrollment || '',
      name: student.name || '',
      nomeSocial: student.nomeSocial || '',
      birth: student.birth || '',
      guardian: student.guardian || '',
      relationship: student.relationship || '',
      phone: student.phone || '',
      status: student.status || 'active',
      cep: student.cep || '',
      street: student.street || '',
      number: student.number || '',
      complement: student.complement || '',
      neighborhood: student.neighborhood || '',
      city: student.city || '',
      state: student.state || '',
      cpf: student.cpf || '',
      rg: student.rg || '',
      guardianCpf: student.guardianCpf || '',
      guardianRg: student.guardianRg || '',
      phone2: student.phone2 || '',
      avatar: student.avatar || '',
      sexo: student.sexo || '',
      rede: student.rede || '',
      turno: student.turno || '',
      renda: student.renda || '',
      turma: student.turma || '',
      nacionalidade: student.nacionalidade || 'Brasileira',
      orgaoEmissor: student.orgaoEmissor || '',
      email: student.email || '',
      autorizadoBuscar: student.autorizadoBuscar || false,
      escolaAtual: student.escolaAtual || '',
      serieAno: student.serieAno || '',
      frequentandoRegularmente: student.frequentandoRegularmente !== undefined ? student.frequentandoRegularmente : true,
      jaRepetiuAno: student.jaRepetiuAno || false,
      numeroMoradores: student.numeroMoradores || '',
      recebeBeneficio: student.recebeBeneficio || false,
      qualBeneficio: student.qualBeneficio || '',
      situacaoVulnerabilidade: student.situacaoVulnerabilidade || '',
      possuiAlergias: student.possuiAlergias || false,
      quaisAlergias: student.quaisAlergias || '',
      usaMedicacao: student.usaMedicacao || false,
      quaisMedicacoes: student.quaisMedicacoes || '',
      possuiDeficiencia: student.possuiDeficiencia || false,
      qualDeficiencia: student.qualDeficiencia || '',
      observacoesMedicas: student.observacoesMedicas || '',
      contatoEmergenciaNome: student.contatoEmergenciaNome || '',
      contatoEmergenciaTelefone: student.contatoEmergenciaTelefone || '',
      dataEntradaONG: student.dataEntradaONG || '',
      observacoesAdministrativas: student.observacoesAdministrativas || '',
    });
    setActiveTab(1);
    setCepError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Aluno', async () => {
      return executeDelete(id, async () => {
        const res = await fetch(`/api/students/${id}` as any, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir aluno');
        toast.deleted('Aluno');
        await refetch();
      });
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
    const requiredByTab: Record<number, Array<{ key: string; label: string; value: string }>> = {
      1: [
        { key: 'name', label: 'Nome Completo', value: formData.name },
        { key: 'birth', label: 'Data de Nascimento', value: formData.birth },
      ],
      2: [
        { key: 'guardian', label: 'Nome do Responsável', value: formData.guardian },
        { key: 'relationship', label: 'Grau de Parentesco', value: formData.relationship },
        { key: 'phone', label: 'Telefone Principal', value: formData.phone },
      ],
      3: [
        { key: 'cep', label: 'CEP', value: formData.cep },
        { key: 'street', label: 'Rua', value: formData.street },
        { key: 'number', label: 'Número', value: formData.number },
        { key: 'neighborhood', label: 'Bairro', value: formData.neighborhood },
        { key: 'city', label: 'Cidade', value: formData.city },
        { key: 'state', label: 'Estado', value: formData.state },
      ],
    };

    const nextErrors: Record<string, boolean> = {};
    const missingLabels: string[] = [];

    for (let tab = 1; tab < targetTab; tab++) {
      const req = requiredByTab[tab] || [];
      for (const item of req) {
        if (!item.value || item.value.trim() === '') {
          nextErrors[item.key] = true;
          missingLabels.push(item.label);
        }
      }
    }

    setFieldErrors(nextErrors);
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
    executeSave(formData.id, async () => {
      try {
        const requiredFields = [
          { field: formData.name, label: 'Nome Completo' },
          { field: formData.birth, label: 'Data de Nascimento' },
          { field: formData.guardian, label: 'Nome do Responsável' },
          { field: formData.relationship, label: 'Grau de Parentesco' },
          { field: formData.phone, label: 'Telefone Principal' },
          { field: formData.cep, label: 'CEP' },
          { field: formData.street, label: 'Rua' },
          { field: formData.number, label: 'Número' },
          { field: formData.neighborhood, label: 'Bairro' },
          { field: formData.city, label: 'Cidade' },
          { field: formData.state, label: 'Estado' },
        ];

        const emptyFields = requiredFields.filter(item => !item.field || item.field.trim() === '');
        if (emptyFields.length > 0) {
          setFieldErrors(prev => {
            const next = { ...prev };
            next.name = !formData.name || formData.name.trim() === '';
            next.birth = !formData.birth || formData.birth.trim() === '';
            next.guardian = !formData.guardian || formData.guardian.trim() === '';
            next.relationship = !formData.relationship || formData.relationship.trim() === '';
            next.phone = !formData.phone || formData.phone.trim() === '';
            next.cep = !formData.cep || formData.cep.trim() === '';
            next.street = !formData.street || formData.street.trim() === '';
            next.number = !formData.number || formData.number.trim() === '';
            next.neighborhood = !formData.neighborhood || formData.neighborhood.trim() === '';
            next.city = !formData.city || formData.city.trim() === '';
            next.state = !formData.state || formData.state.trim() === '';
            return next;
          });
          toast.error('Campos obrigatórios', 'Preencha os campos obrigatórios:\n' + emptyFields.map(item => '• ' + item.label).join('\n'));
          return;
        }

        const payload = {
          enrollment: formData.enrollment,
          name: formData.name,
          nomeSocial: formData.nomeSocial,
          birth: formData.birth,
          guardian: formData.guardian,
          phone: formData.phone,
          status: formData.status,
          avatar: formData.avatar,
          cpf: formData.cpf,
          rg: formData.rg,
          relationship: formData.relationship,
          guardianCpf: formData.guardianCpf,
          guardianRg: formData.guardianRg,
          phone2: formData.phone2,
          cep: formData.cep,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          sexo: formData.sexo,
          rede: formData.rede,
          turno: formData.turno,
          renda: formData.renda,
          turma: formData.turma,
          nacionalidade: formData.nacionalidade,
          orgaoEmissor: formData.orgaoEmissor,
          email: formData.email,
          autorizadoBuscar: formData.autorizadoBuscar,
          escolaAtual: formData.escolaAtual,
          serieAno: formData.serieAno,
          frequentandoRegularmente: formData.frequentandoRegularmente,
          jaRepetiuAno: formData.jaRepetiuAno,
          numeroMoradores: formData.numeroMoradores,
          recebeBeneficio: formData.recebeBeneficio,
          qualBeneficio: formData.qualBeneficio,
          situacaoVulnerabilidade: formData.situacaoVulnerabilidade,
          possuiAlergias: formData.possuiAlergias,
          quaisAlergias: formData.quaisAlergias,
          usaMedicacao: formData.usaMedicacao,
          quaisMedicacoes: formData.quaisMedicacoes,
          possuiDeficiencia: formData.possuiDeficiencia,
          qualDeficiencia: formData.qualDeficiencia,
          observacoesMedicas: formData.observacoesMedicas,
          contatoEmergenciaNome: formData.contatoEmergenciaNome,
          contatoEmergenciaTelefone: formData.contatoEmergenciaTelefone,
          dataEntradaONG: formData.dataEntradaONG,
          observacoesAdministrativas: formData.observacoesAdministrativas,
        };

        if (!formData.id) {
          const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao salvar aluno' }));
            throw new Error(err.error || `Erro ${res.status}`);
          }
          toast.created('Aluno');
        } else {
          const res = await fetch(`/api/students/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao atualizar aluno' }));
            throw new Error(err.error || `Erro ${res.status}`);
          }
          toast.updated('Aluno');
        }

        setIsModalOpen(false);
        await refetch();
      } catch (e: any) {
        toast.error('Erro ao salvar aluno', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    });
  };

  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? students.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const goToPrevPage = () => {
    if (hasPrevPage) setPage((p) => Math.max(1, p - 1));
  };
  const goToNextPage = () => {
    if (hasNextPage) setPage((p) => Math.min(totalPages, p + 1));
  };

  const tabs = [
    { id: 1, label: 'Identificação' },
    { id: 2, label: 'Responsável' },
    { id: 3, label: 'Endereço' },
    { id: 4, label: 'Escolar' },
    { id: 5, label: 'Social' },
    { id: 6, label: 'Médico' },
    { id: 7, label: 'Controle' },
  ];

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }
    
    setLoadingCep(true);
    setCepError(null);
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        cep: cep,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));
    } catch (e) {
      setCepError('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alunos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os alunos matriculados na instituição.</p>
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
            Novo Aluno
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou matrícula..." 
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
            <option value="todos">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="dropout">Evasão</option>
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
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4">Nome do Aluno</th>
                <th className="px-6 py-4">Nascimento</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500">{student.enrollment}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600">{student.birth}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{student.guardian}</div>
                    <div className="text-xs text-slate-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(student)} className="p-1.5 text-slate-400 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)} 
                        disabled={isDeleting(student.id)}
                        className="p-1.5 text-slate-400 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        title="Excluir"
                      >
                        {isDeleting(student.id) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
          {students.map((student: any) => (
            <div key={student.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{student.name}</div>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">Matrícula: {student.enrollment}</div>
                </div>
                <StatusBadge status={student.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-slate-500 text-xs">Nascimento</div>
                  <div className="text-slate-700">{student.birth}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs">Responsável</div>
                  <div className="text-slate-700">{student.guardian}</div>
                  <div className="text-slate-500 text-xs">{student.phone}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleEdit(student)} className="p-2 text-slate-600 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(student.id)} 
                  disabled={isDeleting(student.id)}
                  className="p-2 text-slate-600 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors flex items-center text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting(student.id) ? (
                    <>
                      <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {totalItems} alunos</div>
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

      {/* Modal Novo Aluno (Multi-step) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{!formData.id ? 'Cadastrar Novo Aluno' : 'Editar Aluno'}</h2>
                <p className="text-sm text-slate-500">Preencha o dossiê completo do aluno.</p>
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
                  
                  {/* 1. Identificação */}
                  <div className={activeTab === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">1. Identificação do Aluno</h3>
                      
                      <div className="flex flex-col sm:flex-row gap-6 mb-6">
                        {/* Foto Upload */}
                        <AvatarUpload 
                          value={formData.avatar} 
                          onChange={(value) => setFormData({...formData, avatar: value})}
                          size="lg"
                          label="Foto do Aluno"
                        />
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-ngo-danger">*</span></label>
                            <input type="text" value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false })); }} className={inputClass('name')} placeholder="Ex: João da Silva" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Social (Opcional)</label>
                            <input 
                              type="text" 
                              value={formData.nomeSocial || ''}
                              onChange={(e) => setFormData({...formData, nomeSocial: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento <span className="text-ngo-danger">*</span></label>
                          <input type="text" value={formData.birth} onChange={(e) => { setFormData({...formData, birth: formatDate(e.target.value)}); if (fieldErrors.birth) setFieldErrors(prev => ({ ...prev, birth: false })); }} placeholder="DD/MM/AAAA" className={`${inputClass('birth')} text-slate-600`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                          <select 
                            value={formData.sexo}
                            onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nacionalidade</label>
                          <input 
                            type="text" 
                            value={formData.nacionalidade || 'Brasileira'}
                            onChange={(e) => setFormData({...formData, nacionalidade: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CPF (Opcional)</label>
                          <input type="text" value={formData.cpf || ''} onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">RG (Opcional)</label>
                          <input type="text" value={formData.rg || ''} onChange={(e) => setFormData({...formData, rg: formatRG(e.target.value)})} placeholder="00.000.000-0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Órgão Emissor</label>
                          <input 
                            type="text" 
                            value={formData.orgaoEmissor || ''}
                            onChange={(e) => setFormData({...formData, orgaoEmissor: e.target.value})}
                            placeholder="SSP/SP" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Responsável Legal */}
                  <div className={activeTab === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">2. Responsável Legal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável <span className="text-ngo-danger">*</span></label>
                          <input type="text" value={formData.guardian} onChange={(e) => { setFormData({...formData, guardian: e.target.value}); if (fieldErrors.guardian) setFieldErrors(prev => ({ ...prev, guardian: false })); }} className={inputClass('guardian')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Grau de Parentesco <span className="text-ngo-danger">*</span></label>
                          <select 
                            value={formData.relationship}
                            onChange={(e) => { 
                              console.log('Relationship selected:', e.target.value);
                              console.log('Current formData.relationship:', formData.relationship);
                              setFormData({...formData, relationship: e.target.value}); 
                              if (fieldErrors.relationship) setFieldErrors(prev => ({ ...prev, relationship: false })); 
                            }}
                            className={`${inputClass('relationship')} bg-white`}
                          >
                            <option value="">Selecione...</option>
                            <option value="mae">Mãe</option>
                            <option value="pai">Pai</option>
                            <option value="avo">Avô/Avó</option>
                            <option value="tio">Tio/Tia</option>
                            <option value="outro">Outro (Tutor Legal)</option>
                          </select>
                          {formData.relationship && <span className="text-xs text-green-600 mt-1 block">Valor atual: {formData.relationship}</span>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            value={formData.email || ''}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="email@exemplo.com" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Responsável</label>
                          <input type="text" value={formData.guardianCpf || ''} onChange={(e) => setFormData({...formData, guardianCpf: formatCPF(e.target.value)})} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">RG do Responsável</label>
                          <input type="text" value={formData.guardianRg || ''} onChange={(e) => setFormData({...formData, guardianRg: formatRG(e.target.value)})} placeholder="00.000.000-0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Principal <span className="text-ngo-danger">*</span></label>
                          <input type="tel" value={formData.phone} onChange={(e) => { setFormData({...formData, phone: formatPhone(e.target.value)}); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: false })); }} placeholder="(00) 00000-0000" className={inputClass('phone')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Secundário</label>
                          <input type="tel" value={formData.phone2 || ''} onChange={(e) => setFormData({...formData, phone2: formatPhone(e.target.value)})} placeholder="(00) 00000-0000" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                        </div>
                        <div className="md:col-span-2 mt-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.autorizadoBuscar}
                              onChange={(e) => setFormData({...formData, autorizadoBuscar: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Autorizado a buscar o aluno na ONG?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Endereço */}
                  <div className={activeTab === 3 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">3. Endereço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CEP <span className="text-ngo-danger">*</span></label>
                          <div className="flex space-x-2">
                            <input 
                              type="text" 
                              value={formData.cep} 
                              onChange={(e) => { setFormData({...formData, cep: formatCEP(e.target.value)}); if (fieldErrors.cep) setFieldErrors(prev => ({ ...prev, cep: false })); }}
                              placeholder="00000-000" 
                              className={inputClass('cep')} 
                            />
                            <button 
                              type="button" 
                              onClick={() => fetchCep(formData.cep)}
                              disabled={loadingCep}
                              className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                              {loadingCep ? '...' : 'Buscar'}
                            </button>
                          </div>
                          {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Rua <span className="text-ngo-danger">*</span></label>
                          <input 
                            type="text" 
                            value={formData.street}
                            onChange={(e) => { setFormData({...formData, street: e.target.value}); if (fieldErrors.street) setFieldErrors(prev => ({ ...prev, street: false })); }}
                            className={inputClass('street')} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Número <span className="text-ngo-danger">*</span></label>
                          <input 
                            type="text" 
                            value={formData.number}
                            onChange={(e) => { setFormData({...formData, number: e.target.value}); if (fieldErrors.number) setFieldErrors(prev => ({ ...prev, number: false })); }}
                            className={inputClass('number')} 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                          <input 
                            type="text" 
                            value={formData.complement}
                            onChange={(e) => setFormData({...formData, complement: e.target.value})}
                            placeholder="Apto, Bloco, Casa 2..." 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Bairro <span className="text-ngo-danger">*</span></label>
                          <input 
                            type="text" 
                            value={formData.neighborhood}
                            onChange={(e) => { setFormData({...formData, neighborhood: e.target.value}); if (fieldErrors.neighborhood) setFieldErrors(prev => ({ ...prev, neighborhood: false })); }}
                            className={inputClass('neighborhood')} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cidade <span className="text-ngo-danger">*</span></label>
                          <input 
                            type="text" 
                            value={formData.city}
                            onChange={(e) => { setFormData({...formData, city: e.target.value}); if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: false })); }}
                            className={inputClass('city')} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Estado <span className="text-ngo-danger">*</span></label>
                          <input 
                            type="text" 
                            value={formData.state}
                            onChange={(e) => { setFormData({...formData, state: e.target.value}); if (fieldErrors.state) setFieldErrors(prev => ({ ...prev, state: false })); }}
                            className={inputClass('state')} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Escolar */}
                  <div className={activeTab === 4 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">4. Informações Escolares</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Escola Atual</label>
                          <input 
                            type="text" 
                            value={formData.escolaAtual || ''}
                            onChange={(e) => setFormData({...formData, escolaAtual: e.target.value})}
                            placeholder="Nome da escola" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Rede</label>
                          <select 
                            value={formData.rede}
                            onChange={(e) => setFormData({...formData, rede: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="publica_municipal">Pública Municipal</option>
                            <option value="publica_estadual">Pública Estadual</option>
                            <option value="privada">Privada</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Série/Ano</label>
                          <input 
                            type="text" 
                            value={formData.serieAno || ''}
                            onChange={(e) => setFormData({...formData, serieAno: e.target.value})}
                            placeholder="Ex: 5º Ano" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Turno Escolar</label>
                          <select 
                            value={formData.turno}
                            onChange={(e) => setFormData({...formData, turno: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="manha">Manhã</option>
                            <option value="tarde">Tarde</option>
                            <option value="noite">Noite</option>
                            <option value="integral">Integral</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-center space-y-3 mt-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.frequentandoRegularmente}
                              onChange={(e) => setFormData({...formData, frequentandoRegularmente: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Está frequentando regularmente?</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.jaRepetiuAno}
                              onChange={(e) => setFormData({...formData, jaRepetiuAno: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Já repetiu de ano?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Social */}
                  <div className={activeTab === 5 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">5. Informações Sociais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Renda Familiar (Faixa)</label>
                          <select 
                            value={formData.renda}
                            onChange={(e) => setFormData({...formData, renda: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione...</option>
                            <option value="ate_1">Até 1 salário mínimo</option>
                            <option value="1_a_2">De 1 a 2 salários mínimos</option>
                            <option value="2_a_3">De 2 a 3 salários mínimos</option>
                            <option value="mais_3">Mais de 3 salários mínimos</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Número de Moradores na Casa</label>
                          <input 
                            type="number" 
                            min="1" 
                            value={formData.numeroMoradores || ''}
                            onChange={(e) => setFormData({...formData, numeroMoradores: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div className="md:col-span-2 mt-2">
                          <label className="flex items-center space-x-2 cursor-pointer mb-3">
                            <input 
                              type="checkbox" 
                              checked={formData.recebeBeneficio}
                              onChange={(e) => setFormData({...formData, recebeBeneficio: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Recebe benefício social?</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.qualBeneficio || ''}
                            onChange={(e) => setFormData({...formData, qualBeneficio: e.target.value})}
                            placeholder="Qual benefício? (Ex: Bolsa Família)" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Situação de Vulnerabilidade (Opcional)</label>
                          <textarea 
                            rows={3} 
                            value={formData.situacaoVulnerabilidade || ''}
                            onChange={(e) => setFormData({...formData, situacaoVulnerabilidade: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none" 
                            placeholder="Descreva brevemente se houver alguma situação específica..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. Médico */}
                  <div className={activeTab === 6 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-slate-900">6. Informações Médicas</h3>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                          Dados Protegidos
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input 
                              type="checkbox" 
                              checked={formData.possuiAlergias}
                              onChange={(e) => setFormData({...formData, possuiAlergias: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Possui alergias?</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.quaisAlergias || ''}
                            onChange={(e) => setFormData({...formData, quaisAlergias: e.target.value})}
                            placeholder="Quais alergias?" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input 
                              type="checkbox" 
                              checked={formData.usaMedicacao}
                              onChange={(e) => setFormData({...formData, usaMedicacao: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Usa medicação contínua?</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.quaisMedicacoes || ''}
                            onChange={(e) => setFormData({...formData, quaisMedicacoes: e.target.value})}
                            placeholder="Quais medicações?" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input 
                              type="checkbox" 
                              checked={formData.possuiDeficiencia}
                              onChange={(e) => setFormData({...formData, possuiDeficiencia: e.target.checked})}
                              className="w-4 h-4 text-ngo-primary border-slate-300 rounded focus:ring-ngo-primary" 
                            />
                            <span className="text-sm font-medium text-slate-700">Possui deficiência?</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.qualDeficiencia || ''}
                            onChange={(e) => setFormData({...formData, qualDeficiencia: e.target.value})}
                            placeholder="Qual deficiência?" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Observações Médicas Adicionais</label>
                          <textarea 
                            rows={2} 
                            value={formData.observacoesMedicas || ''}
                            onChange={(e) => setFormData({...formData, observacoesMedicas: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none"
                          ></textarea>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contato de Emergência Adicional</label>
                          <div className="flex space-x-2">
                            <input 
                              type="text" 
                              value={formData.contatoEmergenciaNome || ''}
                              onChange={(e) => setFormData({...formData, contatoEmergenciaNome: e.target.value})}
                              placeholder="Nome" 
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                            />
                            <input 
                              type="tel" 
                              value={formData.contatoEmergenciaTelefone || ''}
                              onChange={(e) => setFormData({...formData, contatoEmergenciaTelefone: e.target.value})}
                              placeholder="(00) 00000-0000" 
                              className="w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7. Status e Controle Interno */}
                  <div className={activeTab === 7 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">7. Status e Controle Interno</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status do Aluno</label>
                          <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="dropout">Desistente</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrada na ONG</label>
                          <input 
                            type="date" 
                            value={formData.dataEntradaONG || ''}
                            onChange={(e) => setFormData({...formData, dataEntradaONG: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-600" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Turma Atual</label>
                          <select 
                            value={formData.turma}
                            onChange={(e) => setFormData({...formData, turma: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                          >
                            <option value="">Selecione uma turma (opcional)...</option>
                            <option value="1">Turma Manhã - Informática Básica</option>
                            <option value="2">Turma Tarde - Reforço Escolar</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Observações Administrativas</label>
                          <textarea 
                            rows={3} 
                            value={formData.observacoesAdministrativas || ''}
                            onChange={(e) => setFormData({...formData, observacoesAdministrativas: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none" 
                            placeholder="Anotações internas da secretaria..."
                          ></textarea>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Documentos Anexos</label>
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-700">Clique para anexar documentos</p>
                            <p className="text-xs text-slate-500 mt-1">RG, CPF, Comprovante de Residência (PDF, JPG)</p>
                          </div>
                        </div>
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
              <LoadingButton
                onClick={() => {
                  if (activeTab < 7) {
                    goToTab(activeTab + 1);
                  } else {
                    handleSave();
                  }
                }}
                loading={activeTab >= 7 && isSaving(formData.id)}
                loadingText={activeTab < 7 ? 'Avançando...' : 'Salvando...'}
                className="px-6 py-2"
              >
                {activeTab < 7 ? 'Próximo →' : 'Salvar Dossiê'}
              </LoadingButton>
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
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>;
    case 'inactive':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-ngo-warning border border-amber-200">Inativo</span>;
    case 'dropout':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-ngo-danger border border-red-200">Evasão</span>;
    default:
      return null;
  }
}
