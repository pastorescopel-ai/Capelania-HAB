
export type StatusEstudo = 'Novo estudo' | 'Continuando estudo' | 'Terminou estudo';
export type Turno = 'Manhã' | 'Tarde' | 'Noite';
export type MotivoVisita = 'Agendado' | 'A pedido' | 'Acompanhamento' | 'Solicitação' | 'Crise pessoal ou espiritual' | 'Retorno pastoral' | 'Outros';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  isAdmin: boolean;
}

export interface EstudoBiblico {
  id: string;
  capelao: string;
  ano: number;
  mes: string;
  setor: string;
  nomeEstudante: string;
  telefone: string;
  status: StatusEstudo;
  observacoes: string;
}

export interface ClasseBiblica {
  id: string;
  capelao: string;
  ano: number;
  mes: string;
  setor: string;
  participantes: string[];
  observacoes: string;
}

export interface PequenoGrupo {
  id: string;
  capelao: string;
  ano: number;
  mes: string;
  setor: string;
  nomePG: string;
  turno: Turno;
  liderPG: string;
  quantidadeParticipantes: number;
}

export interface VisitaColaborador {
  id: string;
  capelao: string;
  ano: number;
  mes: string;
  setor: string;
  nomeColaborador: string;
  dataAtendimento: string;
  motivo: MotivoVisita;
  necessitaRetorno: boolean;
  observacoes: string;
}

export interface SyncConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enabled: boolean;
}

export interface AppData {
  estudosBiblicos: EstudoBiblico[];
  classesBiblicas: ClasseBiblica[];
  pequenosGrupos: PequenoGrupo[];
  visitasColaboradores: VisitaColaborador[];
  usuarios: Usuario[];
  setores: string[];
  colaboradoresMestre: string[];
  logoCustom?: string;
  syncConfig?: SyncConfig;
}
