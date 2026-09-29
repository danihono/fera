// Estado do app, salvo no aparelho com AsyncStorage (localStorage na web) e espelhado no Firestore
// quando o Firebase está ligado (src/data/nuvem.ts). As telas leem com useApp() e escrevem pelo objeto app.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { SubjectId } from '@/components/icons';
import type { FormatoId } from '@/ia/tipos';

/** Prova sendo montada (onboarding e Nova prova). */
export type Rascunho = {
  materia: string;
  icone: SubjectId;
  topico: string;
  data: Date;
  minutosDia: number;
  /** Formatos de estudo escolhidos (ids de src/data/formatos.tsx). */
  formatos: FormatoId[];
};

export type ModoIA = 'demo' | 'gratis' | 'qualidade';

export type ProvaSalva = Rascunho & {
  id: string;
  modo: ModoIA;
  /** Quantas missões a trilha tem. */
  totalMissoes: number;
  /** Números das missões concluídas (1, 2, …). */
  feitas: number[];
  /** Dia (AAAA-MM-DD) em que cada missão foi concluída. */
  feitasEm: Record<string, string>;
  /** Erros por tópico (alimenta a revisão da véspera). */
  erros: Record<string, number>;
  /** Acertos por tópico (desempenho no detalhe da prova). */
  acertosTopico?: Record<string, number>;
  acertos: number;
  respondidas: number;
  criadaEm: string;
  /** Veio de uma prova compartilhada na turma ("FERA-72K/<id>"). */
  origem?: string;
};

export type TurmaRef = { codigo: string; nome: string };

export type FaixaEtaria = 'crianca' | 'adolescente' | 'adulto';

export type AppState = {
  onboarded: boolean;
  prova: Rascunho;
  provaAtual: string | null;
  provas: ProvaSalva[];
  xp: number;
  /** Sequência de dias estudando. */
  streak: number;
  recorde: number;
  /** Último dia com missão feita (AAAA-MM-DD). */
  ultimoDia: string | null;
  /** Sequência perdida já avisada (tela 09) — guarda o último dia daquela sequência. */
  quebraAvisada: string | null;
  premium: boolean;
  turma: TurmaRef | null;
  turmas: TurmaRef[];
  nome: string;
  /** Foto de perfil (JPEG 256 px em data URI) e a miniatura que vai pro ranking da turma (72 px). */
  foto: string | null;
  fotoMini: string | null;
  serie: string;
  lembrete: boolean;
  /** Horário do lembrete diário ("19:00"). */
  lembreteHora: string;
  /** Já perguntamos se pode mandar notificação (uma vez, depois da 1ª missão). */
  pediuNotificacao: boolean;
  sons: boolean;
  /** Estatísticas anônimas de uso (dá pra desligar nas Configurações). */
  metricas: boolean;
  /** Faixa de idade informada ao criar conta (crianca = até 11: conta do responsável). */
  faixaEtaria: FaixaEtaria | null;
  /** Conquistas que dependem de um momento (zero erros, madrugador, relâmpago, simulado, top 3). */
  marcos: string[];
  /** Última mudança (pra decidir entre aparelho e nuvem). */
  atualizadoEm: number;
};

export const SERIES = ['6º ano', '7º ano', '8º ano', '9º ano', '1º ano (EM)', '2º ano (EM)', '3º ano (EM)', 'Cursinho / ENEM', 'Faculdade'];

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

/** AAAA-MM-DD no fuso do aparelho. */
export const diaDe = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ontem = () => diaDe(new Date(hoje().getTime() - 86400000));

/** Sequência que vale hoje: se o último estudo foi antes de ontem, ela quebrou. */
export const streakAtual = (s: Pick<AppState, 'streak' | 'ultimoDia'>) => (s.ultimoDia === diaDe(hoje()) || s.ultimoDia === ontem() ? s.streak : 0);

/** A sequência quebrou e ainda não mostramos a tela 09? */
export const sequenciaQuebrada = (s: AppState) => s.streak > 0 && streakAtual(s) === 0 && s.quebraAvisada !== s.ultimoDia;

// Nível: 1000 XP cada.
export const XP_POR_NIVEL = 1000;
export const nivelDe = (xp: number) => {
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const titulo = nivel <= 2 ? 'Filhote de fera' : nivel <= 7 ? 'Fera em treino' : nivel <= 12 ? 'Fera de verdade' : 'Lenda da turma';
  return { nivel, noNivel: xp % XP_POR_NIVEL, titulo };
};

export const VIDAS = 5;

const inicial = (): AppState => ({
  onboarded: false,
  // Padrão igual ao design: Matemática, daqui a 3 dias.
  prova: {
    materia: 'Matemática',
    icone: 'matematica',
    topico: topicoDe('Matemática'),
    data: new Date(hoje().getTime() + 3 * 86400000),
    minutosDia: 10,
    formatos: ['resumo', 'explicacao'],
  },
  provaAtual: null,
  provas: [],
  xp: 0,
  streak: 0,
  recorde: 0,
  ultimoDia: null,
  quebraAvisada: null,
  premium: false,
  turma: null,
  turmas: [],
  nome: '',
  foto: null,
  fotoMini: null,
  serie: '2º ano (EM)',
  lembrete: true,
  lembreteHora: '19:00',
  pediuNotificacao: false,
  sons: true,
  metricas: true,
  faixaEtaria: null,
  marcos: [],
  atualizadoEm: 0,
});

let state: AppState = inicial();

const KEY = 'fera:estado:v2';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** JSON → estado (datas voltam a ser Date). */
export function lerEstado(saved: Partial<AppState>): AppState {
  const base = inicial();
  const prova = { ...base.prova, ...saved.prova } as Rascunho;
  return {
    ...base,
    ...saved,
    prova: { ...prova, data: new Date(prova.data) },
    provas: (saved.provas ?? []).map((p) => ({ ...p, feitasEm: p.feitasEm ?? {}, data: new Date(p.data) })),
  };
}

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch, atualizadoEm: Date.now() };
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

const atualizarProva = (id: string, f: (p: ProvaSalva) => ProvaSalva) => set({ provas: state.provas.map((p) => (p.id === id ? f(p) : p)) });

export const app = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Carrega o que foi salvo no aparelho (chamado uma vez, antes de esconder o splash). */
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return;
      state = lerEstado(JSON.parse(raw));
      emit();
    } catch {
      // Salvo corrompido ou indisponível: segue com o padrão.
    }
  },
  /** Troca tudo pelo que veio da nuvem (outro aparelho, reinstalação). */
  substituir: (novo: AppState) => {
    state = novo;
    emit();
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  },
  /** Volta tudo ao começo (Sair da conta). */
  reset: () => {
    state = inicial();
    emit();
    AsyncStorage.removeItem(KEY).catch(() => {});
  },
  setOnboarded: () => set({ onboarded: true }),
  setProva: (p: Partial<Rascunho>) => set({ prova: { ...state.prova, ...p } }),

  /** Prova nova com a trilha pronta: vira a prova atual. */
  adicionarProva: (p: ProvaSalva) => set({ provas: [p, ...state.provas.filter((x) => x.id !== p.id)], provaAtual: p.id }),
  setProvaAtual: (id: string) => set({ provaAtual: id }),
  setDataProva: (id: string, data: Date) => atualizarProva(id, (p) => ({ ...p, data })),
  /** Tira a prova da lista; se era a atual, a próxima que ainda vai acontecer assume a trilha. */
  excluirProva: (id: string) => {
    const provas = state.provas.filter((p) => p.id !== id);
    const proxima = [...provas].filter((p) => diasAte(p.data) >= 0).sort((a, b) => a.data.getTime() - b.data.getTime())[0];
    set({ provas, provaAtual: state.provaAtual === id ? (proxima?.id ?? null) : state.provaAtual });
  },
  setFormatos: (id: string, formatos: FormatoId[]) => atualizarProva(id, (p) => ({ ...p, formatos })),

  /** Fim de missão: XP, progresso da trilha, erros por tópico e sequência de dias. */
  concluirMissao: (r: {
    provaId: string | null;
    numero: number | null;
    tipo: 'trilha' | 'teste' | 'simulado' | 'revisao' | 'reforco';
    xp: number;
    acertos: number;
    respondidas: number;
    errosPorTopico: Record<string, number>;
    acertosPorTopico?: Record<string, number>;
  }) => {
    const dia = diaDe(hoje());
    const jaHoje = state.ultimoDia === dia;
    const streak = jaHoje ? state.streak : state.ultimoDia === ontem() ? state.streak + 1 : 1;
    const somar = (base: Record<string, number>, mais: Record<string, number> = {}) => {
      const out = { ...base };
      for (const [t, n] of Object.entries(mais)) out[t] = (out[t] ?? 0) + n;
      return out;
    };
    const provas = state.provas.map((p) => {
      if (p.id !== r.provaId) return p;
      return {
        ...p,
        feitas: r.numero != null && !p.feitas.includes(r.numero) ? [...p.feitas, r.numero].sort((a, b) => a - b) : p.feitas,
        feitasEm: r.numero != null && !p.feitas.includes(r.numero) ? { ...p.feitasEm, [r.numero]: dia } : p.feitasEm,
        erros: somar(p.erros, r.errosPorTopico),
        acertosTopico: somar(p.acertosTopico ?? {}, r.acertosPorTopico),
        acertos: p.acertos + r.acertos,
        respondidas: p.respondidas + r.respondidas,
      };
    });
    const marcos = new Set(state.marcos);
    if (r.respondidas > 0 && r.acertos === r.respondidas) marcos.add('zero');
    if (new Date().getHours() < 7) marcos.add('madrugador');
    if (r.tipo === 'simulado') marcos.add('simulado');
    if (provas.reduce((n, p) => n + Object.values(p.feitasEm).filter((d) => d === dia).length, 0) >= 3) marcos.add('relampago');
    set({ xp: state.xp + r.xp, provas, streak, recorde: Math.max(state.recorde, streak), ultimoDia: dia, marcos: [...marcos] });
  },
  marcar: (id: string) => {
    if (!state.marcos.includes(id)) set({ marcos: [...state.marcos, id] });
  },
  /** A tela 09 (sequência perdida) já apareceu. */
  avisarQuebra: () => set({ quebraAvisada: state.ultimoDia, streak: 0 }),

  setPremium: (premium: boolean) => set({ premium }),
  setTurma: (turma: TurmaRef) => set({ turma }),
  entrarNaTurma: (turma: TurmaRef) => set({ turma, turmas: state.turmas.some((t) => t.codigo === turma.codigo) ? state.turmas : [...state.turmas, turma] }),
  setNome: (nome: string) => set({ nome }),
  setFoto: (foto: string | null, fotoMini: string | null) => set({ foto, fotoMini }),
  setSerie: (serie: string) => set({ serie }),
  setLembrete: (lembrete: boolean) => set({ lembrete }),
  setLembreteHora: (lembreteHora: string) => set({ lembreteHora }),
  marcarPedidoNotificacao: () => set({ pediuNotificacao: true }),
  setSons: (sons: boolean) => set({ sons }),
  setMetricas: (metricas: boolean) => set({ metricas }),
  // Criança: sem estatísticas (o Google Analytics não é pra menores de 13).
  setFaixaEtaria: (faixaEtaria: FaixaEtaria) => set({ faixaEtaria, ...(faixaEtaria === 'crianca' ? { metricas: false } : {}) }),
};

export function useApp() {
  return useSyncExternalStore(app.subscribe, () => state, () => state);
}

/** Próxima missão da trilha (1, 2, …) ou null se todas estão feitas. */
export const proximaMissao = (p: Pick<ProvaSalva, 'feitas' | 'totalMissoes'>) => {
  for (let n = 1; n <= p.totalMissoes; n++) if (!p.feitas.includes(n)) return n;
  return null;
};

/** A prova atual (com a trilha), se já existe. */
export const provaAtualDe = (s: AppState) => s.provas.find((p) => p.id === s.provaAtual) ?? null;

/** Nome pra mostrar (o app não pede nome no começo). */
export const nomeDe = (s: Pick<AppState, 'nome'>) => s.nome.trim() || 'Fera';
