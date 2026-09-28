// Estado do app (sem backend ainda), salvo no aparelho com AsyncStorage (localStorage na web).
// Onboarding e telas escrevem; as outras leem com useApp(). Quando o Firebase entrar, este arquivo vira a ponte para ele.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { SubjectId } from '@/components/icons';
import { mockUser } from './mock';

export type Prova = {
  materia: string;
  icone: SubjectId;
  topico: string;
  data: Date;
  minutosDia: number;
  /** Formatos de estudo escolhidos na Nova prova (ids de src/data/formatos.ts). */
  formatos: string[];
};

type AppState = {
  onboarded: boolean;
  prova: Prova;
  xp: number;
  premium: boolean;
  turma: string;
  turmas: string[];
  nome: string;
  lembrete: boolean;
  sons: boolean;
};

const TOPICOS: Record<string, string> = {
  Matemática: 'Funções do 1º grau',
  Português: 'Interpretação de texto',
  História: 'Revolução Francesa',
  Geografia: 'Clima e vegetação',
  Biologia: 'Citologia',
  Química: 'Tabela periódica',
  Física: 'Cinemática',
  Inglês: 'Simple past',
};

export const topicoDe = (materia: string) => TOPICOS[materia] ?? 'Conteúdo da prova';

export const hoje = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const diasAte = (d: Date) => Math.round((d.getTime() - hoje().getTime()) / (24 * 60 * 60 * 1000));

const inicial = (): AppState => ({
  onboarded: false,
  // Padrão igual ao design: Matemática, daqui a 3 dias.
  prova: {
    materia: 'Matemática',
    icone: 'matematica',
    topico: topicoDe('Matemática'),
    data: new Date(hoje().getTime() + 3 * 86400000),
    minutosDia: 10,
    formatos: ['resumo', 'quiz'],
  },
  xp: mockUser.xp,
  premium: false,
  turma: '2º B · Matemática',
  turmas: ['2º B · Matemática', '2º B · Português', 'Estudos ENEM'],
  nome: mockUser.nome,
  lembrete: true,
  sons: true,
});

let state: AppState = inicial();

const KEY = 'fera:estado:v1';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

export const app = {
  get: () => state,
  /** Carrega o que foi salvo no aparelho (chamado uma vez, antes de esconder o splash). */
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as AppState;
      const base = inicial();
      state = { ...base, ...saved, prova: { ...base.prova, ...saved.prova, data: new Date(saved.prova.data) } };
      emit();
    } catch {
      // Salvo corrompido ou indisponível: segue com o padrão.
    }
  },
  /** Volta tudo ao começo (Sair da conta). */
  reset: () => {
    state = inicial();
    emit();
    AsyncStorage.removeItem(KEY).catch(() => {});
  },
  setOnboarded: () => set({ onboarded: true }),
  setProva: (p: Partial<Prova>) => set({ prova: { ...state.prova, ...p } }),
  addXp: (n: number) => set({ xp: state.xp + n }),
  setPremium: (premium: boolean) => set({ premium }),
  setTurma: (turma: string) => set({ turma }),
  entrarNaTurma: (turma: string) => set({ turma, turmas: state.turmas.includes(turma) ? state.turmas : [...state.turmas, turma] }),
  setNome: (nome: string) => set({ nome }),
  setLembrete: (lembrete: boolean) => set({ lembrete }),
  setSons: (sons: boolean) => set({ sons }),
};

export function useApp() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}
