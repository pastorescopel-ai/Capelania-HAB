
import { AppData, Usuario } from '../types';
import { SETORES_PADRAO } from '../constants';

const STORAGE_KEY = 'capelania_app_data_v2';

export const storageService = {
  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Usuário administrador mestre solicitado
      const adminMestre: Usuario = {
        id: crypto.randomUUID(),
        nome: 'Administrador Geral',
        email: 'pastorescopel@gmail.com',
        senha: 'admin', // Senha inicial
        isAdmin: true
      };

      return {
        estudosBiblicos: [],
        classesBiblicas: [],
        pequenosGrupos: [],
        visitasColaboradores: [],
        usuarios: [adminMestre],
        setores: SETORES_PADRAO,
        colaboradoresMestre: [],
      };
    }
    return JSON.parse(data);
  }
};
