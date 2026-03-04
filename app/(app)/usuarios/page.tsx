'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';
import { useToast } from '@/components/ToastProvider';
import { useDeleteConfirmation } from '@/components/ConfirmationProvider';

const modulesList = [
  'Alunos', 'Turmas', 'Professores', 'Voluntários', 'Presença', 'Calendário', 
  'Documentos', 'Mensagens', 'Doações', 'Estoque', 'Relatórios'
];

interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  [module: string]: Permission;
}

const defaultPermissions: UserPermissions = {};
modulesList.forEach(mod => {
  defaultPermissions[mod] = { view: true, edit: false, delete: false };
});

export default function UsuariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use modal body class hook
  useModalBodyClass(isModalOpen);
  
  // Toast hook
  const toast = useToast();
  
  // Delete confirmation hook
  const { confirmDelete } = useDeleteConfirmation();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Voluntário',
    status: 'active',
    permissions: defaultPermissions,
  });

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar usuários');
      const json = (await res.json()) as any;
      setUsers(Array.isArray(json.users) ? json.users : []);
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
      role: 'Voluntário', 
      status: 'active',
      permissions: { ...defaultPermissions }
    });
    setIsModalOpen(true);
  };

  const handleEdit = (u: any) => {
    const userPermissions = u.permissions ? JSON.parse(u.permissions) : { ...defaultPermissions };
    setFormData({
      id: u.id,
      name: u.name ?? '',
      email: u.email ?? '',
      role: u.role ?? 'Voluntário',
      status: u.status ?? 'active',
      permissions: userPermissions,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Usuário', async () => {
      try {
        const res = await fetch(`/api/users/${id}` as any, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir usuário');
        toast.deleted('Usuário');
        await reload();
      } catch (e: any) {
        toast.error('Erro ao excluir usuário', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    });
  };

  const handlePermissionChange = (module: string, action: keyof Permission, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked
        }
      }
    }));
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          permissions: JSON.stringify(formData.permissions),
        };

        if (!payload.name.trim() || !payload.email.trim()) {
          alert('Preencha nome e email.');
          return;
        }

        if (!formData.id) {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao salvar usuário');
        } else {
          const res = await fetch(`/api/users/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao atualizar usuário');
        }

        setIsModalOpen(false);
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      String(user.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(user.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

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
  } = usePagination({ items: filteredUsers, itemsPerPage: 10 });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários e Permissões</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie quem tem acesso ao sistema e o que podem fazer.</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-ngo-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-6 py-4 text-slate-600" colSpan={5}>Carregando...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="px-6 py-4 text-slate-600" colSpan={5}>{error}</td>
                </tr>
              )}
              {!loading && !error && paginatedItems.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-ngo-primary flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      <Shield className="w-3 h-3 mr-1.5 text-slate-500" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors" title="Editar Permissões">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors" title="Excluir">
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
          {paginatedItems.map((user) => (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-ngo-primary flex items-center justify-center font-bold text-sm mr-3 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                {user.status === 'active' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-ngo-accent border border-green-200">Ativo</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Inativo</span>
                )}
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                  <Shield className="w-3 h-3 mr-1.5 text-slate-500" />
                  {user.role}
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-slate-600 hover:text-ngo-secondary rounded-md hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-ngo-danger rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredUsers.length} usuários</div>
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

      {/* Modal Novo Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Novo Usuário</h2>
                <p className="text-sm text-slate-500">Configure os dados de acesso e as permissões.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-8">
                
                {/* Dados Básicos */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Dados de Acesso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: João Silva" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Ex: joao@ong.org" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Perfil Base</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                        <option value="Voluntário">Personalizado</option>
                        <option value="Administrador">Administrador (Acesso Total)</option>
                        <option value="Coordenador">Coordenador</option>
                        <option value="Professor">Professor / Voluntário</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Senha Provisória *</label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" placeholder="Será enviada por email" />
                    </div>
                  </div>
                </section>

                {/* Permissões */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Permissões por Módulo</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                          <tr>
                            <th className="px-4 py-3">Módulo</th>
                            <th className="px-4 py-3 text-center">Ver</th>
                            <th className="px-4 py-3 text-center">Editar / Criar</th>
                            <th className="px-4 py-3 text-center">Apagar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {modulesList.map((mod) => (
                            <tr key={mod} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-700">{mod}</td>
                              <td className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={formData.permissions[mod]?.view ?? true}
                                  onChange={(e) => handlePermissionChange(mod, 'view', e.target.checked)}
                                  className="w-4 h-4 text-ngo-primary rounded border-slate-300 focus:ring-ngo-primary" 
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={formData.permissions[mod]?.edit ?? false}
                                  onChange={(e) => handlePermissionChange(mod, 'edit', e.target.checked)}
                                  className="w-4 h-4 text-ngo-primary rounded border-slate-300 focus:ring-ngo-primary" 
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={formData.permissions[mod]?.delete ?? false}
                                  onChange={(e) => handlePermissionChange(mod, 'delete', e.target.checked)}
                                  className="w-4 h-4 text-ngo-danger rounded border-slate-300 focus:ring-ngo-danger" 
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-ngo-primary hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                Salvar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
