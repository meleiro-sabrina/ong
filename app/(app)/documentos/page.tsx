'use client';

import { Award, Contact, Download, Search, Printer, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'certificado' | 'carteirinha'>('certificado');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certStudentId, setCertStudentId] = useState<string>('');
  const [certStudentQuery, setCertStudentQuery] = useState('');
  const [certCourse, setCertCourse] = useState('Informática Básica');
  const [certStart, setCertStart] = useState('2024-02-05');
  const [certEnd, setCertEnd] = useState('2024-06-20');
  const [certHours, setCertHours] = useState('40');

  const [idStudentId, setIdStudentId] = useState<string>('');
  const [idStudentQuery, setIdStudentQuery] = useState('');
  const [idValidity, setIdValidity] = useState('2025-12-31');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/students', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar alunos');
        const json = await res.json();
        const activeStudents = Array.isArray(json.students) 
          ? json.students.filter((student: any) => student.status === 'active')
          : [];
        setStudents(activeStudents);
      } catch (e: any) {
        setError(typeof e?.message === 'string' ? e.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedCertStudent = students.find(s => String(s.id) === String(certStudentId));
  const selectedIdStudent = students.find(s => String(s.id) === String(idStudentId));

  const getStudentPhoto = useCallback((student: any) => {
    if (student?.avatar) {
      return student.avatar;
    }
    return `https://picsum.photos/seed/${student?.name || 'student'}/200/200`;
  }, []);

  const filteredIdStudents = students
    .filter((s: any) => {
      const q = idStudentQuery.trim().toLowerCase();
      if (!q) return true;
      const name = String(s?.name ?? '').toLowerCase();
      const enrollment = String(s?.enrollment ?? '').toLowerCase();
      return name.includes(q) || enrollment.includes(q);
    })
    .slice(0, idStudentQuery.trim() ? 20 : 10);

  const filteredCertStudents = students
    .filter((s: any) => {
      const q = certStudentQuery.trim().toLowerCase();
      if (!q) return true;
      const name = String(s?.name ?? '').toLowerCase();
      const enrollment = String(s?.enrollment ?? '').toLowerCase();
      return name.includes(q) || enrollment.includes(q);
    })
    .slice(0, certStudentQuery.trim() ? 20 : 10);

  const formatBirthDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    if (dateString.includes('/')) return dateString;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDownload = (type: string) => {
    const student = type === 'certificado' ? selectedCertStudent : selectedIdStudent;
    
    if (!student) {
      alert(`Selecione um aluno para baixar o ${type === 'certificado' ? 'certificado' : 'carteirinha'}`);
      return;
    }

    try {
      if (type === 'certificado') {
        generateCertificatePDF(student);
      } else {
        generateIdCardPDF(student);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const generateCertificatePDF = (student: any) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const goldColor = [217, 119, 6];
    const darkGoldColor = [146, 64, 14];
    const grayColor = [107, 114, 128];
    const blackColor = [17, 24, 39];

    const addText = (text: string, x: number, y: number, fontSize: number, color: number[], font: string = 'helvetica', style: string = 'normal') => {
      pdf.setFont(font, style);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(text, x, y);
    };

    pdf.setDrawColor(goldColor[0], goldColor[1], goldColor[2]);
    pdf.setLineWidth(2);
    pdf.rect(20, 20, 257, 170);

    pdf.setFillColor(254, 243, 199);
    pdf.circle(148.5, 55, 15, 'F');
    
    pdf.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    pdf.moveTo(138.5, 50);
    pdf.lineTo(148.5, 45);
    pdf.lineTo(158.5, 50);
    pdf.lineTo(148.5, 60);
    pdf.lineTo(138.5, 50);
    pdf.fill();

    addText('Certificado de Conclusão', 148.5, 85, 24, darkGoldColor, 'times', 'bold');
    addText('Certificamos que', 148.5, 95, 12, grayColor, 'helvetica', 'normal');

    addText(student.name || 'Aluno', 148.5, 115, 20, blackColor, 'times', 'bold');

    const bodyText = `Concluiu com êxito o curso ${certCourse} com carga horária de ${certHours} horas.`;
    addText(bodyText, 148.5, 135, 14, blackColor, 'helvetica', 'normal');
    
    const periodText = `Período: ${formatDate(certStart)} a ${formatDate(certEnd)}`;
    addText(periodText, 148.5, 150, 12, grayColor, 'helvetica', 'normal');

    const signatureY = 165;
    
    pdf.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.setLineWidth(1);
    pdf.line(58, signatureY, 118, signatureY);
    addText('Diretoria da ONG', 88, signatureY + 5, 12, grayColor, 'helvetica', 'normal');

    pdf.line(178, signatureY, 238, signatureY);
    addText('Professor(a) Responsável', 208, signatureY + 5, 12, grayColor, 'helvetica', 'normal');

    addText(`Registro: ${(student.enrollment || 'N/A')}-${new Date().getFullYear()}`, 265, 185, 10, grayColor, 'courier', 'normal');

    pdf.save(`certificado_${(student.name || 'aluno').replace(/\s+/g, '_')}.pdf`);
  };

  const generateIdCardPDF = (student: any) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const blueColor = [59, 130, 246];
    const whiteColor = [255, 255, 255];
    const grayColor = [107, 114, 128];
    const blackColor = [17, 24, 39];
    const lightGrayColor = [243, 244, 246];

    const addText = (text: string, x: number, y: number, fontSize: number, color: number[], font: string = 'helvetica', style: string = 'normal') => {
      pdf.setFont(font, style);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(text, x, y);
    };

    const centerX = 105;
    const startY = 50;

    const cardWidth = 85.6;
    const cardHeight = 53.98;
    const cardX = centerX - cardWidth / 2;

    pdf.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    pdf.rect(cardX, startY, cardWidth, 12, 'F');
    
    pdf.setFillColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    pdf.circle(cardX + 12, startY + 6, 6, 'F');
    pdf.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    pdf.moveTo(cardX + 6, startY + 3);
    pdf.lineTo(cardX + 12, startY);
    pdf.lineTo(cardX + 18, startY + 3);
    pdf.lineTo(cardX + 18, startY + 6);
    pdf.lineTo(cardX + 6, startY + 6);
    pdf.fill();
    
    addText('ONG GESTÃO', cardX + 25, startY + 7.5, 12, whiteColor, 'helvetica', 'bold');

    const contentY = startY + 12;
    
    pdf.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    pdf.rect(cardX + 3, contentY + 3, 20, 24);
    pdf.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.rect(cardX + 3, contentY + 3, 20, 24);

    addText('Nome do Aluno', cardX + 26, contentY + 5, 8, grayColor, 'helvetica', 'normal');
    addText(student.name || 'Aluno', cardX + 26, contentY + 12, 12, blackColor, 'helvetica', 'bold');

    const dataY = contentY + 25;
    
    addText('Matrícula', cardX + 26, dataY, 7, grayColor, 'helvetica', 'normal');
    addText(student.enrollment || 'N/A', cardX + 26, dataY + 5, 10, blackColor, 'courier', 'normal');

    addText('Nascimento', cardX + 60, dataY, 7, grayColor, 'helvetica', 'normal');
    addText(formatBirthDate(student.birth), cardX + 60, dataY + 5, 10, blackColor, 'helvetica', 'normal');

    addText('RG', cardX + 26, dataY + 15, 7, grayColor, 'helvetica', 'normal');
    addText(student.rg || 'N/A', cardX + 26, dataY + 20, 10, blackColor, 'helvetica', 'normal');

    const versoY = startY + cardHeight + 20;

    pdf.setFillColor(31, 41, 55);
    pdf.rect(cardX, versoY + 16, cardWidth, 8, 'F');

    const infoText = 'Este documento é de uso pessoal e intransferível. Válido em todo o território nacional para identificação interna na instituição.';
    pdf.setFontSize(8);
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text(infoText, cardX + cardWidth/2, versoY + 40, { align: 'center', maxWidth: cardWidth - 10 });

    const footerY = versoY + 50;
    
    addText('Validade:', cardX + 3, footerY, 7, grayColor, 'helvetica', 'normal');
    addText(formatDate(idValidity), cardX + 3, footerY + 5, 10, blackColor, 'helvetica', 'bold');

    pdf.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    pdf.rect(cardX + cardWidth - 25, footerY + 2, 22, 12, 'F');
    pdf.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.rect(cardX + cardWidth - 25, footerY + 2, 22, 12, 'F');
    
    for (let i = 0; i < 5; i++) {
      const x = cardX + cardWidth - 23 + i * 4;
      pdf.setFillColor(blackColor[0], blackColor[1], blackColor[2]);
      pdf.rect(x, footerY + 4, 2, 8, 'F');
    }

    addText(student.enrollment || 'N/A', cardX + cardWidth - 14, footerY + 15, 5, grayColor, 'courier', 'normal');

    pdf.save(`carteirinha_${(student.name || 'aluno').replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = (type: string) => {
    if (type === 'carteirinha' && !selectedIdStudent) {
      alert('Selecione um aluno para imprimir a carteirinha');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.');
      return;
    }

    const printContent = generateIdCardHTML(selectedIdStudent);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir Carteirinha</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateIdCardHTML = (student: any) => {
    return `
      <div style="width: 210mm; height: 297mm; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
        <div style="width: 85.6mm; height: 53.98mm; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: #3b82f6; height: 48px; display: flex; align-items: center; padding: 0 16px;">
            <div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
              <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l10-5z"/>
              </svg>
            </div>
            <span style="color: white; font-weight: bold; font-size: 14px; letter-spacing: 0.5px;">ONG GESTÃO</span>
          </div>
          <div style="display: flex; padding: 12px; height: calc(100% - 48px);">
            <div style="width: 80px; height: 96px; background: #f3f4f6; border-radius: 4px; overflow: hidden; margin-right: 12px; border: 1px solid #e5e7eb;">
              <img src="${getStudentPhoto(student)} alt="Foto do Aluno" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <p style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin: 0 0 2px 0;">Nome do Aluno</p>
              <p style="font-size: 14px; font-weight: bold; color: #111827; line-height: 1.2; margin: 0 0 8px 0;">${student.name || 'N/A'}</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <div>
                  <p style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin: 0;">Matrícula</p>
                  <p style="font-size: 12px; font-family: monospace; font-weight: 500; color: #374151; margin: 0;">${student.enrollment || 'N/A'}</p>
                </div>
                <div>
                  <p style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin: 0;">Nascimento</p>
                  <p style="font-size: 12px; font-weight: 500; color: #374151; margin: 0;">${formatBirthDate(student.birth)}</p>
                </div>
                <div style="grid-column: 1 / -1;">
                  <p style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin: 0;">RG</p>
                  <p style="font-size: 12px; font-weight: 500; color: #374151; margin: 0;">${student.rg || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="width: 85.6mm; height: 53.98mm; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="width: 100%; height: 40px; background: #1f2937; margin-top: 16px;"></div>
          <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
            <p style="font-size: 9px; color: #6b7280; text-align: center; margin-bottom: 16px;">
              Este documento é de uso pessoal e intransferível. Válido em todo o território nacional para identificação interna na instituição.
            </p>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <p style="font-size: 8px; color: #6b7280; margin: 0;">Validade:</p>
                <p style="font-size: 12px; font-weight: bold; color: #111827; margin: 0;">${formatDate(idValidity)}</p>
              </div>
              <div style="text-align: right;">
                <div style="width: 80px; height: 32px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                  <span style="font-size: 8px; font-family: monospace; color: #6b7280;">|••••••••|</span>
                </div>
                <p style="font-size: 6px; color: #9ca3af; margin: 0;">${student.enrollment || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ngo-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-ngo-primary" />
          <p className="text-slate-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ngo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Documentos</h1>
        <p className="text-slate-600">Gere certificados e carteirinhas para os alunos</p>
      </div>

      <div className="border-b border-slate-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('certificado')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'certificado'
                ? 'border-ngo-primary text-ngo-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Certificado
          </button>
          <button
            onClick={() => setActiveTab('carteirinha')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'carteirinha'
                ? 'border-ngo-primary text-ngo-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Contact className="w-4 h-4 inline mr-2" />
            Carteirinha
          </button>
        </nav>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              {activeTab === 'certificado' ? 'Dados do Certificado' : 'Dados da Carteirinha'}
            </h3>

            {activeTab === 'certificado' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Aluno</label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={certStudentQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setCertStudentQuery(query);
                          if (certStudentId && query.trim() === '') {
                            setCertStudentId('');
                          }
                        }}
                        placeholder="Digite o nome ou matrícula..."
                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-2 focus:ring-ngo-secondary/20 transition-all"
                        autoComplete="off"
                        spellCheck="false"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      {certStudentQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setCertStudentId('');
                            setCertStudentQuery('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {certStudentQuery && !loading && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCertStudents.length > 0 ? (
                          filteredCertStudents.map((s: any) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setCertStudentId(String(s.id));
                                setCertStudentQuery(String(s.name ?? ''));
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                  <img src={getStudentPhoto(s)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">{s.name}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="font-mono">{s.enrollment}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Ativo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-slate-500 text-center">
                            Nenhum aluno encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedCertStudent && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden mr-2 flex-shrink-0">
                            <img src={getStudentPhoto(selectedCertStudent)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{selectedCertStudent.name}</p>
                            <p className="text-xs text-slate-500">{selectedCertStudent.enrollment}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCertStudentId('');
                            setCertStudentQuery('');
                          }}
                          className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso/Atividade</label>
                  <input
                    type="text"
                    value={certCourse}
                    onChange={(e) => setCertCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Carga Horária</label>
                  <input
                    type="text"
                    value={certHours}
                    onChange={(e) => setCertHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-1 focus:ring-ngo-secondary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Aluno</label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={idStudentQuery}
                        onChange={(e) => {
                          const query = e.target.value;
                          setIdStudentQuery(query);
                          if (idStudentId && query.trim() === '') {
                            setIdStudentId('');
                          }
                        }}
                        placeholder="Digite o nome ou matrícula..."
                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-ngo-secondary focus:ring-2 focus:ring-ngo-secondary/20 transition-all"
                        autoComplete="off"
                        spellCheck="false"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      {idStudentQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setIdStudentId('');
                            setIdStudentQuery('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {idStudentQuery && !loading && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredIdStudents.length > 0 ? (
                          filteredIdStudents.map((s: any) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setIdStudentId(String(s.id));
                                setIdStudentQuery(String(s.name ?? ''));
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-100 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                  <img src={getStudentPhoto(s)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">{s.name}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="font-mono">{s.enrollment}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Ativo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-slate-500 text-center">
                            Nenhum aluno encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedIdStudent && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden mr-2 flex-shrink-0">
                            <img src={getStudentPhoto(selectedIdStudent)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{selectedIdStudent.name}</p>
                            <p className="text-xs text-slate-500">{selectedIdStudent.enrollment}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIdStudentId('');
                            setIdStudentQuery('');
                          }}
                          className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}
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
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDownload(activeTab === 'certificado' ? 'Certificado' : 'Carteirinha')}
                disabled={activeTab === 'certificado' ? !selectedCertStudent : !selectedIdStudent}
                className="flex-1 bg-ngo-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-ngo-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </button>
              {activeTab === 'carteirinha' && (
                <button
                  onClick={() => handlePrint('carteirinha')}
                  disabled={!selectedIdStudent}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Preview</h3>

            {activeTab === 'certificado' && selectedCertStudent ? (
              <div className="space-y-6">
                <div className="border-2 border-double border-amber-600 bg-white p-8 relative">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-serif text-amber-800 mb-2">Certificado de Conclusão</h1>
                    <p className="text-slate-600">Certificamos que</p>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-xl font-serif text-slate-900 mb-4">{selectedCertStudent.name}</h2>
                    <p className="text-slate-700 mb-6">
                      Concluiu com êxito o curso <strong>{certCourse}</strong> com carga horária de <strong>{certHours} horas</strong>.
                    </p>
                    <p className="text-slate-600">
                      Período: <strong>{formatDate(certStart)} a {formatDate(certEnd)}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-12">
                    <div className="text-center">
                      <div className="w-48 h-px bg-slate-400 mb-2"></div>
                      <p className="text-xs text-slate-600 font-medium">Diretoria da ONG</p>
                    </div>
                    <div className="text-center">
                      <div className="w-48 h-px bg-slate-400 mb-2"></div>
                      <p className="text-xs text-slate-600 font-medium">Professor(a) Responsável</p>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-8 text-[10px] text-slate-400 font-mono">
                    Registro: {selectedCertStudent.enrollment}-{new Date().getFullYear()}
                  </div>
                </div>
              </div>
            ) : activeTab === 'carteirinha' && selectedIdStudent ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center transition-all transform scale-90 sm:scale-100">
                <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-200">
                  <div className="bg-ngo-primary h-12 flex items-center px-4 shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                      <Award className="w-4 h-4 text-ngo-primary" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">ONG GESTÃO</span>
                  </div>

                  <div className="flex-1 p-3 flex">
                    <div className="w-20 h-24 bg-slate-100 rounded-md border border-slate-200 overflow-hidden shrink-0">
                      <img src={getStudentPhoto(selectedIdStudent)} alt="Foto do Aluno" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3 flex-1 flex flex-col justify-content-center">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Nome do Aluno</p>
                      <p className="text-sm font-bold text-slate-900 leading-tight mb-2">{selectedIdStudent?.name || 'N/A'}</p>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Matrícula</p>
                          <p className="text-xs font-mono font-medium text-slate-800">{selectedIdStudent?.enrollment || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">Nascimento</p>
                          <p className="text-xs font-medium text-slate-800">{formatBirthDate(selectedIdStudent?.birth)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">RG</p>
                          <p className="text-xs font-medium text-slate-800">{selectedIdStudent?.rg || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[85.6mm] h-[53.98mm] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-200">
                  <div className="w-full h-10 bg-slate-800 mt-4"></div>

                  <div className="p-4 flex-1 flex flex-col;">
                    <p className="text-[9px] text-slate-600 text-center mb-16px">
                      Este documento é de uso pessoal e intransferível. Válido em todo o território nacional para identificação interna na instituição.
                    </p>

                    <div className="mt-auto flex justify-content space-between align-items-end">
                      <div>
                        <p className="text-[8px] text-slate-600 margin: 0;">Validade:</p>
                        <p className="text-xs font-bold text-slate-800 margin: 0;">{formatDate(idValidity)}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-8 bg-slate-100 border border-slate-300 rounded flex items-center justify-content center margin-bottom: 4px;">
                          <span style="font-size: 8px; font-family: monospace; color: #6b7280;">|••••••••|</span>
                        </div>
                        <p className="text-[6px] color: #9ca3af; margin: 0;">{selectedIdStudent?.enrollment || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'certificado' ? (
                    <Award className="w-8 h-8 text-slate-400" />
                  ) : (
                    <Contact className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <p className="text-slate-500">
                  {activeTab === 'certificado' 
                    ? 'Selecione um aluno para visualizar o certificado' 
                    : 'Selecione um aluno para visualizar a carteirinha'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
