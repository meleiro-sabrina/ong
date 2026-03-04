'use client';

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useModalBodyClass } from '@/hooks/useModalBodyClass';

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState('2026-02');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', title: '', type: 'class' });

  // Use modal body class hook
  useModalBodyClass(isModalOpen);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/calendar-events?month=${currentMonth}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar eventos');
      const json = (await res.json()) as any;
      setEvents(Array.isArray(json.events) ? json.events : []);
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [currentMonth]);

  const handleSave = () => {
    (async () => {
      try {
        if (!formData.date || !formData.title) {
          alert('Preencha data e título.');
          return;
        }
        const res = await fetch('/api/calendar-events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Falha ao salvar evento');
        setIsModalOpen(false);
        setFormData({ date: '', title: '', type: 'class' });
        await reload();
      } catch (e: any) {
        alert(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      }
    })();
  };

  const days = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendário Global</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral de aulas, eventos, reuniões e feriados.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-slate-800">Fevereiro 2026</h2>
            <div className="flex space-x-1">
              <button onClick={() => {}} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => {}} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {loading && <span className="text-xs text-slate-500">Carregando...</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
          <div className="flex items-center space-x-3 text-xs font-medium">
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div> Aulas</span>
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div> Reuniões</span>
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></div> Eventos</span>
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></div> Feriados</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-200 gap-px">
          {days.map((day, idx) => {
            const isCurrentMonth = day <= 28; // Mocking Feb 2026
            const displayDay = isCurrentMonth ? day : day - 28;
            const dayEvents = isCurrentMonth
              ? events.filter((e: any) => {
                  const d = new Date(e.date).getDate();
                  return d === displayDay;
                })
              : [];

            return (
              <div key={idx} className={`bg-white p-2 flex flex-col ${!isCurrentMonth ? 'opacity-40 bg-slate-50' : ''}`}>
                <span className={`text-sm font-medium mb-1 ${displayDay === 28 && isCurrentMonth ? 'w-6 h-6 bg-ngo-primary text-white rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                  {displayDay}
                </span>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {dayEvents.map((evt: any, eIdx: number) => (
                    <div key={eIdx} className={`text-[10px] font-medium px-1.5 py-1 rounded truncate ${
                      evt.type === 'class' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      evt.type === 'meeting' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      evt.type === 'holiday' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Novo Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Reunião de pais" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                  <option value="class">Aula</option>
                  <option value="meeting">Reunião</option>
                  <option value="holiday">Feriado</option>
                  <option value="event">Evento</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-ngo-primary hover:bg-blue-900 rounded-lg transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
