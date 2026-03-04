'use client';

import { FileText, Users, CalendarCheck, DollarSign, UserSquare2, Download, Filter, Clock, ChevronRight, FileSpreadsheet, FileIcon, X } from 'lucide-react';
import { useState } from 'react';

// Mock data for recent reports
const recentReports = [
  { id: 1, name: 'Frequência Mensal - Fev/2024', type: 'PDF', date: '28/02/2024 às 14:30', size: '2.4 MB' },
  { id: 2, name: 'Balanço Financeiro - Q1', type: 'Excel', date: '25/02/2024 às 09:15', size: '1.1 MB' },
  { id: 3, name: 'Relação de Alunos Ativos', type: 'PDF', date: '20/02/2024 às 16:45', size: '3.8 MB' },
];

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ title: string, type: string } | null>(null);

  const openReportModal = (title: string, type: string) => {
    setSelectedReport({ title, type });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios e Exportações</h1>
          <p className="text-sm text-slate-500 mt-1">Gere documentos para prestação de contas, editais e controle interno.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Report Categories */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Categorias de Relatórios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card: Alunos */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => openReportModal('Relatório de Alunos', 'alunos')}>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5 text-ngo-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Alunos e Demografia</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Dados cadastrais, faixa etária, vulnerabilidade social e informações escolares.</p>
              <div className="flex items-center text-sm font-medium text-ngo-primary group-hover:text-blue-800">
                Configurar e Gerar <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card: Frequência */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => openReportModal('Relatório de Frequência', 'frequencia')}>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <CalendarCheck className="w-5 h-5 text-ngo-accent" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Frequência e Turmas</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Taxa de presença por turma, alunos com excesso de faltas e diários de classe.</p>
              <div className="flex items-center text-sm font-medium text-ngo-accent group-hover:text-green-800">
                Configurar e Gerar <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card: Financeiro */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => openReportModal('Relatório Financeiro', 'financeiro')}>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                <DollarSign className="w-5 h-5 text-ngo-warning" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Doações e Captação</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Balanço de receitas, doadores recorrentes e arrecadação por campanha.</p>
              <div className="flex items-center text-sm font-medium text-ngo-warning group-hover:text-amber-700">
                Configurar e Gerar <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card: Professores */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => openReportModal('Relatório de Professores', 'professores')}>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <UserSquare2 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Corpo Docente</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">Relação de voluntários, horistas, horas trabalhadas e turmas vinculadas.</p>
              <div className="flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-800">
                Configurar e Gerar <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Recent Reports */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Gerados Recentemente</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3">
                  <div className="mt-1 shrink-0">
                    {report.type === 'PDF' ? (
                      <FileIcon className="w-8 h-8 text-red-500" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{report.name}</p>
                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-ngo-primary hover:bg-blue-50 rounded-lg transition-colors" title="Baixar novamente">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-sm font-medium text-ngo-primary hover:text-blue-800 transition-colors">
                Ver todo o histórico
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Configure Report */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-slate-500 mr-2" />
                <h2 className="text-lg font-semibold text-slate-900">Configurar Relatório</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h3 className="font-medium text-slate-900 mb-4">{selectedReport.title}</h3>
              
              <form className="space-y-5">
                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Período de Referência</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Data Inicial</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Data Final</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" />
                    </div>
                  </div>
                </div>

                {/* Formato */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Exportação</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="format" value="pdf" defaultChecked className="text-ngo-primary focus:ring-ngo-primary" />
                      <span className="text-sm text-slate-700 flex items-center"><FileIcon className="w-4 h-4 text-red-500 mr-1" /> Documento PDF</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="format" value="excel" className="text-ngo-primary focus:ring-ngo-primary" />
                      <span className="text-sm text-slate-700 flex items-center"><FileSpreadsheet className="w-4 h-4 text-green-600 mr-1" /> Planilha Excel</span>
                    </label>
                  </div>
                </div>

                {/* Filtros Específicos (Mockados baseados no tipo) */}
                {selectedReport.type === 'alunos' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status do Aluno</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                      <option value="todos">Todos os Alunos</option>
                      <option value="ativos">Apenas Ativos</option>
                      <option value="inativos">Apenas Inativos</option>
                    </select>
                  </div>
                )}

                {selectedReport.type === 'financeiro' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Campanha</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white">
                      <option value="todas">Todas as Campanhas</option>
                      <option value="geral">Fundo Geral</option>
                      <option value="reforma">Reforma da Biblioteca</option>
                    </select>
                  </div>
                )}

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  alert('Relatório gerado com sucesso! O download iniciará em instantes.');
                  setIsModalOpen(false);
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-ngo-primary rounded-lg hover:bg-blue-900 transition-colors shadow-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
