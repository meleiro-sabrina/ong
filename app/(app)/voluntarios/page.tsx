'use client';

import { Plus, Search, Filter, Heart, Clock, Mail, Phone, Download, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';
import { useToast } from '@/components/ToastProvider';
import { useDeleteConfirmation } from '@/components/ConfirmationProvider';

// Função de formatação de telefone
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const initialVolunteers = [
  { id: 1, name: 'Roberto Almeida', email: 'roberto@email.com', phone: '(11) 98888-1111', role: 'Eventos', hours: 120, status: 'active' },
  { id: 2, name: 'Juliana Costa', email: 'juliana@email.com', phone: '(11) 97777-2222', role: 'Administrativo', hours: 45, status: 'active' },
  { id: 3, name: 'Marcos Pereira', email: 'marcos@email.com', phone: '(11) 96666-3333', role: 'Manutenção', hours: 12, status: 'inactive' },
];

export default function VoluntariosPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    hours: 0,
    status: 'active',
    avatar: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use modal body class hook
  useModalBodyClass(isModalOpen);
  
  // Toast hook
  const toast = useToast();
  
  // Delete confirmation hook
  const { confirmDelete } = useDeleteConfirmation();

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/volunteers', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar voluntários');
      const json = (await res.json()) as any;
      setVolunteers(Array.isArray(json.volunteers) ? json.volunteers : []);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
    } finally {
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
      role: '',
      hours: 0,
      status: 'active',
      avatar: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (vol: any) => {
    setFormData({
      id: vol.id || '',
      name: vol.name || '',
      email: vol.email || '',
      phone: vol.phone || '',
      role: vol.role || '',
      hours: vol.hours || 0,
      status: vol.status || 'active',
      avatar: vol.avatar || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Voluntário', async () => {
      try {
        const res = await fetch(`/api/volunteers/${id}` as any, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir voluntário');
        toast.deleted('Voluntário');
        await reload();
      } catch (e: any) {
        toast.error('Erro ao excluir voluntário', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    });
  };

  const handleSave = () => {
    (async () => {
      try {
        // Validação de campos obrigatórios
        const requiredFields = [
          { field: formData.name, label: 'Nome Completo' },
          { field: formData.email, label: 'E-mail' },
          { field: formData.phone, label: 'Telefone / WhatsApp' },
          { field: formData.role, label: 'Função / Área' },
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
          role: formData.role,
          hours: formData.hours,
          status: formData.status,
          avatar: formData.avatar,
        };

        if (!formData.id) {
          const res = await fetch('/api/volunteers', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao salvar voluntário' }));
            throw new Error(err.error || `Erro ${res.status}`);
          }
        } else {
          const res = await fetch(`/api/volunteers/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Falha ao atualizar voluntário' }));
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

  const filteredVolunteers = useMemo(() => volunteers.filter(vol => 
    String(vol.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(vol.role ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [volunteers, searchQuery]);

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
  } = usePagination({ items: filteredVolunteers, itemsPerPage: 10 });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Voluntários</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão da rede de apoio, funções e horas dedicadas.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button onClick={handleNew} className="bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Voluntário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mr-4">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Voluntários Ativos</p>
            <h2 className="text-2xl font-bold text-slate-900">38</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-ngo-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Horas Doadas (Mês)</p>
            <h2 className="text-2xl font-bold text-slate-900">340h</h2>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou função..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Função / Área</th>
                <th className="px-6 py-4 text-center">Horas Acumuladas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{vol.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-slate-600 text-xs">
                        <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                        {vol.email}
                      </div>
                      <div className="flex items-center text-slate-600 text-xs">
                        <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                        {vol.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {vol.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{vol.hours}h</td>
                  <td className="px-6 py-4">
                    {vol.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEdit(vol)} className="p-1.5 text-slate-400 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors" title="Editar Voluntário">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(vol.id)} className="p-1.5 text-slate-400 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors" title="Excluir Voluntário">
                        <Trash2 className="w-4 h-4" />
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
          {paginatedItems.map((vol) => (
            <div key={vol.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="font-medium text-slate-900">{vol.name}</div>
                {vol.status === 'active' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <div className="flex items-center text-slate-600 text-xs mb-1">
                    <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                    <span className="truncate">{vol.email}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-xs">
                    <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                    {vol.phone}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                    {vol.role}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{vol.hours}h doadas</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleEdit(vol)} className="p-2 text-slate-600 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </button>
                <button onClick={() => handleDelete(vol.id)} className="p-2 text-slate-600 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors flex items-center text-xs font-medium">
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredVolunteers.length} voluntários</div>
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

      {/* Modal Novo/Editar Voluntário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{!formData.id ? 'Cadastrar Voluntário' : 'Editar Voluntário'}</h2>
                <p className="text-sm text-slate-500">Preencha os dados do voluntário.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <form className="space-y-4">
                <div className="flex justify-center mb-4">
                  <AvatarUpload 
                    value={formData.avatar} 
                    onChange={(value: string) => setFormData({...formData, avatar: value})}
                    size="lg"
                    label="Foto do Voluntário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-ngo-danger">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: Roberto Almeida" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail <span className="text-ngo-danger">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp <span className="text-ngo-danger">*</span></label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Função / Área <span className="text-ngo-danger">*</span></label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: Eventos, Administrativo..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horas Acumuladas</label>
                  <input type="number" value={formData.hours} onChange={(e) => setFormData({...formData, hours: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
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
                Salvar Voluntário
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
