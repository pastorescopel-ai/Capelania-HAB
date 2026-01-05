
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
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout,
  logoSrc,
  isSyncing,
  isOnline
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: '🏠', roles: ['user', 'admin'] },
    { id: 'estudos', label: 'Estudos Bíblicos', icon: '📖', roles: ['user', 'admin'] },
    { id: 'classes', label: 'Classes Bíblicas', icon: '🏫', roles: ['user', 'admin'] },
    { id: 'pgs', label: 'Pequenos Grupos', icon: '👥', roles: ['user', 'admin'] },
    { id: 'visitas', label: 'Colaboradores', icon: '🏥', roles: ['user', 'admin'] },
    { id: 'relatorios', label: 'Relatórios', icon: '📊', roles: ['admin'] },
    { id: 'admin', label: 'Administração', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredTabs = tabs.filter(tab => 
    tab.roles.includes('user') || (tab.roles.includes('admin') && currentUser.isAdmin)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-[#002d54] text-white flex flex-col shadow-xl shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Logo size="sm" src={logoSrc} />
          <h1 className="text-xl font-bold text-white tracking-tight uppercase text-xs">Capelania HAB</h1>
        </div>

        <div className="p-4 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner border-2 ${currentUser.isAdmin ? 'bg-amber-500 border-amber-300' : 'bg-[#005a9c] border-blue-400'}`}>
              {currentUser.nome[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{currentUser.nome}</p>
              <p className="text-[10px] text-blue-200 truncate uppercase font-black">{isOnline ? 'Online' : 'Local'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#005a9c] text-white border-r-4 border-white shadow-lg' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <span className="text-lg opacity-80">{tab.icon}</span>
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full p-3 text-xs font-black text-white bg-red-600/20 hover:bg-red-600 rounded-xl transition-colors border border-red-500/30">
            Sair
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-3">
            {isSyncing && (
              <span className="text-[10px] font-black text-blue-500 animate-pulse bg-blue-50 px-3 py-1 rounded-full">SINCRONIZANDO...</span>
            )}
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-2 ${isOnline ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              {isOnline ? 'CONECTADO À NUVEM' : 'MODO LOCAL'}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
