
import React, { useState, useEffect } from 'react';
import { AppData, Usuario } from './types';
import { storageService } from './services/storageService';
import Layout from './components/Layout';
import Logo from './components/Logo';
import { EstudoBiblicoForm, ClasseBiblicaForm, PequenoGrupoForm, VisitaColaboradorForm } from './components/Forms';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(storageService.getData());
  const [loggedInUser, setLoggedInUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authNome, setAuthNome] = useState("");

  const [novoUsuarioNome, setNovoUsuarioNome] = useState("");
  const [novoUsuarioEmail, setNovoUsuarioEmail] = useState("");
  const [novoUsuarioSenha, setNovoUsuarioSenha] = useState("");
  const [novoUsuarioIsAdmin, setNovoUsuarioIsAdmin] = useState(false);

  useEffect(() => {
    storageService.saveData(data);
  }, [data]);

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
      alert("Este e-mail já está cadastrado.");
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
    alert("Conta criada com sucesso! Faça login para continuar.");
    setIsRegistering(false);
    setAuthSenha("");
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setAuthEmail("");
    setAuthSenha("");
    setAuthNome("");
  };

  const handleSave = (key: keyof AppData, newItem: any) => {
    setData(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), newItem]
    }));
    alert('Salvo com sucesso!');
  };

  const handleAdicionarUsuarioAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioEmail || !novoUsuarioSenha) return;
    
    if (data.usuarios.some(u => u.email.toLowerCase() === novoUsuarioEmail.toLowerCase())) {
      alert("E-mail já cadastrado.");
      return;
    }

    const novo: Usuario = {
      id: crypto.randomUUID(),
      nome: novoUsuarioNome,
      email: novoUsuarioEmail,
      senha: novoUsuarioSenha,
      isAdmin: novoUsuarioIsAdmin
    };

    setData(prev => ({ ...prev, usuarios: [...prev.usuarios, novo] }));
    setNovoUsuarioNome("");
    setNovoUsuarioEmail("");
    setNovoUsuarioSenha("");
    setNovoUsuarioIsAdmin(false);
    alert("Usuário adicionado com sucesso!");
  };

  const handleRemoverUsuario = (id: string) => {
    const userToRemove = data.usuarios.find(u => u.id === id);
    if (userToRemove?.email === 'pastorescopel@gmail.com') {
      alert("O administrador mestre não pode ser removido.");
      return;
    }
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      setData(prev => ({ ...prev, usuarios: prev.usuarios.filter(u => u.id !== id) }));
    }
  };

  const handleAlternarAdmin = (id: string) => {
    setData(prev => ({
      ...prev,
      usuarios: prev.usuarios.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u)
    }));
  };

  const parseFileToNames = (content: string): string[] => {
    return content.split(/[\n\r,;]+/).map(n => n.trim()).filter(n => n.length > 0);
  };

  const handleCollaboratorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const names = parseFileToNames(event.target?.result as string);
      setData(prev => ({ ...prev, colaboradoresMestre: Array.from(new Set([...prev.colaboradoresMestre, ...names])) }));
      alert(`${names.length} colaboradores importados.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSectorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const sectors = parseFileToNames(event.target?.result as string);
      setData(prev => ({ ...prev, setores: Array.from(new Set([...prev.setores, ...sectors])) }));
      alert(`${sectors.length} setores importados.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setData(prev => ({ ...prev, logoCustom: base64 }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    if (confirm("Deseja remover o logo personalizado e voltar ao padrão?")) {
      setData(prev => ({ ...prev, logoCustom: undefined }));
    }
  };

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <Logo size="xl" className="mx-auto mb-6" src={data.logoCustom} />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Capelania HABb</h1>
            <p className="text-slate-500 text-sm mt-1">{isRegistering ? 'Crie sua conta de Capelão' : 'Hospitalar & Atendimento Pastoral'}</p>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Seu nome"
                  value={authNome}
                  onChange={e => setAuthNome(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">E-mail do Capelão</label>
              <input 
                type="email" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                placeholder="capelao@exemplo.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Senha</label>
              <input 
                type="password" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={authSenha}
                onChange={e => setAuthSenha(e.target.value)}
                required
              />
            </div>
            <button className="w-full bg-[#005a9c] text-white py-4 rounded-xl font-bold hover:bg-[#004a7c] shadow-xl shadow-blue-100 transition-all active:scale-95">
              {isRegistering ? 'Cadastrar Agora' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[#005a9c] text-sm font-bold hover:underline"
            >
              {isRegistering ? 'Já tenho uma conta. Entrar' : 'Não tem conta? Cadastre-se como Capelão'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderAdmin = () => (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600">👤</span>
            Usuários Cadastrados
          </h3>
          
          <form onSubmit={handleAdicionarUsuarioAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nome</label>
              <input type="text" className="w-full p-2 border rounded-lg text-sm" value={novoUsuarioNome} onChange={e => setNovoUsuarioNome(e.target.value)} placeholder="Nome do Capelão" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">E-mail (Login)</label>
              <input type="email" className="w-full p-2 border rounded-lg text-sm" value={novoUsuarioEmail} onChange={e => setNovoUsuarioEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Senha</label>
              <input type="password" className="w-full p-2 border rounded-lg text-sm" value={novoUsuarioSenha} onChange={e => setNovoUsuarioSenha(e.target.value)} placeholder="Senha" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="check-admin" checked={novoUsuarioIsAdmin} onChange={e => setNovoUsuarioIsAdmin(e.target.checked)} />
              <label htmlFor="check-admin" className="text-xs font-bold text-slate-600">Administrador</label>
            </div>
            <button className="md:col-span-2 bg-[#005a9c] text-white py-2 rounded-lg font-bold text-sm">Adicionar Usuário</button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <div className="space-y-3">
              {data.usuarios.map(u => (
                <div key={u.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{u.nome}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${u.isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.isAdmin ? 'Admin' : 'Capelão'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAlternarAdmin(u.id)} className="text-[10px] font-bold text-blue-500 hover:underline">Alternar Cargo</button>
                    {u.email !== 'pastorescopel@gmail.com' && (
                      /* Fix: Corrected call to handleRemoverUsuario by passing u.id instead of undefined id */
                      <button onClick={() => handleRemoverUsuario(u.id)} className="p-2 text-red-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">🏢</span>
            Setores Hospitalares
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 max-h-[300px] overflow-y-auto">
            {data.setores.map((set, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg group">
                <span className="text-xs truncate font-medium text-slate-600">{set}</span>
                <button 
                  onClick={() => setData(prev => ({ ...prev, setores: prev.setores.filter((_, idx) => idx !== i) }))}
                  className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
                >Excluir</button>
              </div>
            ))}
          </div>
          <input type="file" id="up-set" accept=".txt,.csv" onChange={handleSectorUpload} className="hidden" />
          <label htmlFor="up-set" className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 cursor-pointer hover:bg-emerald-50 transition-all">
            Importar Lista de Setores
          </label>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-rose-50 rounded-lg text-rose-600">👥</span>
            Base de Colaboradores
          </h3>
          <div className="p-4 bg-rose-50 rounded-2xl mb-4 flex justify-between items-center">
            <div>
              <span className="block text-3xl font-black text-rose-700">{data.colaboradoresMestre.length}</span>
              <span className="text-[10px] font-bold text-rose-400 uppercase">Nomes Registrados</span>
            </div>
            <input type="file" id="up-colab" accept=".txt,.csv" onChange={handleCollaboratorUpload} className="hidden" />
            <label htmlFor="up-colab" className="bg-rose-600 text-white px-4 py-2 rounded-xl font-bold cursor-pointer text-xs shadow-lg shadow-rose-100">Upload</label>
          </div>
          <button onClick={() => { if(confirm("Deseja limpar todos os nomes?")) setData(prev => ({ ...prev, colaboradoresMestre: [] })) }} className="text-xs text-red-400 hover:underline">Limpar Base de Dados</button>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600">🖼️</span>
            Logo da Empresa
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <Logo size="lg" src={data.logoCustom} />
            </div>
            <div className="flex gap-2 w-full">
              <input type="file" id="up-logo" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <label htmlFor="up-logo" className="flex-1 text-center bg-[#005a9c] text-white py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-[#004a7c] transition-all shadow-md">
                Alterar Logo
              </label>
              {data.logoCustom && (
                <button onClick={handleRemoveLogo} className="flex-1 text-center bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs border border-red-100 hover:bg-red-100 transition-all">
                  Remover
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Recomendado: Imagem quadrada (1:1) com fundo transparente ou sólido.
            </p>
          </div>
        </section>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-[#005a9c] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-4xl font-black mb-4 tracking-tight">Paz seja convosco, {loggedInUser.nome}!</h2>
                 <p className="opacity-80 max-w-xl text-lg leading-relaxed">O sistema está pronto para seus registros. Selecione uma atividade no menu lateral para começar seu trabalho pastoral hoje.</p>
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
        );
      case 'estudos':
        return <div className="space-y-4">
          <h3 className="text-3xl font-black text-center text-slate-800 mb-10">Estudo Bíblico</h3>
          <EstudoBiblicoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(val) => handleSave('estudosBiblicos', val)} />
        </div>;
      case 'classes':
        return <div className="space-y-4">
          <h3 className="text-3xl font-black text-center text-slate-800 mb-10">Classe Bíblica</h3>
          <ClasseBiblicaForm capelao={loggedInUser.nome} setores={data.setores} onSave={(val) => handleSave('classesBiblicas', val)} />
        </div>;
      case 'pgs':
        return <div className="space-y-4">
          <h3 className="text-3xl font-black text-center text-slate-800 mb-10">Pequenos Grupos</h3>
          <PequenoGrupoForm capelao={loggedInUser.nome} setores={data.setores} onSave={(val) => handleSave('pequenosGrupos', val)} />
        </div>;
      case 'visitas':
        return <div className="space-y-4">
          <h3 className="text-3xl font-black text-center text-slate-800 mb-10">Visita a Colaboradores</h3>
          <VisitaColaboradorForm capelao={loggedInUser.nome} setores={data.setores} colaboradoresMestre={data.colaboradoresMestre} onSave={(val) => handleSave('visitasColaboradores', val)} />
        </div>;
      case 'relatorios':
        return loggedInUser.isAdmin ? <Reports data={data} /> : <div className="text-center p-20 text-slate-400">Acesso negado.</div>;
      case 'admin':
        return loggedInUser.isAdmin ? renderAdmin() : <div className="text-center p-20 text-slate-400">Acesso negado.</div>;
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={loggedInUser} onLogout={handleLogout} logoSrc={data.logoCustom}>
      {renderContent()}
    </Layout>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-all">
    <span className={`w-16 h-16 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-3xl shadow-inner`}>{icon}</span>
    <div>
      <h4 className="text-3xl font-black text-slate-800 leading-none mb-1">{value}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

export default App;
