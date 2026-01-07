
import { AppData, Usuario } from '../types';
import { SETORES_PADRAO, NATIVE_LOGO_APP, NATIVE_LOGO_REPORT } from '../constants';

const APP_DATA_KEY = 'capelania_app_data';

// URL Padrão caso o usuário não tenha uma
const DEFAULT_DB_URL: string = "https://script.google.com/macros/s/AKfycbyN_AiK6bpu-AOWsZq0NHD_yX-S6uEJTcIgH44WISwR0ZTpZkPIAsxE1Iu4T14gj0asfg/exec"; 

export const storageService = {
  getInitialData: (): AppData => {
    return {
      estudosBiblicos: [],
      classesBiblicas: [],
      pequenosGrupos: [],
      visitasColaboradores: [],
      solicitacoes: [],
      usuarios: [
        {
          id: 'admin-mestre',
          nome: 'Administrador Geral',
          email: 'pastorescopel@gmail.com',
          senha: 'admin',
          isAdmin: true
        }
      ],
      setores: SETORES_PADRAO,
      colaboradoresMestre: [],
      logs: [],
      logoCustom: NATIVE_LOGO_APP,
      reportLogoCustom: NATIVE_LOGO_REPORT,
      reportHeaderText: 'Relatório de Atividades de Capelania',
      welcomeGreeting: 'Bem-vindo',
      welcomeTitle: 'Paz seja convosco!',
      welcomeSubtitle: 'Gestão de Atividades de Capelania',
      syncConfig: {
        provider: 'googlesheets',
        googleSheetsUrl: DEFAULT_DB_URL,
        enabled: true
      }
    };
  },

  saveData: (data: AppData) => {
    try {
      localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar dados localmente:", e);
    }
  },

  getData: (): AppData => {
    const saved = localStorage.getItem(APP_DATA_KEY);
    const initial = storageService.getInitialData();
    
    if (!saved) return initial;
    
    try {
      const parsed = JSON.parse(saved);
      return {
        ...initial,
        ...parsed,
        // Garante que os logotipos nativos permaneçam se não houver customização válida
        logoCustom: parsed.logoCustom || NATIVE_LOGO_APP,
        reportLogoCustom: parsed.reportLogoCustom || NATIVE_LOGO_REPORT,
        usuarios: Array.isArray(parsed.usuarios) && parsed.usuarios.length > 0 ? parsed.usuarios : initial.usuarios,
        setores: Array.isArray(parsed.setores) && parsed.setores.length > 0 ? parsed.setores : initial.setores
      };
    } catch (e) {
      return initial;
    }
  }
};
