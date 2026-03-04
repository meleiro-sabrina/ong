'use client';

import { MessageSquare, Send, Mail, Smartphone, Users, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/hooks/usePagination';

export default function MensagensPage() {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [audience, setAudience] = useState('parents');
  const [message, setMessage] = useState('');

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/messages', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar histórico');
      const json = (await res.json()) as any;
      setHistory(Array.isArray(json.messages) ? json.messages : []);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Paginação do histórico
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
  } = usePagination({ items: history, itemsPerPage: 10 });

  const handleSend = () => {
    (async () => {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channel, audience, message }),
        });
        if (!res.ok) throw new Error('Falha ao enviar mensagem');
        setMessage('');
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Comunicação</h1>
        <p className="text-sm text-slate-500 mt-1">Disparo de mensagens em massa via WhatsApp ou E-mail.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Nova Mensagem</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Canal de Envio</label>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center transition-all ${channel === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Smartphone className="w-5 h-5 mr-2" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => setChannel('email')}
                    className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center transition-all ${channel === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    E-mail
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Público Alvo</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                >
                  <option value="parents">Responsáveis (Todos)</option>
                  <option value="students">Alunos (Todos)</option>
                  <option value="volunteers">Voluntários e Professores</option>
                  <option value="donors">Doadores Recorrentes</option>
                  <option value="class_info">Turma Específica: Informática Básica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mensagem</label>
                <textarea 
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva sua mensagem aqui. Use [Nome] para personalizar."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary resize-none"
                ></textarea>
                <p className="text-xs text-slate-500 mt-2">
                  Tags disponíveis: <span className="font-mono bg-slate-100 px-1 rounded">[Nome]</span>, <span className="font-mono bg-slate-100 px-1 rounded">[Turma]</span>
                </p>
              </div>

              <button 
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full bg-ngo-primary hover:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>

        {/* History / Templates */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <History className="w-5 h-5 mr-2 text-slate-400" />
              Últimos Envios
            </h2>
            <div className="space-y-4">
              {loading && <div className="text-sm text-slate-500">Carregando...</div>}
              {!loading && error && <div className="text-sm text-slate-500">{error}</div>}
              {!loading && !error && history.length === 0 && (
                <div className="text-sm text-slate-500">Nenhum envio registrado.</div>
              )}
              {!loading && !error && paginatedItems.map((h) => (
                <div key={h.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    {h.channel === 'whatsapp' ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded flex items-center">
                        <Smartphone className="w-3 h-3 mr-1" /> WhatsApp
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded flex items-center">
                        <Mail className="w-3 h-3 mr-1" /> E-mail
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium mb-1">{String(h.message).slice(0, 60)}{String(h.message).length > 60 ? '…' : ''}</p>
                  <p className="text-xs text-slate-500">Enviado para: {h.audience}</p>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-3 mt-4">
              <div>Mostrando {startItem} a {endItem} de {history.length} envios</div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={goToPrevPage}
                  disabled={!hasPrevPage}
                  className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-xs"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  Anterior
                </button>
                <span className="px-2 py-1 text-xs">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-xs"
                >
                  Próxima
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
