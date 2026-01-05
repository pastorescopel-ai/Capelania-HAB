
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
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentUser,
  onLogout,
  logoSrc
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
          <h1 className="text-xl font-bold text-white tracking-tight">
            Capelania HABb
          </h1>
        </div>

        <div className="p-4 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner border-2 ${currentUser.isAdmin ? 'bg-amber-500 border-amber-300' : 'bg-[#005a9c] border-blue-400'}`}>
              {currentUser.nome[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{currentUser.nome}</p>
              <p className="text-[10px] text-blue-200 truncate uppercase font-medium">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#005a9c] text-white border-r-4 border-white' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-bold text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20"
          >
            Sair do Sistema
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
