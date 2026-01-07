
import { AppData, Usuario, SyncConfig } from '../types';
import { SETORES_PADRAO, NATIVE_LOGO_APP, NATIVE_LOGO_REPORT } from '../constants';

const APP_DATA_KEY = 'capelania_app_data';

const NATIVE_DB_URL: string = "https://script.google.com/macros/s/AKfycbyN_AiK6bpu-AOWsZq0NHD_yX-S6uEJTcIgH44WISwR0ZTpZkPIAsxE1Iu4T14gj0asfg/exec"; 

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
      welcomeSubtitle: 'Resumo das atividades de capelania.',
      syncConfig: {
        provider: 'googlesheets',
        googleSheetsUrl: NATIVE_DB_URL,
        enabled: NATIVE_DB_URL !== ""
      }
    };
  },

  saveData: (data: AppData) => {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
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
        // Garante que os logotipos nativos sejam usados se os customizados não existirem
        logoCustom: parsed.logoCustom || NATIVE_LOGO_APP,
        reportLogoCustom: parsed.reportLogoCustom || NATIVE_LOGO_REPORT,
        syncConfig: {
          ...parsed.syncConfig,
          googleSheetsUrl: parsed.syncConfig?.googleSheetsUrl || NATIVE_DB_URL,
          enabled: (parsed.syncConfig?.googleSheetsUrl || NATIVE_DB_URL) !== ""
        },
        logs: Array.isArray(parsed.logs) ? parsed.logs : []
      };
    } catch (e) {
      return initial;
    }
  }
};
