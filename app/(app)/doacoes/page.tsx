'use client';

import { Plus, Search, Download, X, HeartHandshake, Calendar as CalendarIcon, DollarSign, TrendingUp, ArrowUpRight, CheckCircle2, AlertCircle, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';
import { useToast } from '@/components/ToastProvider';
import { useDeleteConfirmation } from '@/components/ConfirmationProvider';

// Mock data for donations
const initialDonations = [
  { id: 1, donor: 'Empresa XYZ Ltda', amount: 5000.00, date: '2024-02-25', type: 'Recorrente', method: 'Transferência Bancária', status: 'completed', campaign: 'Reforma da Biblioteca' },
  { id: 2, donor: 'João Silva', amount: 150.00, date: '2024-02-28', type: 'Única', method: 'PIX', status: 'completed', campaign: 'Geral' },
  { id: 3, donor: 'Maria Oliveira', amount: 50.00, date: '2024-02-28', type: 'Recorrente', method: 'Cartão de Crédito', status: 'pending', campaign: 'Apadrinhamento' },
  { id: 4, donor: 'Anônimo', amount: 1000.00, date: '2024-02-20', type: 'Única', method: 'PIX', status: 'completed', campaign: 'Geral' },
];

export default function DonationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use modal body class hook
  useModalBodyClass(isModalOpen);
  
  // Toast hook
  const toast = useToast();
  
  // Delete confirmation hook
  const { confirmDelete } = useDeleteConfirmation();

  const [formData, setFormData] = useState({
    id: '',
    donor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Única',
    method: 'PIX',
    status: 'completed',
    campaign: 'Geral',
    notes: ''
  });

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/donations', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar doações');
      const json = (await res.json()) as any;
      setDonations(Array.isArray(json.donations) ? json.donations : []);
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
      donor: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Única',
      method: 'PIX',
      status: 'completed',
      campaign: 'Geral',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (donation: any) => {
    setFormData({
      id: donation.id || '',
      donor: donation.donor || '',
      amount: donation.amount?.toString() || '',
      date: donation.date || new Date().toISOString().split('T')[0],
      type: donation.type || 'Única',
      method: donation.method || 'PIX',
      status: donation.status || 'completed',
      campaign: donation.campaign || 'Geral',
      notes: donation.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirmDelete('Doação', async () => {
      try {
        const res = await fetch(`/api/donations/${id}` as any, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao excluir doação');
        toast.deleted('Doação');
        await reload();
      } catch (e: any) {
        toast.error('Erro ao excluir doação', typeof e?.message === 'string' ? e.message : 'Tente novamente mais tarde');
      }
    });
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          donor: formData.donor || 'Anônimo',
          amount: parseFloat(formData.amount) || 0,
          date: formData.date,
          type: formData.type,
          method: formData.method,
          status: formData.status,
          campaign: formData.campaign,
          notes: formData.notes,
        };

        if (!formData.id) {
          const res = await fetch('/api/donations', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao salvar doação');
        } else {
          const res = await fetch(`/api/donations/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao atualizar doação');
        }

        setIsModalOpen(false);
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  const filteredDonations = useMemo(() => donations.filter(donation => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          donation.campaign.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampaign = campaignFilter === '' || donation.campaign.toLowerCase().includes(campaignFilter.toLowerCase());
    return matchesSearch && matchesCampaign;
  }), [donations, searchQuery, campaignFilter]);

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
  } = usePagination({ items: filteredDonations, itemsPerPage: 10 });

  // Calculate stats
  const totalReceived = useMemo(() => donations.filter(d => d.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0), [donations]);
  const totalPending = useMemo(() => donations.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0), [donations]);
  
  // Mock expected recurring revenue (e.g., sum of all active recurring donor pledges)
  // In a real app, this would be calculated from a "Recurring Pledges" table, not just current month's transactions.
  const expectedRecurring = 7500.00; 

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doações e Captação</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe as receitas, doadores e campanhas ativas da ONG.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Relatório Financeiro
          </button>
          <button 
            onClick={handleNew}
            className="bg-ngo-accent hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Doação
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-ngo-accent" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center">
              Recebido este Mês
            </p>
            <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(totalReceived)}</h2>
            <p className="text-xs text-green-600 mt-2 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% em relação ao mês anterior
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <HeartHandshake className="w-24 h-24 text-ngo-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Previsão Recorrente (Mês)</p>
            <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(expectedRecurring)}</h2>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              De 45 doadores ativos
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-24 h-24 text-ngo-warning" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Recebimentos Pendentes</p>
            <h2 className="text-3xl font-bold text-slate-900">{formatCurrency(totalPending)}</h2>
            <p className="text-xs text-amber-600 mt-2 font-medium">
              Aguardando compensação
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por doador ou campanha..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary transition-all"
          />
        </div>
      </div>

      {/* Table & Mobile List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Doador</th>
                <th className="px-6 py-4">Campanha</th>
                <th className="px-6 py-4">Tipo / Método</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((donation) => (
                <tr key={donation.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDate(donation.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{donation.donor}</td>
                  <td className="px-6 py-4 text-slate-600">{donation.campaign}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-slate-700">{donation.type}</span>
                      <span className="text-xs text-slate-500">{donation.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {donation.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-ngo-accent border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors" title="Ver Recibo">
                        <ArrowUpRight className="w-4 h-4" />
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
          {paginatedItems.map((donation) => (
            <div key={donation.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{donation.donor}</div>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {formatDate(donation.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatCurrency(donation.amount)}</div>
                  <div className="mt-1">
                    {donation.status === 'completed' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-ngo-accent border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Campanha</div>
                  <div className="text-slate-700 text-xs font-medium">{donation.campaign}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Tipo / Método</div>
                  <div className="text-slate-700 text-xs font-medium">{donation.type}</div>
                  <div className="text-slate-500 text-[10px]">{donation.method}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button className="p-2 text-slate-600 hover:text-ngo-primary rounded-md hover:bg-blue-50 transition-colors flex items-center text-xs font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" /> Ver Recibo
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredDonations.length} doações</div>
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

      {/* Modal Nova Doação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Registrar Nova Doação</h2>
                <p className="text-sm text-slate-500">Insira os dados do recebimento para controle financeiro.</p>
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
              <form className="space-y-6">
                
                {/* Dados Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Doador / Empresa</label>
                    <input 
                      type="text" 
                      value={formData.donor}
                      onChange={(e) => setFormData({...formData, donor: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                      placeholder="Ex: João Silva (Deixe em branco para Anônimo)" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$) <span className="text-ngo-danger">*</span></label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary font-medium text-slate-900" 
                        placeholder="0,00" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data do Recebimento <span className="text-ngo-danger">*</span></label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary text-slate-600" 
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Classificação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Campanha / Destinação <span className="text-ngo-danger">*</span></label>
                    <select 
                      value={formData.campaign}
                      onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                    >
                      <option value="Geral">Fundo Geral (Livre)</option>
                      <option value="Reforma da Biblioteca">Reforma da Biblioteca</option>
                      <option value="Apadrinhamento">Apadrinhamento de Aluno</option>
                      <option value="Eventos">Eventos e Festividades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pagamento <span className="text-ngo-danger">*</span></label>
                    <select 
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Transferência Bancária">Transferência Bancária (TED/DOC)</option>
                      <option value="Boleto">Boleto</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Dinheiro">Dinheiro em Espécie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Doação <span className="text-ngo-danger">*</span></label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                    >
                      <option value="Única">Doação Única</option>
                      <option value="Recorrente">Doação Recorrente (Mensal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status do Pagamento <span className="text-ngo-danger">*</span></label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                    >
                      <option value="completed">Confirmado / Recebido</option>
                      <option value="pending">Pendente / Aguardando Compensação</option>
                    </select>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações Internas</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none" 
                    rows={3} 
                    placeholder="Ex: Doação referente ao evento de fim de ano..."
                  ></textarea>
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
                Registrar Receita
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
