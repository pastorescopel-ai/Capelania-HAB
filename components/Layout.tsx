
import React from 'react';
import { Usuario } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Usuario;
  onLogout: () => void;
  logoSrc?: string;
  isSyncing?: boolean;
  isOnline?: boolean;
  pendingApprovalsCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout,
  logoSrc,
  isSyncing,
  isOnline,
  pendingApprovalsCount = 0
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: '🏠', roles: ['user', 'admin'] },
    { id: 'estudos', label: 'Estudos Bíblicos', icon: '📖', roles: ['user', 'admin'] },
    { id: 'classes', label: 'Classes Bíblicas', icon: '🏫', roles: ['user', 'admin'] },
    { id: 'pgs', label: 'Pequenos Grupos', icon: '👥', roles: ['user', 'admin'] },
    { id: 'visitas', label: 'Colaboradores', icon: '🏥', roles: ['user', 'admin'] },
    { id: 'historico', label: 'Meu Histórico', icon: '📜', roles: ['user', 'admin'] },
    { id: 'relatorios', label: 'Relatórios', icon: '📊', roles: ['admin'] },
    { id: 'aprovacoes', label: 'Aprovações', icon: '⚖️', roles: ['admin'], count: pendingApprovalsCount },
    { id: 'perfil', label: 'Meu Perfil', icon: '👤', roles: ['user', 'admin'] },
    { id: 'admin', label: 'Administração', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredTabs = tabs.filter(tab => {
    if (tab.roles.length === 1 && tab.roles.includes('admin') && !currentUser.isAdmin) return false;
    if (tab.roles.includes('user')) return true;
    if (tab.roles.includes('admin') && currentUser.isAdmin) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-[#002d54] text-white flex flex-col shadow-xl shrink-0 z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Logo size="sm" src={logoSrc} />
          <h1 className="text-xl font-bold text-white tracking-tight uppercase text-[10px]">Capelania HAB</h1>
        </div>

        <div className="p-4 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 overflow-hidden transition-all ${currentUser.isAdmin ? 'border-amber-400' : 'border-blue-400'}`}>
              {currentUser.fotoPerfil ? (
                <img src={currentUser.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${currentUser.isAdmin ? 'bg-amber-500' : 'bg-[#005a9c]'}`}>
                  {currentUser.nome[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate leading-none mb-1">{currentUser.nome}</p>
              <p className="text-[9px] text-blue-200 truncate uppercase font-black tracking-widest">{currentUser.isAdmin ? 'Administrador' : 'Capelão'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-all relative ${
                activeTab === tab.id 
                  ? 'bg-[#005a9c] text-white border-r-4 border-white shadow-md' 
                  : 'text-blue-100 hover:bg-white/5'
              }`}
            >
              <span className="text-lg opacity-80">{tab.icon}</span>
              <span className="font-bold text-xs tracking-wide uppercase">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute right-4 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-sm">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full py-3 text-[10px] font-black text-white bg-red-600/20 hover:bg-red-600 rounded-xl transition-all border border-red-500/30 uppercase tracking-widest">
            Sair do Sistema
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-4">
            {isSyncing && (
              <span className="text-[9px] font-black text-blue-500 animate-pulse bg-blue-50 px-3 py-1 rounded-full uppercase">Sincronizando...</span>
            )}
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 border transition-colors ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span className={`text-[9px] font-black uppercase ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`}>
                {isOnline ? 'Nuvem Ativa' : 'Modo Offline'}
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
