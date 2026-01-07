
import React, { useState, useMemo } from 'react';
import { AppData, Usuario, CategoriaDados, SolicitacaoAlteracao } from '../types';
import { EstudoBiblicoForm, ClasseBiblicaForm, PequenoGrupoForm, VisitaColaboradorForm } from './Forms';
import { MESES } from '../constants';

interface HistoryProps {
  data: AppData;
  currentUser: Usuario;
  onUpdateItem: (categoria: CategoriaDados, item: any) => void;
  onDeleteItem: (categoria: CategoriaDados, id: string) => void;
  onRequestChange: (request: SolicitacaoAlteracao) => void;
  onAddMasterColab: (name: string) => void;
}

const History: React.FC<HistoryProps> = ({ data, currentUser, onUpdateItem, onDeleteItem, onRequestChange, onAddMasterColab }) => {
  const [filterCategory, setFilterCategory] = useState<CategoriaDados>('estudosBiblicos');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const currentMonth = MESES[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const ensureArray = (val: any) => Array.isArray(val) ? val : (val ? Object.values(val) : []);

  const filteredData = useMemo(() => {
    const list = ensureArray(data[filterCategory]);
    const sorted = [...list].sort((a, b) => 0).reverse();
    
    if (currentUser.isAdmin) return sorted;
    return sorted.filter((item: any) => item && item.capelao === currentUser.nome);
  }, [data, filterCategory, currentUser.nome, currentUser.isAdmin]);

  // Define se a ação é permitida (Mês atual ou Admin)
  const isVigente = (item: any) => {
    if (!item) return false;
    return item.mes === currentMonth && Number(item.ano) === currentYear;
  };

  const handleSaveEdit = (newData: any) => {
    if (!editingItem) return;

    if (currentUser.isAdmin) {
      // Admin edita direto sem burocracia
      onUpdateItem(filterCategory, { ...newData, id: editingItem.id, capelao: editingItem.capelao });
      setEditingItem(null);
    } else {
      // Capelão sempre gera solicitação para o Admin aprovar
      const motive = window.prompt("A alteração será enviada para o Administrador. Descreva o motivo:");
      if (!motive) return;

      const request: SolicitacaoAlteracao = {
        id: crypto.randomUUID(),
        tipo: 'edicao',
        categoria: filterCategory,
        idRegistro: editingItem.id,
        dadosAntigos: JSON.parse(JSON.stringify(editingItem)),
        dadosNovos: { ...newData, id: editingItem.id, capelao: editingItem.capelao },
        solicitante: currentUser.nome,
        dataSolicitacao: new Date().toLocaleString('pt-BR'),
        motivo: motive
      };
      onRequestChange(request);
      setEditingItem(null);
    }
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    if (currentUser.isAdmin) {
      // Admin vê modal normal de exclusão
    } else {
      // Capelão vê modal de "Necessita Aprovação"
      setShowApprovalModal(true);
    }
  };

  const confirmDeleteAction = () => {
    if (!itemToDelete) return;

    if (currentUser.isAdmin) {
      onDeleteItem(filterCategory, itemToDelete.id);
      setItemToDelete(null);
    } else {
      const motive = window.prompt("Informe o motivo da exclusão para o administrador:");
      if (!motive) {
        setItemToDelete(null);
        setShowApprovalModal(false);
        return;
      }
      
      const request: SolicitacaoAlteracao = {
        id: crypto.randomUUID(),
        tipo: 'exclusao',
        categoria: filterCategory,
        idRegistro: itemToDelete.id,
        dadosAntigos: JSON.parse(JSON.stringify(itemToDelete)),
        solicitante: currentUser.nome,
        dataSolicitacao: new Date().toLocaleString('pt-BR'),
        motivo: motive
      };
      onRequestChange(request);
      setItemToDelete(null);
      setShowApprovalModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Modal de Confirmação para Admin */}
      {itemToDelete && currentUser.isAdmin && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center border border-white/20">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🗑️</div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Excluir Registro</h3>
            <p className="text-slate-600 font-bold text-sm mb-8 leading-relaxed">
              Você está prestes a remover este registro permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={confirmDeleteAction} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 shadow-lg shadow-red-100">Confirmar</button>
              <button onClick={() => setItemToDelete(null)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Aprovação para Capelães */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center border border-white/20">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚖️</div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Ação Restrita</h3>
            <p className="text-slate-600 font-bold text-sm mb-8 leading-relaxed italic">
              "Para editar ou excluir este registro, a solicitação será enviada para o campo Aprovações do Administrador. Deseja prosseguir?"
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={confirmDeleteAction} className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-100">Confirmar Solicitação</button>
              <button onClick={() => { setItemToDelete(null); setShowApprovalModal(false); }} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">Desistir</button>
            </div>
          </div>
        </div>
      )}

      {editingItem ? (
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-center justify-between mb-6 p-6 rounded-[2rem] border-2 border-dashed ${currentUser.isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
            <div>
              <h3 className={`font-black uppercase text-[10px] tracking-widest ${currentUser.isAdmin ? 'text-blue-800' : 'text-amber-800'}`}>
                {currentUser.isAdmin ? '✏️ Edição Administrativa' : '🛡️ Solicitação de Alteração'}
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 font-bold">Editando: {editingItem.nomeEstudante || editingItem.nomePG || editingItem.nomeColaborador}</p>
            </div>
            <button onClick={() => setEditingItem(null)} className="bg-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border hover:text-slate-900 shadow-sm">Voltar</button>
          </div>
          {filterCategory === 'estudosBiblicos' && <EstudoBiblicoForm initialData={editingItem} capelao={editingItem.capelao} setores={data.setores} onSave={handleSaveEdit} />}
          {filterCategory === 'classesBiblicas' && <ClasseBiblicaForm initialData={editingItem} capelao={editingItem.capelao} setores={data.setores} onSave={handleSaveEdit} />}
          {filterCategory === 'pequenosGrupos' && <PequenoGrupoForm initialData={editingItem} capelao={editingItem.capelao} setores={data.setores} onSave={handleSaveEdit} />}
          {/* FIX: Added missing 'onAddMasterColab' prop */}
          {filterCategory === 'visitasColaboradores' && <VisitaColaboradorForm initialData={editingItem} capelao={editingItem.capelao} setores={data.setores} colaboradoresMestre={data.colaboradoresMestre || []} onSave={handleSaveEdit} onAddMasterColab={onAddMasterColab} />}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/40 rounded-[2rem] overflow-x-auto no-scrollbar">
            {(['estudosBiblicos', 'classesBiblicas', 'pequenosGrupos', 'visitasColaboradores'] as CategoriaDados[]).map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`flex-1 min-w-[140px] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-[#005a9c] shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}>
                {cat === 'estudosBiblicos' && '📖 Estudos'}
                {cat === 'classesBiblicas' && '🏫 Classes'}
                {cat === 'pequenosGrupos' && '👥 PGs'}
                {cat === 'visitasColaboradores' && '🏥 Visitas'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item: any) => {
              if (!item) return null;
              const isVig = isVigente(item);
              const isPending = ensureArray(data.solicitacoes).some((s: any) => s && s.idRegistro === item.id);
              
              return (
                <div key={item.id} className={`bg-white p-7 rounded-[2.5rem] border shadow-sm transition-all relative group ${!isVig && !currentUser.isAdmin ? 'opacity-70 border-slate-100' : 'hover:shadow-xl border-blue-50'}`}>
                  {isPending && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase z-10 flex items-center gap-2 shadow-lg animate-bounce">⌛ Aguardando Admin</div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{item.mes} / {item.ano}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${!isVig ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isVig ? 'Mês Vigente' : 'Mês Passado'}
                    </span>
                  </div>
                  
                  <h4 className="font-black text-slate-800 text-base leading-tight mb-2 truncate">
                    {item.nomeEstudante || item.nomePG || item.nomeColaborador || 'Grupo'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold uppercase mb-6">{item.setor}</p>

                  <div className="flex gap-3">
                    <button 
                      disabled={isPending} 
                      onClick={() => setEditingItem(item)} 
                      className={`flex-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50`}
                    >
                      {currentUser.isAdmin ? '✏️ Editar' : '📑 Solicitar'}
                    </button>
                    <button 
                      disabled={isPending} 
                      onClick={() => handleDeleteClick(item)} 
                      className={`flex-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50`}
                    >
                      {currentUser.isAdmin ? '🗑️ Excluir' : '🚫 Excluir'}
                    </button>
                  </div>
                  {!isVig && !currentUser.isAdmin && (
                    <p className="text-[8px] text-center text-slate-400 mt-3 font-bold uppercase italic">Ação enviará pedido de alteração ao Admin</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
