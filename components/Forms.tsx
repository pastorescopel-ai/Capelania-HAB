
import React, { useState, useEffect, useRef } from 'react';
import { MESES, TURNOS, MOTIVOS_VISITA } from '../constants';
import { StatusEstudo, Turno, MotivoVisita, Usuario } from '../types';

interface BaseFormProps {
  capelao: string;
  setores: string[];
  onSave: (data: any) => void;
  initialData?: any;
}

export const EstudoBiblicoForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    nomeEstudante: '',
    telefone: '',
    status: 'Novo estudo' as StatusEstudo,
    observacoes: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 11);
    if (limited.length <= 2) return limited.length > 0 ? `(${limited}` : limited;
    if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id || crypto.randomUUID(), capelao });
    if (!initialData) setFormData(prev => ({ ...prev, nomeEstudante: '', telefone: '', observacoes: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-6 max-w-2xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ano*</label>
          <input disabled={!!initialData} type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Mês*</label>
          <select disabled={!!initialData} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Setor*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Status do Estudo*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as StatusEstudo})} required>
            <option value="Novo estudo">Novo estudo</option>
            <option value="Continuando estudo">Continuando estudo</option>
            <option value="Terminou estudo">Terminou estudo</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome do Estudante*</label>
        <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.nomeEstudante} onChange={e => setFormData({...formData, nomeEstudante: e.target.value})} required />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Telefone WhatsApp*</label>
        <input type="tel" placeholder="(00) 00000-0000" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.telefone} onChange={handlePhoneChange} required />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Observações</label>
        <textarea rows={4} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} placeholder="Ponto de atenção ou pedido específico..." />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-xl transition-all">
        {initialData ? 'Salvar Alterações' : 'Confirmar Registro'}
      </button>
    </form>
  );
};

export const ClasseBiblicaForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    observacoes: ''
  });
  
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setParticipantes(initialData.participantes || []);
    }
  }, [initialData]);

  const addName = () => {
    const name = currentName.trim();
    if (name && !participantes.includes(name)) {
      setParticipantes([...participantes, name]);
      setCurrentName('');
      inputRef.current?.focus();
    }
  };

  const removeName = (nameToRemove: string) => {
    setParticipantes(participantes.filter(n => n !== nameToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addName();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (participantes.length === 0) {
      alert("Adicione pelo menos um aluno à lista.");
      return;
    }
    onSave({ ...formData, id: initialData?.id || crypto.randomUUID(), capelao, participantes });
    if (!initialData) {
      setFormData(prev => ({ ...prev, observacoes: '' }));
      setParticipantes([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-6 max-w-2xl mx-auto animate-fadeIn">
       <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ano*</label>
          <input disabled={!!initialData} type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Mês*</label>
          <select disabled={!!initialData} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Setor*</label>
        <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
          {setores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      
      <div className="space-y-4">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Adicionar Alunos*</label>
        <div className="flex gap-2">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Digite o nome do aluno..." 
            className="flex-1 bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={currentName}
            onChange={e => setCurrentName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            type="button" 
            onClick={addName}
            className="bg-[#005a9c] text-white w-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-100 active:scale-90 transition-transform"
          >
            +
          </button>
        </div>

        <div className="min-h-[100px] p-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 space-y-2">
          {participantes.length === 0 ? (
            <p className="text-[10px] text-slate-300 font-bold uppercase text-center py-6 italic">Nenhum aluno adicionado ainda</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participantes.map(name => (
                <div key={name} className="bg-white px-3 py-2 rounded-xl border shadow-sm flex items-center gap-2 animate-fadeIn group">
                  <span className="text-[11px] font-bold text-slate-700">{name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeName(name)} 
                    className="text-red-400 hover:text-red-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-[8px] text-slate-400 font-bold uppercase ml-1">Dica: Digite o nome e aperte "+" ou Enter no teclado.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Observações</label>
        <textarea rows={3} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} placeholder="Resumo do que foi ensinado ou necessidades do grupo..." />
      </div>

      <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-xl transition-all">
        {initialData ? 'Atualizar Registro' : 'Gravar Aula'}
      </button>
    </form>
  );
};

export const PequenoGrupoForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    nomePG: '',
    turno: 'Manhã' as Turno,
    liderPG: '',
    quantidadeParticipantes: 0
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id || crypto.randomUUID(), capelao });
    if (!initialData) setFormData(prev => ({ ...prev, nomePG: '', liderPG: '', quantidadeParticipantes: 0 }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-6 max-w-2xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ano*</label>
          <input disabled={!!initialData} type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Mês*</label>
          <select disabled={!!initialData} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Localização/Setor*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Turno*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value as Turno})} required>
            {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome do Grupo*</label>
          <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.nomePG} onChange={e => setFormData({...formData, nomePG: e.target.value})} required />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Líder do Grupo*</label>
          <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.liderPG} onChange={e => setFormData({...formData, liderPG: e.target.value})} required />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nº de Participantes*</label>
        <input type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.quantidadeParticipantes} onChange={e => setFormData({...formData, quantidadeParticipantes: parseInt(e.target.value)})} required min="1" />
      </div>
      <button type="submit" className="w-full bg-amber-500 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 shadow-xl transition-all">
        {initialData ? 'Atualizar Pequeno Grupo' : 'Registrar Pequeno Grupo'}
      </button>
    </form>
  );
};

interface VisitaProps extends BaseFormProps {
  colaboradoresMestre: string[];
  onAddMasterColab: (name: string) => void;
}

export const VisitaColaboradorForm: React.FC<VisitaProps> = ({ capelao, setores, colaboradoresMestre, onSave, onAddMasterColab, initialData }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    nomeColaborador: '',
    dataAtendimento: new Date().toISOString().split('T')[0],
    motivo: 'Agendado' as MotivoVisita,
    necessitaRetorno: false,
    observacoes: ''
  });

  const [isNewColab, setIsNewColab] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const nomeLimpo = formData.nomeColaborador.trim().toLowerCase();
    const exists = colaboradoresMestre.some(c => c.toLowerCase() === nomeLimpo);
    setIsNewColab(formData.nomeColaborador.trim().length > 2 && !exists);
  }, [formData.nomeColaborador, colaboradoresMestre]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id || crypto.randomUUID(), capelao });
    if (!initialData) setFormData(prev => ({ ...prev, nomeColaborador: '', observacoes: '' }));
  };

  const handleQuickAdd = () => {
    const name = formData.nomeColaborador.trim();
    if (name) {
      onAddMasterColab(name);
      setIsNewColab(false);
      alert(`"${name}" foi adicionado à lista mestre de colaboradores!`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-6 max-w-2xl mx-auto animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Ano*</label>
          <input disabled={!!initialData} type="number" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Mês*</label>
          <select disabled={!!initialData} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Setor do Colaborador*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Data da Visita*</label>
          <input type="date" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.dataAtendimento} onChange={e => setFormData({...formData, dataAtendimento: e.target.value})} required />
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome do Colaborador*</label>
        <div className="flex gap-2">
          <input 
            list="colaboradores-list"
            type="text" 
            className="flex-1 bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            value={formData.nomeColaborador} 
            onChange={e => setFormData({...formData, nomeColaborador: e.target.value})} 
            required 
            placeholder="Digite o nome..."
          />
          {isNewColab && (
            <button 
              type="button" 
              onClick={handleQuickAdd}
              className="bg-emerald-600 text-white px-6 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all whitespace-nowrap"
            >
              + Cadastrar
            </button>
          )}
        </div>
        <datalist id="colaboradores-list">
          {colaboradoresMestre.map(nome => <option key={nome} value={nome} />)}
        </datalist>
        {isNewColab && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 animate-fadeIn">
            <span className="text-xl">💡</span>
            <p className="text-[10px] font-bold text-amber-700 uppercase leading-tight">
              Este colaborador não está na lista. Clique em <b>"+ Cadastrar"</b> para adicioná-lo permanentemente.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Motivo do Atendimento*</label>
          <select className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value as MotivoVisita})} required>
            {MOTIVOS_VISITA.map(mv => <option key={mv} value={mv}>{mv}</option>)}
          </select>
        </div>
        <div className="flex items-center pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all" checked={formData.necessitaRetorno} onChange={e => setFormData({...formData, necessitaRetorno: e.target.checked})} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Necessita Retorno?</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Observações</label>
        <textarea rows={3} className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} placeholder="Informações adicionais relevantes..." />
      </div>
      <button type="submit" className="w-full bg-rose-500 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 shadow-xl transition-all">
        {initialData ? 'Atualizar Visita' : 'Concluir Atendimento'}
      </button>
    </form>
  );
};

export const PerfilForm: React.FC<{ user: Usuario, onUpdate: (u: any) => void }> = ({ user, onUpdate }) => {
  const [nome, setNome] = useState(user.nome);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | undefined>(user.fotoPerfil);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoPerfil(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificação de segurança
    if (senhaAtual !== user.senha) {
      alert("A senha atual está incorreta.");
      return;
    }

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
      alert("A nova senha e a confirmação não conferem.");
      return;
    }

    const updatePayload: any = { nome, fotoPerfil };
    if (novaSenha) {
      updatePayload.senha = novaSenha;
    }

    onUpdate(updatePayload);
    // Limpa campos sensíveis após o envio
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8">Meu Perfil Online</h3>
            <div className="relative group mx-auto w-32 h-32 mb-2">
              <div className="w-full h-full rounded-full border-4 border-slate-50 overflow-hidden shadow-2xl bg-slate-100 flex items-center justify-center">
                {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <span className="text-5xl opacity-20">👤</span>}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full transition-all cursor-pointer">
                <span className="text-[10px] font-black uppercase tracking-widest">{fotoPerfil ? 'Alterar' : 'Inserir Foto'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            {/* Descrição clara de inserção de foto solicitada */}
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">Clique acima para inserir foto</p>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{user.email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome" required />
            </div>

            <div className="pt-4 border-t border-slate-50">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Para salvar alterações, digite sua senha atual</label>
              <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="w-full p-4 bg-slate-100/50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Senha atual*" required />
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-4">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">Alterar Senha (Opcional)</p>
              <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nova senha" />
              <input type="password" value={confirmarNovaSenha} onChange={e => setConfirmarNovaSenha(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Repetir nova senha" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#005a9c] text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export const AddUserForm: React.FC<{ onAdd: (user: Partial<Usuario>) => void }> = ({ onAdd }) => {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', isAdmin: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); setFormData({ nome: '', email: '', senha: '', isAdmin: false }); }} className="space-y-4">
      <input type="text" placeholder="Nome Completo*" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" required />
      <input type="email" placeholder="E-mail*" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" required />
      <input type="password" placeholder="Senha Inicial*" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" required />
      <div className="flex items-center gap-2 px-2">
        <input type="checkbox" checked={formData.isAdmin} onChange={e => setFormData({...formData, isAdmin: e.target.checked})} />
        <label className="text-[10px] font-black text-slate-400 uppercase">Privilégios Administrativos</label>
      </div>
      <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Adicionar Capelão</button>
    </form>
  );
};
