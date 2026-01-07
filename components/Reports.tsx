
import React, { useState, useMemo } from 'react';
import { AppData, Usuario } from '../types';
import { MESES, NATIVE_LOGO_REPORT } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ReportsProps {
  data: AppData;
  currentUser: Usuario;
}

type ReportView = 'geral' | 'estudantes' | 'colaboradores' | 'pgs';

const STUDENT_COLUMNS_OPTIONS = [
  { id: 'nome', label: 'Nome' },
  { id: 'setor', label: 'Setor' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'status', label: 'Status' },
  { id: 'capelao', label: 'Responsável' },
  { id: 'data', label: 'Mês/Ano' },
];

const VISIT_COLUMNS_OPTIONS = [
  { id: 'nomeColaborador', label: 'Colaborador' },
  { id: 'setor', label: 'Setor' },
  { id: 'dataAtendimento', label: 'Data Atend.' },
  { id: 'motivo', label: 'Motivo' },
  { id: 'necessitaRetorno', label: 'Retorno?' },
  { id: 'capelao', label: 'Responsável' },
];

const PG_COLUMNS_OPTIONS = [
  { id: 'nomePG', label: 'Nome do PG' },
  { id: 'setor', label: 'Setor' },
  { id: 'liderPG', label: 'Líder' },
  { id: 'turno', label: 'Turno' },
  { id: 'quantidadeParticipantes', label: 'Qtd.' },
  { id: 'capelao', label: 'Capelão' },
];

const Reports: React.FC<ReportsProps> = ({ data, currentUser }) => {
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>(MESES[new Date().getMonth()]);
  const [filterCapelao, setFilterCapelao] = useState<string>(currentUser?.isAdmin ? 'Todos' : (currentUser?.nome || ''));
  const [currentView, setCurrentView] = useState<ReportView>('geral');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedStudentCols, setSelectedStudentCols] = useState<string[]>(['nome', 'setor', 'tipo', 'status', 'capelao']);
  const [selectedVisitCols, setSelectedVisitCols] = useState<string[]>(['nomeColaborador', 'setor', 'motivo', 'capelao']);
  const [selectedPgCols, setSelectedPgCols] = useState<string[]>(['nomePG', 'setor', 'liderPG', 'quantidadeParticipantes']);

  const COLORS = ['#005a9c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stats = useMemo(() => {
    const matchFilter = (item: any) => {
      if (!item) return false;
      const yMatch = Number(item.ano) === Number(filterYear);
      const mMatch = filterMonth === 'Todos' || item.mes === filterMonth;
      const cMatch = filterCapelao === 'Todos' ? true : item.capelao === filterCapelao;
      return yMatch && mMatch && cMatch;
    };

    const fEstudos = (data.estudosBiblicos || []).filter(matchFilter);
    const fClasses = (data.classesBiblicas || []).filter(matchFilter);
    const fVisitas = (data.visitasColaboradores || []).filter(matchFilter);
    const fPgs = (data.pequenosGrupos || []).filter(matchFilter);

    const countClassesAlunos = fClasses.reduce((acc, c) => acc + (c.participantes?.length || 0), 0);

    const chartData = [
      { name: 'Estudos Indiv.', value: fEstudos.length },
      { name: 'Alunos Classes', value: countClassesAlunos },
      { name: 'Visitas Colab.', value: fVisitas.length },
      { name: 'Pequenos Grupos', value: fPgs.length }
    ].filter(v => v.value > 0);

    const listagemEstudantes = [
      ...fEstudos.map(e => ({ nome: e.nomeEstudante, tipo: 'Individual', setor: e.setor, status: e.status, capelao: e.capelao, data: `${e.mes}/${e.ano}` })),
      ...fClasses.flatMap(c => (c.participantes || []).map(p => ({ nome: p, tipo: 'Classe', setor: c.setor, status: 'Em Grupo', capelao: c.capelao, data: `${c.mes}/${c.ano}` })))
    ].sort((a, b) => a.nome.localeCompare(b.nome));

    const listagemVisitas = fVisitas.map(v => ({
      ...v,
      necessitaRetorno: v.necessitaRetorno ? 'Sim' : 'Não'
    })).sort((a, b) => a.nomeColaborador.localeCompare(b.nomeColaborador));

    const listagemPgs = fPgs.sort((a, b) => a.nomePG.localeCompare(b.nomePG));

    return { 
      fEstudos, fClasses, fVisitas, fPgs, 
      totalAlunos: fEstudos.length + countClassesAlunos, 
      chartData, 
      listagemEstudantes,
      listagemVisitas,
      listagemPgs
    };
  }, [data, filterYear, filterMonth, filterCapelao]);

  const getImageDimensions = (src: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = src;
    });
  };

  const exportPDF = async () => {
    setIsExporting(true);
    setExportStatus('Calculando dimensões da logo...');
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const headerText = data.reportHeaderText || 'Relatório de Atividades de Capelania';
      // Prioriza Logo Customizado, depois Logo Nativo de Relatório, depois Logo de App
      const logo = data.reportLogoCustom || NATIVE_LOGO_REPORT || data.logoCustom;
      const pageWidth = doc.internal.pageSize.getWidth();

      let logoFinalWidth = 25;
      let logoFinalHeight = 25;

      if (logo) {
        const dimensions = await getImageDimensions(logo);
        if (dimensions.width > 0) {
          const ratio = dimensions.height / dimensions.width;
          logoFinalHeight = logoFinalWidth * ratio;
          if (logoFinalHeight > 30) {
            logoFinalHeight = 30;
            logoFinalWidth = logoFinalHeight / ratio;
          }
        }
      }

      const renderHeader = () => {
        if (logo) {
          doc.addImage(logo, 'PNG', 15, 10, logoFinalWidth, logoFinalHeight);
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 90, 156);
        doc.setFont('helvetica', 'bold');
        const textX = logo ? (15 + logoFinalWidth + 5) : 15;
        doc.text(headerText, textX, 18);
        
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período: ${filterMonth}/${filterYear} | Responsável: ${filterCapelao}`, textX, 24);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, textX, 29);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(230, 230, 230);
        doc.line(15, Math.max(38, 10 + logoFinalHeight + 5), pageWidth - 15, Math.max(38, 10 + logoFinalHeight + 5));
      };

      const startY = Math.max(45, 10 + logoFinalHeight + 10);

      autoTable(doc, {
        startY: startY,
        head: [['Indicador', 'Total']],
        body: [
          ['Estudos Bíblicos Individuais', stats.fEstudos.length],
          ['Classes Bíblicas', stats.fClasses.length],
          ['Total de Alunos Alcançados', stats.totalAlunos],
          ['Visitas a Colaboradores', stats.fVisitas.length],
          ['Pequenos Grupos Ativos', stats.fPgs.length]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 90, 156] },
        didDrawPage: renderHeader,
        margin: { top: startY }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 15;
      const includeAll = currentView === 'geral';

      if ((includeAll || currentView === 'estudantes') && stats.listagemEstudantes.length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = startY; }
        doc.setFontSize(10); doc.setTextColor(40); doc.text("Listagem de Alunos", 15, currentY - 5);
        autoTable(doc, {
          startY: currentY,
          head: [STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => o.label)],
          body: stats.listagemEstudantes.map(item => STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => (item as any)[o.id])),
          theme: 'grid',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [60, 60, 60] },
          margin: { top: startY }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if ((includeAll || currentView === 'colaboradores') && stats.listagemVisitas.length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = startY; }
        doc.setFontSize(10); doc.setTextColor(40); doc.text("Visitas a Colaboradores", 15, currentY - 5);
        autoTable(doc, {
          startY: currentY,
          head: [VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => o.label)],
          body: stats.listagemVisitas.map(item => VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => (item as any)[o.id])),
          theme: 'grid',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [16, 185, 129] },
          margin: { top: startY }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if ((includeAll || currentView === 'pgs') && stats.listagemPgs.length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = startY; }
        doc.setFontSize(10); doc.setTextColor(40); doc.text("Pequenos Grupos", 15, currentY - 5);
        autoTable(doc, {
          startY: currentY,
          head: [PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => o.label)],
          body: stats.listagemPgs.map(item => PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => (item as any)[o.id])),
          theme: 'grid',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [245, 158, 11] },
          margin: { top: startY }
        });
      }

      doc.save(`relatorio_${currentView}_${filterMonth}_${filterYear}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Falha ao exportar PDF.");
    } finally {
      setIsExporting(false);
      setExportStatus('');
      setShowPreview(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      {/* Modal de Preview Interativo */}
      {showPreview && (
        <div className="fixed inset-0 z-[400] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fadeIn border">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">📄</div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Visualização de Impressão</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Simulação Real A4</p>
                </div>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50 custom-scrollbar">
              <div className="bg-white shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] p-[15mm] flex flex-col pointer-events-none">
                <div className="flex gap-6 mb-8 border-b pb-6 border-slate-100 items-start">
                  <div className="max-w-[40mm] flex items-center justify-center overflow-hidden">
                    {data.reportLogoCustom || NATIVE_LOGO_REPORT || data.logoCustom ? (
                      <img src={data.reportLogoCustom || NATIVE_LOGO_REPORT || data.logoCustom} className="w-full h-auto object-contain" style={{ maxHeight: '30mm' }} />
                    ) : (
                      <div className="w-20 h-20 bg-slate-50 border rounded-xl flex items-center justify-center text-[10px] font-black text-slate-300">LOGO</div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h1 className="text-lg font-black text-[#005a9c] uppercase leading-tight mb-1">{data.reportHeaderText || 'Relatório de Atividades'}</h1>
                    <div className="flex flex-wrap gap-x-4 text-[8px] font-bold text-slate-400 uppercase">
                      <span>Período: {filterMonth}/{filterYear}</span>
                      <span>Responsável: {filterCapelao}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="bg-[#005a9c] text-white text-[8px] font-black uppercase p-2 px-4 rounded-t-lg">Indicadores Gerais</div>
                  <div className="border border-t-0 divide-y text-[8px]">
                    <div className="flex justify-between p-2 px-4"><span>Estudos Individuais</span><span className="font-black">{stats.fEstudos.length}</span></div>
                    <div className="flex justify-between p-2 px-4 bg-slate-50"><span>Alunos em Classes</span><span className="font-black">{stats.totalAlunos - stats.fEstudos.length}</span></div>
                    <div className="flex justify-between p-2 px-4"><span>Visitas a Colaboradores</span><span className="font-black">{stats.fVisitas.length}</span></div>
                    <div className="flex justify-between p-2 px-4 bg-slate-50"><span>Pequenos Grupos</span><span className="font-black">{stats.fPgs.length}</span></div>
                  </div>
                </div>

                <div>
                   <div className={`text-white text-[8px] font-black uppercase p-2 px-4 rounded-t-lg ${currentView === 'estudantes' ? 'bg-slate-800' : currentView === 'colaboradores' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                      {currentView === 'geral' ? 'Detalhamento de Alunos' : currentView === 'estudantes' ? 'Lista de Estudantes' : currentView === 'colaboradores' ? 'Lista de Visitas' : 'Lista de PGs'}
                   </div>
                   <table className="w-full text-[7px] border-collapse border border-slate-100">
                      <thead>
                         <tr className="bg-slate-50">
                            {currentView === 'estudantes' || currentView === 'geral' ? STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => <th key={o.id} className="p-2 border text-left uppercase text-slate-400 font-black">{o.label}</th>) : 
                             currentView === 'colaboradores' ? VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => <th key={o.id} className="p-2 border text-left uppercase text-slate-400 font-black">{o.label}</th>) :
                             PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => <th key={o.id} className="p-2 border text-left uppercase text-slate-400 font-black">{o.label}</th>)}
                         </tr>
                      </thead>
                      <tbody>
                         {(currentView === 'estudantes' || currentView === 'geral' ? stats.listagemEstudantes : currentView === 'colaboradores' ? stats.listagemVisitas : stats.listagemPgs).slice(0, 15).map((item, i) => (
                           <tr key={i} className="border-b">
                              {currentView === 'estudantes' || currentView === 'geral' ? STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => <td key={o.id} className="p-2 border">{(item as any)[o.id]}</td>) : 
                               currentView === 'colaboradores' ? VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => <td key={o.id} className="p-2 border">{(item as any)[o.id]}</td>) :
                               PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => <td key={o.id} className="p-2 border">{(item as any)[o.id]}</td>)}
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-white flex justify-end gap-3">
              <button onClick={() => setShowPreview(false)} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Fechar</button>
              <button onClick={exportPDF} disabled={isExporting} className="bg-[#005a9c] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                {isExporting ? 'Processando...' : 'Baixar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles e Filtros seguem o padrão atual */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-[1.5rem] overflow-x-auto no-scrollbar w-full lg:w-auto">
          {(['geral', 'estudantes', 'colaboradores', 'pgs'] as ReportView[]).map(v => (
            <button key={v} onClick={() => setCurrentView(v)} className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${currentView === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {v === 'geral' ? '📊 Geral' : v === 'estudantes' ? '📖 Alunos' : v === 'colaboradores' ? '🏥 Visitas' : '👥 PGs'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button onClick={() => setShowColumnConfig(true)} className="flex-1 lg:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase shadow-sm">Configurar Colunas</button>
          <button onClick={() => setShowPreview(true)} className="flex-1 lg:flex-none bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 transition-all hover:bg-blue-700">Pré-visualizar PDF</button>
        </div>
      </div>

      {/* Restante do componente Reports permanece o mesmo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ano Base</label>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-blue-500">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mês de Referência</label>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-blue-500">
            <option value="Todos">Todos os Meses</option>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capelão Responsável</label>
          <select disabled={!currentUser.isAdmin} value={filterCapelao} onChange={e => setFilterCapelao(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-blue-500 disabled:opacity-50">
            {currentUser.isAdmin && <option value="Todos">Todos os Capelães</option>}
            {(data.usuarios || []).map(u => <option key={u.id} value={u.nome}>{u.nome}</option>)}
          </select>
        </div>
      </div>

      {currentView === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Proporção de Atividades
             </h4>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.chartData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8}>
                      {stats.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryTile label="Total Alunos" value={stats.totalAlunos} icon="👨‍🎓" color="text-blue-600" />
            <SummaryTile label="Visitas Realizadas" value={stats.fVisitas.length} icon="🏥" color="text-emerald-600" />
            <SummaryTile label="Pequenos Grupos" value={stats.fPgs.length} icon="👥" color="text-amber-600" />
            <SummaryTile label="Estudos Bíblicos" value={stats.fEstudos.length} icon="📖" color="text-indigo-600" />
          </div>
        </div>
      )}

      {currentView !== 'geral' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
           <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">
                {currentView === 'estudantes' ? 'Alunos (Estudos e Classes)' : currentView === 'colaboradores' ? 'Visitas a Colaboradores' : 'Pequenos Grupos Ativos'}
              </h4>
              <span className="bg-white px-4 py-1.5 rounded-full border text-[9px] font-black text-slate-400 uppercase">
                {currentView === 'estudantes' ? stats.listagemEstudantes.length : currentView === 'colaboradores' ? stats.listagemVisitas.length : stats.listagemPgs.length} Registros
              </span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 border-b">
                       {currentView === 'estudantes' ? STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => <th key={o.id} className="p-5 text-[10px] font-black uppercase text-slate-400 border-r border-slate-100/50">{o.label}</th>) : 
                        currentView === 'colaboradores' ? VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => <th key={o.id} className="p-5 text-[10px] font-black uppercase text-slate-400 border-r border-slate-100/50">{o.label}</th>) :
                        PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => <th key={o.id} className="p-5 text-[10px] font-black uppercase text-slate-400 border-r border-slate-100/50">{o.label}</th>)}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {(currentView === 'estudantes' ? stats.listagemEstudantes : currentView === 'colaboradores' ? stats.listagemVisitas : stats.listagemPgs).map((item, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          {currentView === 'estudantes' ? STUDENT_COLUMNS_OPTIONS.filter(o => selectedStudentCols.includes(o.id)).map(o => <td key={o.id} className="p-5 text-[11px] font-bold text-slate-700 border-r border-slate-50">{(item as any)[o.id]}</td>) : 
                           currentView === 'colaboradores' ? VISIT_COLUMNS_OPTIONS.filter(o => selectedVisitCols.includes(o.id)).map(o => <td key={o.id} className="p-5 text-[11px] font-bold text-slate-700 border-r border-slate-50">{(item as any)[o.id]}</td>) :
                           PG_COLUMNS_OPTIONS.filter(o => selectedPgCols.includes(o.id)).map(o => <td key={o.id} className="p-5 text-[11px] font-bold text-slate-700 border-r border-slate-50">{(item as any)[o.id]}</td>)}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {showColumnConfig && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-fadeIn border">
              <h3 className="font-black text-xs uppercase tracking-widest mb-2">Personalizar Listagem</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-8">Escolha as colunas para visualização e PDF</p>
              
              <div className="grid grid-cols-2 gap-3 mb-10">
                {(currentView === 'estudantes' || currentView === 'geral' ? STUDENT_COLUMNS_OPTIONS : currentView === 'colaboradores' ? VISIT_COLUMNS_OPTIONS : PG_COLUMNS_OPTIONS).map(opt => {
                   const isSel = (currentView === 'estudantes' || currentView === 'geral' ? selectedStudentCols : currentView === 'colaboradores' ? selectedVisitCols : selectedPgCols).includes(opt.id);
                   const setFn = (currentView === 'estudantes' || currentView === 'geral' ? setSelectedStudentCols : currentView === 'colaboradores' ? setSelectedVisitCols : setSelectedPgCols);
                   return (
                    <button key={opt.id} onClick={() => setFn(p => p.includes(opt.id) ? p.filter(x => x !== opt.id) : [...p, opt.id])} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center justify-between ${isSel ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {opt.label}
                      {isSel && <span>✓</span>}
                    </button>
                   );
                })}
              </div>
              <button onClick={() => setShowColumnConfig(false)} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">Salvar Ajustes</button>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryTile: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
    <div className="flex justify-between items-start mb-6">
      <span className="text-3xl">{icon}</span>
      <span className={`text-4xl font-black ${color}`}>{value}</span>
    </div>
    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
  </div>
);

export default Reports;
