
import React, { useState, useMemo } from 'react';
import { AppData } from '../types';
import { MESES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportsProps {
  data: AppData;
}

type ReportView = 'geral' | 'estudantes' | 'colaboradores' | 'pgs';

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>('Todos');
  const [filterCapelao, setFilterCapelao] = useState<string>('Todos');
  const [currentView, setCurrentView] = useState<ReportView>('geral');

  const years = useMemo(() => {
    const allYears = [
      ...data.estudosBiblicos.map(d => d.ano),
      ...data.classesBiblicas.map(d => d.ano),
      ...data.visitasColaboradores.map(d => d.ano),
      ...data.pequenosGrupos.map(d => d.ano),
      new Date().getFullYear()
    ];
    return Array.from(new Set(allYears)).sort((a, b) => b - a);
  }, [data]);

  const filteredData = useMemo(() => {
    const filterFn = (d: any) => {
      const yearMatch = d.ano === filterYear;
      const monthMatch = filterMonth === 'Todos' || d.mes === filterMonth;
      const capelaoMatch = filterCapelao === 'Todos' || d.capelao === filterCapelao;
      return yearMatch && monthMatch && capelaoMatch;
    };

    return {
      estudos: data.estudosBiblicos.filter(filterFn),
      classes: data.classesBiblicas.filter(filterFn),
      visitas: data.visitasColaboradores.filter(filterFn),
      pgs: data.pequenosGrupos.filter(filterFn)
    };
  }, [data, filterYear, filterMonth, filterCapelao]);

  const bibleStudentsReport = useMemo(() => {
    const totalEstudos = filteredData.estudos.length;
    const totalClassesParticipantes = filteredData.classes.reduce((acc, curr) => acc + curr.participantes.length, 0);

    return {
      total: totalEstudos + totalClassesParticipantes,
      estudos: totalEstudos,
      classes: totalClassesParticipantes,
      byCapelao: data.usuarios.map(u => {
        const estCount = filteredData.estudos.filter(e => e.capelao === u.nome).length;
        const clCount = filteredData.classes.filter(cl => cl.capelao === u.nome).reduce((acc, curr) => acc + curr.participantes.length, 0);
        return { name: u.nome, total: estCount + clCount };
      }).filter(item => item.total > 0)
    };
  }, [data, filteredData]);

  const visitsReport = useMemo(() => {
    const byMotivo = filteredData.visitas.reduce((acc: any, curr) => {
      acc[curr.motivo] = (acc[curr.motivo] || 0) + 1;
      return acc;
    }, {});

    const byCapelao = data.usuarios.map(u => ({
      name: u.nome,
      total: filteredData.visitas.filter(v => v.capelao === u.nome).length
    })).filter(i => i.total > 0);

    return { total: filteredData.visitas.length, byMotivo, byCapelao };
  }, [data, filteredData]);

  const pgsReport = useMemo(() => {
    const byCapelao = data.usuarios.map(u => {
      const pgs = filteredData.pgs.filter(p => p.capelao === u.nome);
      return {
        name: u.nome,
        count: pgs.length,
        names: pgs.map(p => p.nomePG).join(', ')
      };
    }).filter(i => i.count > 0);

    return { total: filteredData.pgs.length, byCapelao };
  }, [data, filteredData]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `Relatório de Capelania - ${currentView.toUpperCase()}`;
    const period = `Período: ${filterMonth} / ${filterYear}`;
    const chaplainText = `Capelão: ${filterCapelao}`;

    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(period, 14, 28);
    doc.text(chaplainText, 14, 33);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 38);

    let startY = 45;

    if (currentView === 'geral' || currentView === 'estudantes') {
      doc.setFontSize(14);
      doc.text('1. Estudantes da Bíblia', 14, startY);
      doc.setFontSize(10);
      doc.text(`Total Geral: ${bibleStudentsReport.total} (Individuais: ${bibleStudentsReport.estudos}, Classes: ${bibleStudentsReport.classes})`, 14, startY + 7);
      
      const tableData = filteredData.estudos.map(e => [e.capelao, e.nomeEstudante, e.setor, e.status]);
      (doc as any).autoTable({
        startY: startY + 12,
        head: [['Capelão', 'Estudante', 'Setor', 'Status']],
        body: tableData,
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (currentView === 'geral' || currentView === 'colaboradores') {
      if (startY > 250) { doc.addPage(); startY = 20; }
      doc.setFontSize(14);
      doc.text('2. Atendimento a Colaboradores', 14, startY);
      doc.setFontSize(10);
      doc.text(`Total de Visitas: ${visitsReport.total}`, 14, startY + 7);

      const tableData = filteredData.visitas.map(v => [v.capelao, v.nomeColaborador, v.setor, v.motivo, v.necessitaRetorno ? 'Sim' : 'Não']);
      (doc as any).autoTable({
        startY: startY + 12,
        head: [['Capelão', 'Colaborador', 'Setor', 'Motivo', 'Retorno']],
        body: tableData,
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    if (currentView === 'geral' || currentView === 'pgs') {
      if (startY > 250) { doc.addPage(); startY = 20; }
      doc.setFontSize(14);
      doc.text('3. Pequenos Grupos', 14, startY);
      doc.setFontSize(10);
      doc.text(`Total de PGs: ${pgsReport.total}`, 14, startY + 7);

      const tableData = filteredData.pgs.map(p => [p.capelao, p.nomePG, p.setor, p.turno, p.quantidadeParticipantes]);
      (doc as any).autoTable({
        startY: startY + 12,
        head: [['Capelão', 'Nome do PG', 'Setor', 'Turno', 'Participantes']],
        body: tableData,
      });
    }

    doc.save(`relatorio_capelania_${currentView}_${filterMonth}_${filterYear}.pdf`);
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const views = [
    { id: 'geral', label: 'Resumo Geral', icon: '📊' },
    { id: 'estudantes', label: 'Estudantes Bíblicos', icon: '📖' },
    { id: 'colaboradores', label: 'Colaboradores', icon: '🏥' },
    { id: 'pgs', label: 'Pequenos Grupos', icon: '👥' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id as ReportView)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                currentView === v.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
        
        <button 
          onClick={generatePDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Gerar PDF
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ano</label>
          <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mês</label>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="Todos">Todos os meses</option>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Filtrar Capelão</label>
          <select value={filterCapelao} onChange={e => setFilterCapelao(e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="Todos">Todos os capelães</option>
            {data.usuarios.map(u => <option key={u.nome} value={u.nome}>{u.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="animate-fadeIn">
        {(currentView === 'geral' || currentView === 'estudantes') && (
          <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700">📖 Estudantes da Bíblia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-indigo-600 text-white rounded-xl shadow-lg">
                <span className="block text-3xl font-black">{bibleStudentsReport.total}</span>
                <span className="text-[10px] font-bold uppercase opacity-80">Total</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="block text-2xl font-black text-slate-700">{bibleStudentsReport.estudos}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Individuais</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="block text-2xl font-black text-slate-700">{bibleStudentsReport.classes}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Classes</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bibleStudentsReport.byCapelao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" name="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {(currentView === 'geral' || currentView === 'colaboradores') && (
          <section className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-700">🏥 Visitas a Colaboradores</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex items-center justify-center h-72">
                {visitsReport.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(visitsReport.byMotivo).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(visitsReport.byMotivo).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm italic">Nenhuma visita registrada.</p>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumo por Capelão</h4>
                <div className="space-y-2">
                   {visitsReport.byCapelao.map(v => (
                     <div key={v.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">{v.name}</span>
                        <span className="font-black text-emerald-600">{v.total}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {(currentView === 'geral' || currentView === 'pgs') && (
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-700">👥 Pequenos Grupos</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black">
                  <tr>
                    <th className="px-6 py-4">Capelão</th>
                    <th className="px-6 py-4 text-center">Nº de PGs</th>
                    <th className="px-6 py-4">Grupos</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {pgsReport.byCapelao.length > 0 ? pgsReport.byCapelao.map(row => (
                    <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{row.name}</td>
                      <td className="px-6 py-4 text-center font-black text-amber-600">{row.count}</td>
                      <td className="px-6 py-4 text-slate-500 italic text-xs">{row.names}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Nenhum registro encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Reports;
