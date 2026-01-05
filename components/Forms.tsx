
import React, { useState } from 'react';
import { MESES, TURNOS, MOTIVOS_VISITA } from '../constants';
import { StatusEstudo, Turno, MotivoVisita } from '../types';

interface BaseFormProps {
  capelao: string;
  setores: string[];
  onSave: (data: any) => void;
}

export const EstudoBiblicoForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    nomeEstudante: '',
    telefone: '',
    status: 'Novo estudo' as StatusEstudo,
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: crypto.randomUUID(), capelao });
    setFormData(prev => ({ ...prev, nomeEstudante: '', telefone: '', observacoes: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ano *</label>
          <input type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mês *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Setor do Hospital *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as StatusEstudo})} required>
            <option value="Novo estudo">Novo estudo</option>
            <option value="Continuando estudo">Continuando estudo</option>
            <option value="Terminou estudo">Terminou estudo</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Estudante *</label>
        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.nomeEstudante} onChange={e => setFormData({...formData, nomeEstudante: e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Telefone *</label>
        <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
        <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Salvar Registro
      </button>
    </form>
  );
};

export const ClasseBiblicaForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    participantesInput: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const participantes = formData.participantesInput.split('\n').filter(p => p.trim() !== '');
    onSave({ 
      ...formData, 
      id: crypto.randomUUID(), 
      capelao, 
      participantes 
    });
    setFormData(prev => ({ ...prev, participantesInput: '', observacoes: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-2xl mx-auto">
       <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ano *</label>
          <input type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mês *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Setor *</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
          {setores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nomes dos Participantes (Um por linha) *</label>
        <textarea rows={5} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="João Silva&#10;Maria Oliveira..." value={formData.participantesInput} onChange={e => setFormData({...formData, participantesInput: e.target.value})} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
        <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
      </div>
      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
        Registrar Classe Bíblica
      </button>
    </form>
  );
};

export const PequenoGrupoForm: React.FC<BaseFormProps> = ({ capelao, setores, onSave }) => {
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    setor: setores[0] || '',
    nomePG: '',
    turno: 'Manhã' as Turno,
    liderPG: '',
    quantidadeParticipantes: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: crypto.randomUUID(), capelao });
    setFormData(prev => ({ ...prev, nomePG: '', liderPG: '', quantidadeParticipantes: 0 }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ano *</label>
          <input type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mês *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Setor *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Turno *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.turno} onChange={e => setFormData({...formData, turno: e.target.value as Turno})} required>
            {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do PG *</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.nomePG} onChange={e => setFormData({...formData, nomePG: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Líder do PG *</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.liderPG} onChange={e => setFormData({...formData, liderPG: e.target.value})} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Qtd. Participantes *</label>
        <input type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.quantidadeParticipantes} onChange={e => setFormData({...formData, quantidadeParticipantes: parseInt(e.target.value)})} required min="1" />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Salvar Pequeno Grupo</button>
    </form>
  );
};

interface VisitaProps extends BaseFormProps {
  colaboradoresMestre: string[];
}

export const VisitaColaboradorForm: React.FC<VisitaProps> = ({ capelao, setores, colaboradoresMestre, onSave }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: crypto.randomUUID(), capelao });
    setFormData(prev => ({ ...prev, nomeColaborador: '', observacoes: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ano *</label>
          <input type="number" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.ano} onChange={e => setFormData({...formData, ano: parseInt(e.target.value)})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mês *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.mes} onChange={e => setFormData({...formData, mes: e.target.value})} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Setor *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} required>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Atendimento *</label>
          <input type="date" className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.dataAtendimento} onChange={e => setFormData({...formData, dataAtendimento: e.target.value})} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Colaborador *</label>
        <input 
          list="colaboradores-list"
          type="text" 
          className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
          value={formData.nomeColaborador} 
          onChange={e => setFormData({...formData, nomeColaborador: e.target.value})} 
          required 
          placeholder="Comece a digitar o nome..."
        />
        <datalist id="colaboradores-list">
          {colaboradoresMestre.map(nome => <option key={nome} value={nome} />)}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Motivo *</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value as MotivoVisita})} required>
            {MOTIVOS_VISITA.map(mv => <option key={mv} value={mv}>{mv}</option>)}
          </select>
        </div>
        <div className="flex items-center pt-6">
          <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked={formData.necessitaRetorno} onChange={e => setFormData({...formData, necessitaRetorno: e.target.checked})} />
          <label className="ml-2 block text-sm font-medium text-gray-700">Necessita Retorno?</label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
        <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Registrar Visita</button>
    </form>
  );
};
