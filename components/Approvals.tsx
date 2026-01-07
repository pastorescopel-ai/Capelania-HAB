
import React from 'react';
import { SolicitacaoAlteracao } from '../types';

interface ApprovalsProps {
  solicitacoes: SolicitacaoAlteracao[];
  onProcess: (id: string, approved: boolean) => void;
}

const Approvals: React.FC<ApprovalsProps> = ({ solicitacoes = [], onProcess }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Solicitações Pendentes ({solicitacoes.length})</h3>
        
        <div className="space-y-4">
          {solicitacoes.length > 0 ? (
            solicitacoes.map(req => (
              <div key={req.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${req.tipo === 'exclusao' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {req.tipo === 'edicao' ? 'Solicitação de Edição' : 'Solicitação de Exclusão'}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{req.dataSolicitacao || 'Data desconhecida'}</span>
                  </div>
                  
                  <h4 className="font-black text-slate-800 text-lg">{req.solicitante || 'Capelão não identificado'}</h4>
                  <p className="text-xs text-slate-500 mb-4">Categoria: <span className="font-bold uppercase text-indigo-600">{req.categoria || 'Não especificada'}</span></p>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Motivo Alegado:</p>
                    <p className="text-sm text-slate-700 italic">"{req.motivo || 'Nenhum motivo fornecido.'}"</p>
                  </div>

                  {req.tipo === 'edicao' && req.dadosAntigos && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                          <p className="text-[8px] font-black text-red-400 uppercase mb-2">Dados Atuais:</p>
                          <pre className="text-[9px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-40">{JSON.stringify(req.dadosAntigos, null, 2)}</pre>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <p className="text-[8px] font-black text-emerald-400 uppercase mb-2">Novos Dados Propostos:</p>
                          <pre className="text-[9px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-40">{JSON.stringify(req.dadosNovos, null, 2)}</pre>
                        </div>
                     </div>
                  )}
                  
                  {req.tipo === 'exclusao' && req.dadosAntigos && (
                    <div className="p-3 bg-slate-100 rounded-xl mt-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Registro a ser removido:</p>
                      <pre className="text-[9px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-40">{JSON.stringify(req.dadosAntigos, null, 2)}</pre>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    onClick={() => onProcess(req.id, true)}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Aprovar
                  </button>
                  <button 
                    onClick={() => onProcess(req.id, false)}
                    className="flex-1 md:flex-none bg-white text-red-600 px-8 py-3 rounded-2xl font-black text-[10px] border border-red-100 uppercase hover:bg-red-50 transition-all active:scale-95"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <span className="text-4xl block mb-4 opacity-50">🎉</span>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhuma solicitação aguardando aprovação</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
