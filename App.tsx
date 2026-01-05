
import React, { useState, useEffect, useRef } from 'react';
import { AppData, Usuario, SyncConfig } from './types';
import { storageService } from './services/storageService';
import Layout from './components/Layout';
import Logo from './components/Logo';
import { EstudoBiblicoForm, ClasseBiblicaForm, PequenoGrupoForm, VisitaColaboradorForm } from './components/Forms';
import Reports from './components/Reports';

// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getDatabase, ref, onValue, set, off } from 'firebase/database';

const App: React.FC = () => {
  // Carrega dados do LocalStorage imediatamente
  const [data, setData] = useState<AppData>(storageService.getData());
  const [loggedInUser, setLoggedInUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const firebaseAppRef = useRef<any>(null);
  const syncConfig = storageService.getSyncConfig();
  const skipSyncRef = useRef(false);

  // Estados dos formulários de Admin
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authNome, setAuthNome] = useState("");
  const [firebaseInput, setFirebaseInput] = useState(syncConfig ? JSON.stringify(syncConfig, null, 2) : "");

  // Inicialização do Firebase (Opcional)
  useEffect(() => {
    if (syncConfig?.enabled && syncConfig.databaseURL) {
      try {
        if (!firebaseAppRef.current) {
          firebaseAppRef.current = initializeApp(syncConfig);
        }
        const db = getDatabase(firebaseAppRef.current);
        const dataRef = ref(db, 'appData');

        // Monitorar conexão
        const connectedRef = ref(db, '.info/connected');
        onValue(connectedRef, (snap) => {
          setIsOnline(snap.val() === true);
        });

        // Escutar alterações na nuvem
        onValue(dataRef, (snapshot: any) => {
          const cloudData = snapshot.val();
          if (cloudData) {
            console.log("Firebase: Dados sincronizados da nuvem");
            skipSyncRef.current = true;
            setData(prev => ({
              ...cloudData,
              syncConfig: prev.syncConfig // Mantém config local
            }));
            setTimeout(() => { skipSyncRef.current = false; }, 1000);
          }
        });

        return () => off(dataRef);
      } catch (error) {
        console.error("Falha ao inicializar Firebase:", error);
        setIsOnline(false);
      }
    }
  }, []);

  // Sincronização Local e Upload para Nuvem
  useEffect(() => {
    storageService.saveData(data);
    
    if (syncConfig?.enabled && isOnline && !skipSyncRef.current) {
      const syncToCloud = async () => {
        setIsSyncing(true);
        try {
          const db = getDatabase(firebaseAppRef.current);
          const { syncConfig: _, ...dataToUpload } = data; 
          await set(ref(db, 'appData'), dataToUpload);
        } catch (e) {
          console.error("Erro no upload:", e);
        } finally {
          setIsSyncing(false);
        }
      };
      
      const timeoutId = setTimeout(syncToCloud, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [data, isOnline]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.usuarios.find(u => u.email.toLowerCase() === authEmail.toLowerCase() && u.senha === authSenha);
    if (user) {
      setLoggedInUser(user);
      setActiveTab('dashboard');
    } else {
      alert("E-mail ou senha incorretos.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.usuarios.some(u => u.email.toLowerCase() === authEmail.toLowerCase())) {
      alert("E-mail já cadastrado.");
      return;
    }
    const novo: Usuario = {
      id: crypto.randomUUID(),
      nome: authNome,
      email: authEmail,
      senha: authSenha,
      isAdmin: authEmail.toLowerCase() === 'pastorescopel@gmail.com'
    };
    setData(prev => ({ ...prev, usuarios: [...prev.usuarios, novo] }));
    alert("Conta criada! Faça login.");
    setIsRegistering(false);
  };

  const handleSave = (key: keyof AppData, newItem: any) => {
    setData(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), newItem]
    }));
  };

  const handleSaveSyncConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let rawInput = firebaseInput.trim();
      
      // Limpeza de código extra se o usuário colar o snippet do SDK
      if (rawInput.includes('{') && rawInput.includes('}')) {
        rawInput = rawInput.substring(rawInput.indexOf('{'), rawInput.lastIndexOf('}') + 1);
      }

      // Converte formato JS para JSON válido (chaves e valores com aspas duplas)
      const validJson = rawInput
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // aspas nas chaves
        .replace(/'/g, '"') // troca aspas simples
        .replace(/,\s*}/g, '}'); // remove vírgula final

      const config = JSON.parse(validJson);
      storageService.saveSyncConfig({ ...config, enabled: true });
      alert("Configuração salva! O sistema irá reiniciar para conectar.");
      window.location.reload();
    } catch (e) {
      alert("Erro ao processar as credenciais. Verifique se o formato está correto.");
    }
  };

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <Logo size="xl" className="mx-auto mb-6" src={data.logoCustom} />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Capelania HAB</h1>
            <p className="text-slate-500 text-sm mt-1">{isRegistering ? 'Cadastro de Capelão' : 'Hospitalar & Atendimento Pastoral'}</p>
          </div>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome" value={authNome} onChange={e => setAuthNome(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">E-mail</label>
              <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="capelao@exemplo.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Senha</label>
              <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={authSenha} onChange={e => setAuthSenha(e.target.value)} required />
            </div>
            <button className="w-full bg-[#005a9c] text-white py-4 rounded-xl font-bold hover:bg-[#004a7c] shadow-lg transition-all active:scale-95">
              {isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}
            </button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-4 text-[#005a9c] text-sm font-bold hover:underline">
            {isRegistering ? 'Voltar para Login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={loggedInUser} 
      onLogout={() => setLoggedInUser(null)} 
      logoSrc={data.logoCustom}
      isSyncing={isSyncing}
      isOnline={isOnline}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-[#005a9c] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-4xl font-black mb-4 tracking-tight uppercase">Paz seja convosco!</h2>
               <p className="opacity-80 max-w-xl text-lg leading-relaxed">Seus registros são salvos localmente e sincronizados quando houver internet.</p>
             </div>
             <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Estudos Bíblicos" value={data.estudosBiblicos.length} icon="📖" color="bg-blue-500" />
            <StatCard title="Classes Bíblicas" value={data.classesBiblicas.length} icon="🏫" color="bg-emerald-500" />
            <StatCard title="Pequenos Grupos" value={data.pequenosGrupos.length} icon="👥" color="bg-amber-500" />
            <StatCard title="Colaboradores" value={data.visitasColaboradores.length} icon="🏥" color="bg-rose-500" />
          </div>
        </div>
      )}

      {activeTab === 'estudos' && <EstudoBiblicoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => handleSave('estudosBiblicos', v)} />}
      {activeTab === 'classes' && <ClasseBiblicaForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => handleSave('classesBiblicas', v)} />}
      {activeTab === 'pgs' && <PequenoGrupoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(v) => handleSave('pequenosGrupos', v)} />}
      {activeTab === 'visitas' && <VisitaColaboradorForm capelao={loggedInUser.nome} setores={data.setores} colaboradoresMestre={data.colaboradoresMestre} onSave={(v) => handleSave('visitasColaboradores', v)} />}
      {activeTab === 'relatorios' && <Reports data={data} />}
      
      {activeTab === 'admin' && (
        <div className="space-y-8 pb-20">
          <section className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-[#005a9c]">🌐 Configuração Cloud</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Cole aqui as credenciais do seu projeto Firebase para ativar a sincronização.</p>
                <div className={`p-4 rounded-xl border ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                   <span className="text-xs font-black uppercase text-slate-400 block mb-1">Status</span>
                   <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                     <span className={`font-bold text-sm ${isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                       {isOnline ? 'Conectado à Nuvem' : 'Modo Offline (Salvo local)'}
                     </span>
                   </div>
                </div>
              </div>
              <form onSubmit={handleSaveSyncConfig} className="space-y-3">
                <textarea 
                  className="w-full p-3 bg-slate-50 border rounded-xl text-[10px] font-mono h-40 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{ "apiKey": "...", "databaseURL": "...", ... }'
                  value={firebaseInput}
                  onChange={e => setFirebaseInput(e.target.value)}
                />
                <button className="w-full bg-[#005a9c] text-white py-3 rounded-xl font-bold text-sm">Salvar e Conectar</button>
              </form>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="font-bold text-lg mb-4">👤 Capelães</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {data.usuarios.map(u => (
                  <div key={u.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 block text-sm">{u.nome}</span>
                      <span className="text-slate-400 text-xs">{u.email}</span>
                    </div>
                    {u.email !== 'pastorescopel@gmail.com' && (
                      <button 
                        onClick={() => setData(prev => ({ ...prev, usuarios: prev.usuarios.filter(x => x.id !== u.id) }))} 
                        className="text-red-500 text-xs font-bold"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
            
            <section className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-4">
              <h3 className="font-bold text-lg w-full text-left">🖼️ Logotipo</h3>
              <Logo size="lg" src={data.logoCustom} />
              <input type="file" id="up-logo" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setData(prev => ({ ...prev, logoCustom: reader.result as string }));
                  reader.readAsDataURL(file);
                }
              }} />
              <label htmlFor="up-logo" className="w-full text-center bg-[#005a9c] text-white py-2 rounded-xl font-bold text-xs cursor-pointer">Trocar Logo</label>
            </section>
          </div>
        </div>
      )}
    </Layout>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
    <span className={`w-16 h-16 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-3xl shadow-inner`}>{icon}</span>
    <div>
      <h4 className="text-3xl font-black text-slate-800 leading-none mb-1">{value}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

export default App;
