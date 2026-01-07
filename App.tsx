
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppData, Usuario, SyncConfig, CategoriaDados, SolicitacaoAlteracao, LogEntry } from './types';
import { storageService } from './services/storageService';
import Layout from './components/Layout';
import Logo from './components/Logo';
import { EstudoBiblicoForm, ClasseBiblicaForm, PequenoGrupoForm, VisitaColaboradorForm, PerfilForm, AddUserForm } from './components/Forms';
import Reports from './components/Reports';
import History from './components/History';
import Approvals from './components/Approvals';

const ensureArray = (val: any) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.values(val);
  return [];
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => storageService.getData());
  const [loggedInUser, setLoggedInUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [sheetsUrlInput, setSheetsUrlInput] = useState(data.syncConfig?.googleSheetsUrl || "");
  
  // States para Gestão de Setores
  const [newSector, setNewSector] = useState('');
  const [editingSectorIdx, setEditingSectorIdx] = useState<number | null>(null);
  const [editingSectorValue, setEditingSectorValue] = useState('');
  
  // States para Gestão de Colaboradores
  const [newColab, setNewColab] = useState('');
  const [editingColabIdx, setEditingColabIdx] = useState<number | null>(null);
  const [editingColabValue, setEditingColabValue] = useState('');

  // Modais de Importação
  const [showImportColabs, setShowImportColabs] = useState(false);
  const [importText, setImportText] = useState('');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLog = (message: string, type: 'error' | 'info' | 'success' = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      message,
      type
    };
    setData(prev => ({
      ...prev,
      logs: [entry, ...ensureArray(prev.logs)].slice(0, 50)
    }));
  };

  const handleTestConnection = async () => {
    const url = sheetsUrlInput.trim();
    if (!url) {
      showToast("Insira uma URL para testar.", "error");
      return;
    }
    if (!url.startsWith("https://script.google.com")) {
      showToast("URL inválida. Deve começar com script.google.com", "error");
      return;
    }

    setIsTestingConn(true);
    addLog("Teste: Iniciando verificação de conexão...", "info");

    try {
      const response = await fetch(`${url}?_t=${Date.now()}`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      
      const testData = await response.json();
      const registros = (testData.estudosBiblicos?.length || 0) + (testData.visitasColaboradores?.length || 0);
      
      showToast(`Conexão OK! Servidor respondeu com ${registros} registros.`, "success");
      addLog("Conexão estabelecida com sucesso.", "success");
      setIsOnline(true);
    } catch (e: any) {
      const msg = e.message.includes('fetch') ? 'Erro de Rede ou CORS. Verifique se publicou como "Qualquer pessoa".' : e.message;
      showToast(`Falha: ${msg}`, "error");
      addLog(`Falha no teste: ${msg}`, "error");
      setIsOnline(false);
    } finally {
      setIsTestingConn(false);
    }
  };

  // Efeito para detectar configuração via Link de Convite
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#setup=')) {
      try {
        const encoded = hash.split('=')[1];
        const decodedConfig = JSON.parse(atob(encoded));
        if (decodedConfig.url) {
          setData(prev => ({
            ...prev,
            syncConfig: { ...prev.syncConfig!, googleSheetsUrl: decodedConfig.url, enabled: true, provider: 'googlesheets' }
          }));
          setSheetsUrlInput(decodedConfig.url);
          window.location.hash = '';
          showToast("Configuração de equipe aplicada!", "success");
          addLog("Sistema: Configuração importada via link de convite.", "success");
        }
      } catch (e) {
        addLog("Erro: Falha ao decodificar link de convite.", "error");
      }
    }
  }, []);

  const syncWithGoogleSheets = async (mode: 'pull' | 'push', payload?: any) => {
    const urlStr = data.syncConfig?.googleSheetsUrl?.trim();
    if (!urlStr) return false;
    
    setIsSyncing(true);
    try {
      if (mode === 'push') {
        await fetch(urlStr, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });
        addLog("Nuvem: Dados centralizados.", "success");
      } else {
        const response = await fetch(`${urlStr}?_t=${Date.now()}`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const cloudData = await response.json();
        if (cloudData && typeof cloudData === 'object') {
          setData(prev => ({
            ...prev,
            ...cloudData,
            syncConfig: prev.syncConfig,
            logs: prev.logs,
            usuarios: ensureArray(cloudData.usuarios || prev.usuarios),
            setores: ensureArray(cloudData.setores || prev.setores),
            colaboradoresMestre: ensureArray(cloudData.colaboradoresMestre || prev.colaboradoresMestre)
          }));
          addLog("Nuvem: Sincronização concluída.", "success");
        }
      }
      setIsOnline(true);
      return true;
    } catch (e: any) {
      addLog(`Servidor: ${e.message}`, "error");
      setIsOnline(false);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (data.syncConfig?.enabled && data.syncConfig.googleSheetsUrl) {
      syncWithGoogleSheets('pull');
      const interval = setInterval(() => syncWithGoogleSheets('pull'), 120000);
      return () => clearInterval(interval);
    }
  }, [data.syncConfig?.enabled, data.syncConfig?.googleSheetsUrl]);

  useEffect(() => {
    storageService.saveData(data);
    if (data.syncConfig?.enabled && isOnline) {
      const timer = setTimeout(async () => {
        const { syncConfig: _, logs: __, ...toUpload } = data;
        syncWithGoogleSheets('push', toUpload);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [data, isOnline]);

  const stats = useMemo(() => {
    if (!loggedInUser) return null;
    const filter = (list: any[]) => {
      const arr = ensureArray(list);
      return loggedInUser.isAdmin ? arr : arr.filter(i => i.capelao === loggedInUser.nome);
    };
    return {
      estudos: filter(data.estudosBiblicos).length,
      classes: filter(data.classesBiblicas).length,
      pgs: filter(data.pequenosGrupos).length,
      visitas: filter(data.visitasColaboradores).length
    };
  }, [data, loggedInUser]);

  const handleGenerateInvite = () => {
    const config = { url: data.syncConfig?.googleSheetsUrl };
    const encoded = btoa(JSON.stringify(config));
    const inviteUrl = `${window.location.origin}${window.location.pathname}#setup=${encoded}`;
    navigator.clipboard.writeText(inviteUrl);
    showToast("Link de convite copiado!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoCustom' | 'reportLogoCustom') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, [field]: reader.result as string }));
        showToast("Logotipo atualizado!");
      };
      reader.readAsDataURL(file);
    }
  };

  const copyBackendCode = () => {
    const code = `function doGet(e) {
  var data = PropertiesService.getScriptProperties().getProperty('appData');
  return ContentService.createTextOutput(data || '{}').setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    if (!contents) return ContentService.createTextOutput('Sem dados').setMimeType(ContentService.MimeType.TEXT);
    PropertiesService.getScriptProperties().setProperty('appData', contents);
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var updateSheet = function(sheetName, items, headers) {
      var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
      sheet.clear();
      sheet.appendRow(headers);
      if (items && items.length > 0) {
        items.forEach(function(item) {
          var row = headers.map(function(h) { 
            if(h === 'Participantes' && Array.isArray(item.participantes)) return item.participantes.join(', ');
            return item[h.toLowerCase().replace(/ /g, '')] || item[h] || ''; 
          });
          sheet.appendRow(row);
        });
      }
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f3f3');
    };

    updateSheet('Estudos', data.estudosBiblicos || [], ['Ano', 'Mes', 'Setor', 'Capelao', 'nomeEstudante', 'Telefone', 'Status']);
    updateSheet('Classes', data.classesBiblicas || [], ['Ano', 'Mes', 'Setor', 'Capelao', 'Participantes']);
    updateSheet('PGs', data.pequenosGrupos || [], ['Ano', 'Mes', 'Setor', 'Capelao', 'nomePG', 'LiderPG', 'quantidadeParticipantes']);
    updateSheet('Visitas', data.visitasColaboradores || [], ['Ano', 'Mes', 'Setor', 'Capelao', 'nomeColaborador', 'dataAtendimento', 'Motivo']);
    updateSheet('Usuarios', data.usuarios || [], ['Nome', 'Email', 'Senha', 'isAdmin']);
    updateSheet('Setores', (data.setores || []).map(s => ({nome: s})), ['Nome']);
    updateSheet('ColaboradoresMestre', (data.colaboradoresMestre || []).map(c => ({nome: c})), ['Nome']);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch(f) {
    return ContentService.createTextOutput('Erro: ' + f.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}`;
    navigator.clipboard.writeText(code);
    showToast("Script v6 (Centralização Total) copiado!");
  };

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border animate-fadeIn">
          <div className="text-center mb-8">
            <Logo size="xl" className="mx-auto mb-4" src={data.logoCustom} />
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Capelania HAB</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Plataforma de Gestão Integrada</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            const senha = (e.target as any).senha.value;
            const user = ensureArray(data.usuarios).find(u => u.email === email && u.senha === senha);
            if (user) setLoggedInUser(user); else alert("E-mail ou senha incorretos.");
          }}>
            <input name="email" type="email" placeholder="E-mail" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
            <input name="senha" type="password" placeholder="Senha" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
            <button className="w-full bg-[#005a9c] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform">Acessar Sistema</button>
          </form>
          {!data.syncConfig?.enabled && (
             <div className="mt-6 pt-6 border-t border-slate-100 text-center">
               <button onClick={() => {
                 const url = window.prompt("Insira o Link do Banco de Dados:");
                 if(url) setData(p => ({ ...p, syncConfig: { provider: 'googlesheets', googleSheetsUrl: url, enabled: true } }));
               }} className="text-[9px] font-black uppercase text-blue-500 hover:underline tracking-widest">
                 ⚙️ Configurar Banco de Dados
               </button>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} currentUser={loggedInUser} onLogout={() => setLoggedInUser(null)} 
      logoSrc={data.logoCustom} isSyncing={isSyncing} isOnline={isOnline}
      pendingApprovalsCount={ensureArray(data.solicitacoes).length}
    >
      {toast && (
        <div className="fixed top-20 right-8 z-[200] animate-fadeIn">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border font-black uppercase text-[10px] text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {toast.message}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-[#005a9c] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <h2 className="text-4xl font-black tracking-tighter mb-2">{data.welcomeTitle || 'Paz seja convosco!'}</h2>
            <p className="opacity-70 font-bold uppercase text-[10px] tracking-widest">{data.welcomeSubtitle || 'Gestão de Atividades de Capelania'}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Estudos" value={stats.estudos} icon="📖" color="bg-blue-500" />
            <StatCard title="Classes" value={stats.classes} icon="🏫" color="bg-emerald-500" />
            <StatCard title="PGs" value={stats.pgs} icon="👥" color="bg-amber-500" />
            <StatCard title="Visitas" value={stats.visitas} icon="🏥" color="bg-rose-500" />
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-12 animate-fadeIn pb-32 max-w-5xl mx-auto">
          {/* 1. Servidor e Convites */}
          <section className="bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
            <div className="flex justify-between items-center border-b pb-6">
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">🌐 Servidor e Equipe</h3>
               <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className={`text-[9px] font-black uppercase ${isOnline ? 'text-emerald-700' : 'text-red-700'}`}>{isOnline ? 'Banco Conectado' : 'Desconectado'}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-2">Convite da Equipe</h4>
                  <p className="text-[9px] text-indigo-700 font-bold uppercase mb-4 leading-relaxed">Gere um link para configurar automaticamente o app nos celulares da equipe.</p>
                </div>
                <button onClick={handleGenerateInvite} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-700 transition-all">Copiar Link de Convite</button>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-600 mb-2">Script Sincronizador</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-4 leading-relaxed">Código v6 para sua planilha Google se tornar o servidor central.</p>
                </div>
                <button onClick={copyBackendCode} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all">Copiar Script v6</button>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-1">URL da Implantação (/exec)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" className="flex-1 p-4 bg-slate-50 border rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="https://script.google.com/macros/s/.../exec" value={sheetsUrlInput} onChange={e => setSheetsUrlInput(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleTestConnection} disabled={isTestingConn} className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${isTestingConn ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {isTestingConn ? 'Testando...' : '⚡ Testar'}
                    </button>
                    <button onClick={() => { setData(p => ({ ...p, syncConfig: { provider: 'googlesheets', googleSheetsUrl: sheetsUrlInput, enabled: true } })); showToast("Servidor configurado!"); }} className="flex-1 sm:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-700 transition-all">Salvar</button>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic ml-1">Dica: Após colar a URL, use o botão ⚡ Testar para validar a conexão.</p>
            </div>
          </section>

          {/* 2. Gestão de Capelães */}
          <section className="bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b pb-6">👥 Gestão de Acessos (Capelães)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <AddUserForm onAdd={(newUser) => { setData(prev => ({ ...prev, usuarios: [...ensureArray(prev.usuarios), { ...newUser, id: crypto.randomUUID() } as Usuario] })); showToast("Capelão cadastrado!"); }} />
              <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {ensureArray(data.usuarios).map(u => (
                  <div key={u.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border hover:border-blue-200 transition-colors">
                    <div>
                      <span className="text-[11px] font-black text-slate-700 block">{u.nome}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{u.isAdmin ? 'Administrador' : 'Capelão'}</span>
                    </div>
                    {u.id !== 'admin-mestre' && (<button onClick={() => { if(confirm("Revogar acesso?")) setData(prev => ({ ...prev, usuarios: ensureArray(prev.usuarios).filter(user => user.id !== u.id) })); }} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">✕</button>)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Gestão de Setores */}
          <section className="bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b pb-6">🏢 Configuração de Setores</h3>
            <div className="flex gap-3">
              <input type="text" placeholder="Novo setor..." className="flex-1 p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" value={newSector} onChange={e => setNewSector(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setNewSector(''), setData(p => ({...p, setores: [...ensureArray(p.setores), newSector]})))} />
              <button onClick={() => { if(newSector) { setData(p => ({...p, setores: [...ensureArray(p.setores), newSector]})); setNewSector(''); } }} className="bg-[#005a9c] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ensureArray(data.setores).map((s, idx) => (
                <div key={idx} className="bg-slate-50 px-4 py-2 rounded-xl border flex items-center gap-3">
                  {editingSectorIdx === idx ? (
                    <input autoFocus className="bg-transparent font-bold text-[11px] outline-none" value={editingSectorValue} onChange={e => setEditingSectorValue(e.target.value)} onBlur={() => { setData(p => ({...p, setores: p.setores.map((v, i) => i === idx ? editingSectorValue : v)})); setEditingSectorIdx(null); }} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-700" onClick={() => { setEditingSectorIdx(idx); setEditingSectorValue(s); }}>{s}</span>
                  )}
                  <button onClick={() => setData(p => ({...p, setores: ensureArray(p.setores).filter((_, i) => i !== idx)}))} className="text-red-400 text-[10px]">✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Gestão de Colaboradores Mestre */}
          <section className="bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
            <div className="flex justify-between items-center border-b pb-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">📋 Lista Mestre de Colaboradores</h3>
              <button onClick={() => setShowImportColabs(true)} className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">Importar em Lote</button>
            </div>
            <div className="flex gap-3">
              <input type="text" placeholder="Nome do colaborador..." className="flex-1 p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" value={newColab} onChange={e => setNewColab(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setNewColab(''), setData(p => ({...p, colaboradoresMestre: [...ensureArray(p.colaboradoresMestre), newColab]})))} />
              <button onClick={() => { if(newColab) { setData(p => ({...p, colaboradoresMestre: [...ensureArray(p.colaboradoresMestre), newColab]})); setNewColab(''); } }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Adicionar</button>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 pr-2">
              {ensureArray(data.colaboradoresMestre).map((c, idx) => (
                <div key={idx} className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm hover:border-emerald-200 transition-all">
                   {editingColabIdx === idx ? (
                    <input autoFocus className="bg-transparent font-bold text-[11px] outline-none" value={editingColabValue} onChange={e => setEditingColabValue(e.target.value)} onBlur={() => { setData(p => ({...p, colaboradoresMestre: p.colaboradoresMestre.map((v, i) => i === idx ? editingColabValue : v)})); setEditingColabIdx(null); }} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()} />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-700" onClick={() => { setEditingColabIdx(idx); setEditingColabValue(c); }}>{c}</span>
                  )}
                  <button onClick={() => setData(p => ({...p, colaboradoresMestre: ensureArray(p.colaboradoresMestre).filter((_, i) => i !== idx)}))} className="text-red-300 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Customização Visual */}
          <section className="bg-white p-10 rounded-[2.5rem] border shadow-xl space-y-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 border-b pb-6">🎨 Identidade Visual e Textos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logotipo do App (Navbar/Login)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {data.logoCustom ? <img src={data.logoCustom} className="w-full h-full object-contain" /> : <span className="text-2xl opacity-20">🖼️</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'logoCustom')} className="text-[10px] text-slate-500 font-bold" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logotipo dos Relatórios (PDF)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {data.reportLogoCustom ? <img src={data.reportLogoCustom} className="w-full h-full object-contain" /> : <span className="text-2xl opacity-20">📊</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'reportLogoCustom')} className="text-[10px] text-slate-500 font-bold" />
                </div>
              </div>
            </div>
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Título de Boas-vindas</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm" value={data.welcomeTitle || ''} onChange={e => setData(p => ({...p, welcomeTitle: e.target.value}))} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Subtítulo do Dashboard</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm" value={data.welcomeSubtitle || ''} onChange={e => setData(p => ({...p, welcomeSubtitle: e.target.value}))} />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Cabeçalho dos Relatórios (PDF)</label>
                 <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm" value={data.reportHeaderText || ''} onChange={e => setData(p => ({...p, reportHeaderText: e.target.value}))} />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modal de Importação em Lote */}
      {showImportColabs && (
        <div className="fixed inset-0 z-[400] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-fadeIn">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 mb-2">Importar Colaboradores</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-8 leading-relaxed">Cole uma lista de nomes (um por linha) para adicionar à lista mestre.</p>
            <textarea className="w-full h-60 bg-slate-50 border rounded-2xl p-6 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-6" placeholder="Ex:&#10;João Silva&#10;Maria Oliveira&#10;José Santos..." value={importText} onChange={e => setImportText(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => {
                const names = importText.split('\n').map(n => n.trim()).filter(n => n.length > 2);
                setData(p => ({...p, colaboradoresMestre: Array.from(new Set([...ensureArray(p.colaboradoresMestre), ...names]))}));
                setImportText('');
                setShowImportColabs(false);
                showToast(`${names.length} nomes importados!`);
              }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700">Concluir Importação</button>
              <button onClick={() => setShowImportColabs(false)} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Roteamento de Abas padrão */}
      {activeTab === 'estudos' && <EstudoBiblicoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => { setData(p => ({ ...p, estudosBiblicos: [...ensureArray(p.estudosBiblicos), v] })); setActiveTab('dashboard'); }} />}
      {activeTab === 'classes' && <ClasseBiblicaForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => { setData(p => ({ ...p, classesBiblicas: [...ensureArray(p.classesBiblicas), v] })); setActiveTab('dashboard'); }} />}
      {activeTab === 'pgs' && <PequenoGrupoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => { setData(p => ({ ...p, pequenosGrupos: [...ensureArray(p.pequenosGrupos), v] })); setActiveTab('dashboard'); }} />}
      {activeTab === 'visitas' && <VisitaColaboradorForm capelao={loggedInUser.nome} setores={data.setores} colaboradoresMestre={data.colaboradoresMestre || []} onSave={(v) => { setData(p => ({ ...p, visitasColaboradores: [...ensureArray(p.visitasColaboradores), v] })); setActiveTab('dashboard'); }} onAddMasterColab={(n) => setData(p => ({ ...p, colaboradoresMestre: [...ensureArray(p.colaboradoresMestre), n] }))} />}
      {activeTab === 'relatorios' && <Reports data={data} currentUser={loggedInUser} />}
      {activeTab === 'historico' && <History data={data} currentUser={loggedInUser} onUpdateItem={(c, i) => setData(p => ({ ...p, [c]: ensureArray(p[c]).map((x: any) => x.id === i.id ? i : x) }))} onDeleteItem={(c, id) => setData(p => ({ ...p, [c]: ensureArray(p[c]).filter((x: any) => x.id !== id) }))} onRequestChange={(r) => setData(p => ({ ...p, solicitacoes: [...ensureArray(p.solicitacoes), r] }))} onAddMasterColab={(n) => setData(p => ({ ...p, colaboradoresMestre: [...ensureArray(p.colaboradoresMestre), n] }))} />}
      {activeTab === 'aprovacoes' && <Approvals solicitacoes={data.solicitacoes} onProcess={(id, app) => {
        const req = data.solicitacoes.find(s => s.id === id);
        if (app && req) setData(prev => ({ ...prev, [req.categoria]: req.tipo === 'edicao' ? ensureArray(prev[req.categoria]).map((i: any) => i.id === req.idRegistro ? req.dadosNovos : i) : ensureArray(prev[req.categoria]).filter((i: any) => i.id !== req.idRegistro) }));
        setData(p => ({ ...p, solicitacoes: p.solicitacoes.filter(s => s.id !== id) }));
      }} />}
      {activeTab === 'perfil' && <PerfilForm user={loggedInUser} onUpdate={(u) => { setLoggedInUser(prev => prev ? { ...prev, ...u } : null); setData(p => ({ ...p, usuarios: ensureArray(p.usuarios).map(x => x.id === loggedInUser.id ? { ...x, ...u } : x) })); }} />}
    </Layout>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
    <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-xl`}>{icon}</div>
    <div><h4 className="text-2xl font-black text-slate-800 leading-none">{value}</h4><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p></div>
  </div>
);

export default App;
