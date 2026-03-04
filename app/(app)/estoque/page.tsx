'use client';

import { Plus, Search, Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/hooks/usePagination';

const initialItems = [
  { id: 1, name: 'Cesta Básica', category: 'Alimentos', quantity: 45, unit: 'unidades', minQuantity: 20, status: 'good' },
  { id: 2, name: 'Cadernos Universitários', category: 'Material Escolar', quantity: 12, unit: 'unidades', minQuantity: 50, status: 'low' },
  { id: 3, name: 'Notebooks (Doação)', category: 'Equipamentos', quantity: 5, unit: 'unidades', minQuantity: 2, status: 'good' },
  { id: 4, name: 'Kits de Higiene', category: 'Higiene', quantity: 8, unit: 'kits', minQuantity: 15, status: 'low' },
];

export default function EstoquePage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    quantity: 0,
    unit: 'unidades',
    minQuantity: 10,
    notes: '',
  });

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/stock-items', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar itens');
      const json = (await res.json()) as any;
      const list = Array.isArray(json.items) ? json.items : [];
      setItems(
        list.map((it: any) => {
          const quantity = typeof it.quantity === 'number' ? it.quantity : 0;
          const minQuantity = typeof it.minQuantity === 'number' ? it.minQuantity : 0;
          const status = quantity < minQuantity ? 'low' : 'good';
          return { ...it, quantity, minQuantity, status };
        })
      );
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
    setFormData({ id: '', name: '', category: '', quantity: 0, unit: 'unidades', minQuantity: 10, notes: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id || '',
      name: item.name || '',
      category: item.category || '',
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      unit: item.unit || 'unidades',
      minQuantity: typeof item.minQuantity === 'number' ? item.minQuantity : 10,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          unit: formData.unit,
          minQuantity: formData.minQuantity,
          notes: formData.notes,
        };

        if (!payload.name.trim() || !payload.category.trim() || !payload.unit.trim()) {
          alert('Preencha nome, categoria e unidade.');
          return;
        }

        if (!formData.id) {
          const res = await fetch('/api/stock-items', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao salvar item');
        } else {
          const res = await fetch(`/api/stock-items/${formData.id}` as any, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Falha ao atualizar item');
        }

        setIsModalOpen(false);
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  const filteredItems = useMemo(() => items.filter(item =>
    String(item.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(item.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [items, searchQuery]);

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
  } = usePagination({ items: filteredItems, itemsPerPage: 10 });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque e Doações Físicas</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de entrada e saída de materiais, alimentos e equipamentos.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </button>
          <button 
            onClick={handleNew}
            className="bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
            <Package className="w-6 h-6 text-ngo-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Itens</p>
            <h2 className="text-2xl font-bold text-slate-900">142</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>
            <h2 className="text-2xl font-bold text-slate-900">12</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <button className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-xl flex flex-col items-center justify-center transition-colors border border-green-100">
            <ArrowDownToLine className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Entrada</span>
          </button>
          <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl flex flex-col items-center justify-center transition-colors border border-red-100">
            <ArrowUpFromLine className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Saída</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar item ou categoria..." 
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
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Quantidade</th>
                <th className="px-6 py-4 text-center">Status</th>
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
              {!loading && !error && paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-700">{item.quantity}</span>
                    <span className="text-slate-500 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === 'low' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Baixo</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-ngo-primary hover:text-blue-800 font-medium text-xs">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-200">
          {paginatedItems.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.category}</div>
                </div>
                {item.status === 'low' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 border border-red-200">Baixo</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">Normal</span>
                )}
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Quantidade</div>
                  <div className="font-bold text-slate-700 text-lg">
                    {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-white border border-slate-200 text-ngo-primary hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm">
                  Ajustar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div>Mostrando {startItem} a {endItem} de {filteredItems.length} itens</div>
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

      {/* Modal Novo Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cadastrar Novo Item</h2>
                <p className="text-sm text-slate-500">Adicione um novo material ou doação ao estoque.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Cesta Básica Tipo 1" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria <span className="text-red-500">*</span></label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                      <option value="">Selecione...</option>
                      <option value="Alimentos">Alimentos</option>
                      <option value="Material Escolar">Material Escolar</option>
                      <option value="Equipamentos">Equipamentos</option>
                      <option value="Higiene">Higiene e Limpeza</option>
                      <option value="Vestuario">Vestuário</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida <span className="text-red-500">*</span></label>
                    <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                      <option value="unidades">Unidades (un)</option>
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="litros">Litros (L)</option>
                      <option value="kits">Kits / Cestas</option>
                      <option value="caixas">Caixas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Inicial</label>
                    <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} min={0} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                    <input type="number" value={formData.minQuantity} onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})} min={0} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                    <p className="text-xs text-slate-500 mt-1">O sistema avisará se o estoque ficar abaixo deste valor.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observações / Descrição</label>
                    <textarea 
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Detalhes adicionais sobre o item..." 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none"
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-ngo-primary hover:bg-blue-900 rounded-lg transition-colors shadow-sm"
              >
                Salvar Item
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
