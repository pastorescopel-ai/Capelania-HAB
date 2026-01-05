
import { AppData, Usuario, SyncConfig } from '../types';
import { SETORES_PADRAO } from '../constants';

const APP_DATA_KEY = 'capelania_app_data';
const SYNC_CONFIG_KEY = 'capelania_sync_config';

export const storageService = {
  saveSyncConfig: (config: SyncConfig | null) => {
    if (!config) localStorage.removeItem(SYNC_CONFIG_KEY);
    else localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  },

  getSyncConfig: (): SyncConfig | null => {
    const config = localStorage.getItem(SYNC_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  },

  getInitialData: (): AppData => {
    return {
      estudosBiblicos: [],
      classesBiblicas: [],
      pequenosGrupos: [],
      visitasColaboradores: [],
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
    };
  },

  saveData: (data: AppData) => {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  },

  getData: (): AppData => {
    const saved = localStorage.getItem(APP_DATA_KEY);
    if (!saved) return storageService.getInitialData();
    try {
      return JSON.parse(saved);
    } catch (e) {
      return storageService.getInitialData();
    }
  }
};
