// Orquestra a geração da prova no modo certo e guarda o progresso pra tela Gerando.
//   demo       sem Firebase: "gera" a prova de exemplo (site de prévia)
//   gratis     Firebase AI Logic + Gemini Flash, rodando no app (plano Spark, custo zero)
//   qualidade  Cloud Functions: Gemini lê, Claude escreve, Gemini confere, GPT Image ilustra (Fera+)
import { httpsCallable } from 'firebase/functions';
import { useSyncExternalStore } from 'react';
import { motorDemo } from '@/ia/demo';
import { planoExemplo } from '@/ia/exemplo';
import { ErroGeracao, gerarProva } from '@/ia/pipeline';
import type { FormatoId, PedidoGeracao, Progresso, ProvaGerada } from '@/ia/tipos';
import { entrar, firebase, firebaseLigado } from '@/lib/firebase';
import { motorGratis } from '@/lib/iaGratis';
import { carregarConteudo, salvarConteudo } from './conteudo';
import { lerConteudoNuvem, ouvirGeracao } from './nuvem';
import { anexosDoRascunho, limpar } from './rascunho';
import { app, diasAte, type ModoIA, type ProvaSalva } from './store';

const QUALIDADE_NO_AR = process.env.EXPO_PUBLIC_IA_QUALIDADE === '1';
const MODO_FORCADO = process.env.EXPO_PUBLIC_IA_MODO as ModoIA | undefined;

/** Qual IA vai gerar: Fera+ usa o modo qualidade quando as Functions estão no ar. */
export function modoIA(premium = app.get().premium): ModoIA {
  if (!firebaseLigado) return 'demo';
  if (MODO_FORCADO === 'demo' || MODO_FORCADO === 'gratis' || MODO_FORCADO === 'qualidade') return MODO_FORCADO;
  return premium && QUALIDADE_NO_AR ? 'qualidade' : 'gratis';
}

export const DESCRICAO_MODO: Record<ModoIA, { nome: string; texto: string }> = {
  demo: { nome: 'Demonstração', texto: 'Sem IA ligada: mostra uma prova de exemplo (Funções do 1º grau).' },
  gratis: { nome: 'Grátis · Gemini', texto: 'O Gemini Flash lê suas fotos, monta tudo e confere as questões.' },
  qualidade: { nome: 'Fera+ · time de IAs', texto: 'Gemini lê, Claude escreve e explica, outro modelo confere o gabarito e o GPT Image ilustra.' },
};

export type EstadoGeracao = {
  id: string;
  modo: ModoIA;
  progresso: Progresso;
  erro: { codigo: string; mensagem: string } | null;
  pronta: boolean;
};

let atual: EstadoGeracao | null = null;
const listeners = new Set<() => void>();
const set = (g: EstadoGeracao | null) => {
  atual = g;
  listeners.forEach((l) => l());
};
const progredir = (p: Progresso) => atual && set({ ...atual, progresso: { ...p, pct: Math.max(p.pct, atual.progresso.pct) } });

export function useGeracao() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => atual,
    () => atual,
  );
}

const inicio: Progresso = { etapa: 'lendo', pct: 2, texto: 'Abrindo o caderno…', feitos: [] };

const mensagemDe = (e: unknown) => {
  if (e instanceof ErroGeracao) return { codigo: e.codigo, mensagem: e.message };
  const f = e as { code?: string; message?: string; details?: { codigo?: string; mensagem?: string } };
  if (f?.details?.mensagem) return { codigo: f.details.codigo ?? 'falhou', mensagem: f.details.mensagem };
  if (f?.code === 'functions/resource-exhausted') return { codigo: 'limite', mensagem: 'A IA tá com fila agora. Espera um minutinho e tenta de novo.' };
  if (/network|offline|failed to fetch|unavailable/i.test(f?.message ?? '') || f?.code === 'functions/unavailable')
    return { codigo: 'rede', mensagem: 'Sem internet agora. Confere a conexão e tenta de novo.' };
  return { codigo: 'falhou', mensagem: 'A IA não respondeu agora. Tenta de novo daqui a pouco.' };
};

/** Chama a Cloud Function e acompanha o progresso que ela grava no Firestore. */
async function gerarNoServidor(nome: 'gerarProva' | 'gerarFormato', dados: object, provaId: string): Promise<ProvaGerada> {
  const s = firebase();
  await entrar();
  if (!s) throw new Error('Firebase desligado');
  const parar = ouvirGeracao(provaId, (g) => g.progresso && progredir(g.progresso));
  try {
    await httpsCallable(s.functions, nome, { timeout: 540_000 })(dados);
  } finally {
    parar();
  }
  const conteudo = await lerConteudoNuvem(provaId);
  if (!conteudo) throw new Error('conteúdo não chegou');
  return conteudo;
}

/** Gera a prova do rascunho (Nova prova → formatos → Gerando). */
export async function iniciarGeracao() {
  if (atual && !atual.pronta && !atual.erro) return; // já está gerando
  const s = app.get();
  const r = s.prova;
  const modo = modoIA(s.premium);
  const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  set({ id, modo, progresso: inicio, erro: null, pronta: false });

  const pedido: PedidoGeracao = {
    materia: r.materia,
    // O tópico do onboarding é só um chute pela matéria: quem descobre o tópico é a IA, lendo o material.
    topico: '',
    serie: s.serie,
    diasAte: Math.max(1, diasAte(r.data)),
    minutosDia: r.minutosDia,
    formatos: r.formatos,
    anexos: modo === 'demo' && anexosDoRascunho().length === 0 ? [{ tipo: 'texto', texto: planoExemplo.conteudoBase }] : anexosDoRascunho(),
  };

  try {
    const prova =
      modo === 'qualidade'
        ? await gerarNoServidor('gerarProva', { provaId: id, pedido }, id)
        : await gerarProva(pedido, modo === 'demo' ? motorDemo() : motorGratis(), progredir);
    const demo = modo === 'demo';
    const salva: ProvaSalva = {
      ...r,
      // No modo demonstração a prova é sempre a de exemplo (Matemática).
      ...(demo ? { materia: prova.plano.materia, icone: 'matematica' as const } : {}),
      topico: prova.plano.titulo,
      id,
      modo,
      totalMissoes: prova.missoes.length,
      feitas: [],
      feitasEm: {},
      erros: {},
      acertos: 0,
      respondidas: 0,
      criadaEm: new Date().toISOString(),
    };
    // No modo qualidade a Function já gravou o conteúdo na nuvem.
    await salvarConteudo(id, prova, { nuvem: modo !== 'qualidade' });
    app.adicionarProva(salva);
    limpar();
    set({ ...atual!, progresso: { ...atual!.progresso, pct: 100, etapa: 'pronto', texto: 'Trilha pronta!' }, pronta: true });
  } catch (e) {
    set({ ...atual!, erro: mensagemDe(e) });
  }
}

export const limparGeracao = () => set(null);

/** Formato a mais numa prova que já existe (tela Materiais). Devolve a mensagem de erro, se houver. */
export async function gerarFormato(prova: ProvaSalva, formato: FormatoId): Promise<string | null> {
  const conteudo = await carregarConteudo(prova.id);
  if (!conteudo) return 'Não achei o conteúdo dessa prova.';
  try {
    let extra: ProvaGerada;
    if (prova.modo === 'qualidade' && modoIA() === 'qualidade') {
      extra = await gerarNoServidor('gerarFormato', { provaId: prova.id, formato }, prova.id);
      await salvarConteudo(prova.id, extra, { nuvem: false });
    } else {
      const modo = modoIA();
      const pedido: PedidoGeracao = {
        materia: prova.materia,
        topico: prova.topico,
        serie: app.get().serie,
        diasAte: Math.max(1, diasAte(prova.data)),
        minutosDia: prova.minutosDia,
        formatos: [formato],
        anexos: [],
      };
      const novo = await gerarProva(pedido, modo === 'demo' ? motorDemo(400) : motorGratis(), () => {}, { plano: conteudo.plano, missoes: false });
      const falhou = novo.avisos.find((a) => a.startsWith('Não deu'));
      if (falhou) return falhou;
      extra = {
        ...conteudo,
        materiais: { ...conteudo.materiais, ...novo.materiais },
        teste: novo.teste ?? conteudo.teste,
        simulado: novo.simulado ?? conteudo.simulado,
        modelos: { ...conteudo.modelos, ...novo.modelos },
      };
      await salvarConteudo(prova.id, extra);
    }
    app.setFormatos(prova.id, [...prova.formatos.filter((f) => f !== formato), formato]);
    return null;
  } catch (e) {
    return mensagemDe(e).mensagem;
  }
}
