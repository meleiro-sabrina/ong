'use client';

import { Award, Contact, Download, Search, Printer, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data for students
const students = [
  { id: 1, name: 'João Guilherme Silva', enrollment: '20240001', rg: '12.345.678-9', birth: '15/05/2010', photo: 'https://picsum.photos/seed/joao/200/200' },
  { id: 2, name: 'Ana Clara Souza', enrollment: '20240002', rg: '98.765.432-1', birth: '22/08/2009', photo: 'https://picsum.photos/seed/ana/200/200' },
  { id: 3, name: 'Lucas Oliveira', enrollment: '20240005', rg: '45.678.901-2', birth: '10/11/2008', photo: 'https://picsum.photos/seed/lucas/200/200' },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'certificado' | 'carteirinha'>('certificado');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/students', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar alunos');
        const json = await res.json();
        setStudents(Array.isArray(json.students) ? json.students : []);
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  // Certificate State
  const [certStudentId, setCertStudentId] = useState<string>('');
  const [certCourse, setCertCourse] = useState('Informática Básica');
  const [certStart, setCertStart] = useState('2024-02-05');
  const [certEnd, setCertEnd] = useState('2024-06-20');
  const [certHours, setCertHours] = useState('40');

  // ID Card State
  const [idStudentId, setIdStudentId] = useState<string>('');
  const [idStudentQuery, setIdStudentQuery] = useState('');
  const [isIdStudentDropdownOpen, setIsIdStudentDropdownOpen] = useState(false);
  const [idValidity, setIdValidity] = useState('2025-12-31');

  const selectedCertStudent = students.find(s => s.id === certStudentId);
  const selectedIdStudent = students.find(s => s.id === idStudentId);

  const filteredIdStudents = students
    .filter((s: any) => {
      const q = idStudentQuery.trim().toLowerCase();
      if (!q) return true;
      const name = String(s?.name ?? '').toLowerCase();
      const enrollment = String(s?.enrollment ?? '').toLowerCase();
      return name.includes(q) || enrollment.includes(q);
    })
    .slice(0, 20);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDownload = (type: string) => {
    // In a real app, this would trigger a PDF generation library like jspdf or html2canvas
    alert(`${type} gerado com sucesso! O download do PDF iniciará em instantes.`);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Documentos e Certificados</h1>
        <p className="text-sm text-slate-500 mt-1">Gere certificados de conclusão e carteirinhas de identificação para os alunos.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('certificado')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'certificado' ? 'bg-white text-ngo-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 mr-2" />
          Certificados
        </button>
        <button
          onClick={() => setActiveTab('carteirinha')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'carteirinha' ? 'bg-white text-ngo-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Contact className="w-4 h-4 mr-2" />
          Carteirinhas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              {activeTab === 'certificado' ? 'Dados do Certificado' : 'Dados da Carteirinha'}
            </h2>

            {activeTab === 'certificado' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Aluno</label>
                  <select 
                    value={certStudentId}
                    onChange={(e) => setCertStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary bg-white"
                  >
                    <option value="">{loading ? 'Carregando...' : 'Selecione um aluno'}</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.enrollment})</option>
                    ))}
                  </select>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso / Atividade</label>
                  <input 
                    type="text" 
                    value={certCourse}
                    onChange={(e) => setCertCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                    <input 
                      type="date" 
                      value={certStart}
                      onChange={(e) => setCertStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data de Término</label>
                    <input 
                      type="date" 
                      value={certEnd}
                      onChange={(e) => setCertEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horária (horas)</label>
                  <input 
                    type="number" 
                    value={certHours}
                    onChange={(e) => setCertHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Aluno</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={idStudentQuery}
                      onChange={(e) => {
                        setIdStudentQuery(e.target.value);
                        setIsIdStudentDropdownOpen(true);
                        if (idStudentId) setIdStudentId('');
                      }}
                      onFocus={() => setIsIdStudentDropdownOpen(true)}
                      placeholder={loading ? 'Carregando...' : 'Digite o nome ou matrícula...'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                    />

                    {isIdStudentDropdownOpen && !loading && filteredIdStudents.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                        {filteredIdStudents.map((s: any) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setIdStudentId(String(s.id));
                              setIdStudentQuery(String(s.name ?? ''));
                              setIsIdStudentDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                          >
                            <div className="font-medium text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.enrollment}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {isIdStudentDropdownOpen && !loading && idStudentQuery.trim() !== '' && filteredIdStudents.length === 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm text-slate-500">
                        Nenhum aluno encontrado.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validade da Carteirinha</label>
                  <input 
                    type="date" 
                    value={idValidity}
                    onChange={(e) => setIdValidity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary" 
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-4">
                  <p className="text-sm text-blue-800 flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    A foto do aluno é puxada automaticamente do cadastro. Certifique-se de que o aluno possui uma foto cadastrada.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={() => handleDownload(activeTab === 'certificado' ? 'Certificado' : 'Carteirinha')}
                className="w-full bg-ngo-primary hover:bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF Personalizado
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-8">
          <div className="bg-slate-200 p-8 rounded-2xl border border-slate-300 flex items-center justify-center min-h-[500px] overflow-hidden relative">
            
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 flex items-center shadow-sm">
              <Printer className="w-3 h-3 mr-1.5" />
              Pré-visualização de Impressão
            </div>

            {/* CERTIFICATE PREVIEW */}
            {activeTab === 'certificado' && selectedCertStudent && (
              <div className="bg-white w-full max-w-3xl aspect-[1.414/1] p-2 shadow-2xl relative transition-all transform scale-90 sm:scale-100 origin-center">
                <div className="w-full h-full border-[12px] border-double border-slate-200 p-8 sm:p-12 flex flex-col items-center text-center relative bg-white">
                  
                  {/* Watermark/Logo placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <Award className="w-96 h-96" />
                  </div>

                  <div className="text-ngo-primary mb-6">
                    <Award className="w-16 h-16 mx-auto" />
                  </div>
                  
                  <h1 className="text-3xl sm:text-5xl font-serif text-slate-800 mb-2 tracking-tight">CERTIFICADO</h1>
                  <h2 className="text-lg sm:text-xl font-serif text-slate-500 mb-8 tracking-widest uppercase">de Conclusão</h2>
                  
                  <p className="text-sm sm:text-base text-slate-600 mb-4">Certificamos que</p>
                  
                  <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 border-b border-slate-300 pb-2 px-8 inline-block">
                    {selectedCertStudent.name}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-12">
                    concluiu com êxito o curso de <strong className="text-slate-800">{certCourse}</strong>, 
                    realizado no período de <strong>{formatDate(certStart)}</strong> a <strong>{formatDate(certEnd)}</strong>, 
                    com carga horária total de <strong>{certHours} horas</strong>.
                  </p>

                  <div className="mt-auto w-full grid grid-cols-2 gap-8 px-8">
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-px bg-slate-400 mb-2"></div>
                      <p className="text-xs text-slate-600 font-medium">Diretoria da ONG</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-px bg-slate-400 mb-2"></div>
                      <p className="text-xs text-slate-600 font-medium">Professor(a) Responsável</p>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-8 text-[10px] text-slate-400 font-mono">
                    Registro: {selectedCertStudent.enrollment}-{new Date().getFullYear()}
                  </div>
                </div>
              </div>
            )}

            {/* ID CARD PREVIEW */}
            {activeTab === 'carteirinha' && selectedIdStudent && (
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center transition-all transform scale-90 sm:scale-100">
                
                {/* Frente da Carteirinha */}
                <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-200">
                  {/* Header */}
                  <div className="bg-ngo-primary h-12 flex items-center px-4 shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                      <Award className="w-4 h-4 text-ngo-primary" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">ONG GESTÃO</span>
                  </div>
                  
                  {/* Body */}
                  <div className="flex-1 p-3 flex">
                    {/* Photo */}
                    <div className="w-20 h-24 bg-slate-100 rounded-md border border-slate-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedIdStudent.photo} alt="Foto do Aluno" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="ml-3 flex-1 flex flex-col justify-center">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Nome do Aluno</p>
                      <p className="text-sm font-bold text-slate-900 leading-tight mb-2">{selectedIdStudent.name}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Matrícula</p>
                          <p className="text-xs font-mono font-medium text-slate-800">{selectedIdStudent.enrollment}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Nascimento</p>
                          <p className="text-xs font-medium text-slate-800">{selectedIdStudent.birth}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">RG</p>
                          <p className="text-xs font-medium text-slate-800">{selectedIdStudent.rg}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verso da Carteirinha */}
                <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-200">
                  <div className="w-full h-10 bg-slate-800 mt-4"></div> {/* Tarja magnética mock */}
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[9px] text-slate-600 text-center mb-4">
                      Este documento é de uso pessoal e intransferível. Válido em todo o território nacional para identificação interna na instituição.
                    </p>
                    
                    <div className="mt-auto flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-semibold">Validade</p>
                        <p className="text-xs font-bold text-red-600">{formatDate(idValidity)}</p>
                      </div>
                      
                      {/* Mock Barcode */}
                      <div className="w-32 h-8 flex space-x-[1px] opacity-70">
                        {[...Array(30)].map((_, i) => (
                          <div key={i} className="h-full bg-slate-900" style={{ width: `${Math.random() * 3 + 1}px` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
