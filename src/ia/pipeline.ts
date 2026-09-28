// Linha de montagem da prova: lê o material → monta o plano → cria materiais e missões em paralelo →
// um segundo modelo resolve todas as questões sem gabarito → o que não bater é corrigido ou sai → ilustrações.
// Os provedores (Claude, Gemini, GPT Image ou o de demonstração) entram pelo Motor.
import { ESQUEMAS, type JsonSchema } from './esquema';
import * as N from './normalizar';
import { blocoDoMaterial, instrucaoDaTarefa, pedidoDaCorrecao, pedidoDaRevisao, pedidoDoPlano, questaoSemGabarito, SISTEMA } from './prompts';
import { bancoDa, revisorConcorda } from './questoes';
import {
  ehMaterial,
  type MaterialId,
  type Materiais,
  type MissaoIA,
  type PedidoGeracao,
  type Plano,
  type Progresso,
  type ProvaGerada,
  type QuestaoIA,
  type Tarefa,
} from './tipos';

export type Parte = { texto: string; cache?: boolean } | { arquivo: { mime: string; base64: string } };

export type PedidoIA = {
  tarefa: Tarefa;
  sistema: string;
  partes: Parte[];
  esquema: JsonSchema;
  /** "alto" nas questões e na revisão: vale gastar mais raciocínio pra não errar gabarito. */
  esforco: 'medio' | 'alto';
  /** Tamanho máximo da resposta visível (o provedor soma a folga do raciocínio). */
  maxTokens: number;
};

export interface ModeloIA {
  /** Ex.: "claude-opus-5", "gemini-3.5-flash". */
  id: string;
  gerar(p: PedidoIA): Promise<unknown>;
}

export interface ModeloImagem {
  id: string;
  /** Devolve a URL (ou data URI) da imagem. */
  gerar(prompt: string, ctx: { indice: number }): Promise<string>;
}

export type Motor = {
  modelo: (t: Tarefa) => ModeloIA;
  imagem: ModeloImagem | null;
  /** Chamadas ao mesmo tempo (o plano grátis do Gemini aguenta pouco). */
  concorrencia?: number;
  /** Espera entre tentativas; os testes usam 0. */
  espera?: (ms: number) => Promise<void>;
};

export type CodigoErro = 'fora-do-tema' | 'sem-conteudo' | 'limite' | 'falhou';

export class ErroGeracao extends Error {
  constructor(
    public codigo: CodigoErro,
    message: string,
  ) {
    super(message);
  }
}

/** Erro de limite de uso (429) vindo de qualquer provedor. */
const ehLimite = (e: unknown) => {
  const x = e as { status?: number; code?: string | number; message?: string };
  return x?.status === 429 || x?.code === 429 || x?.code === 'resource-exhausted' || /\b429\b|quota|rate limit|resource.?exhausted/i.test(x?.message ?? '');
};

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const TOKENS: Record<Tarefa, number> = {
  plano: 16000,
  resumo: 6000,
  explicacao: 6000,
  mapa: 4000,
  slides: 6000,
  fluxo: 4000,
  grafico: 6000,
  imagens: 4000,
  missoes: 20000,
  teste: 10000,
  simulado: 14000,
  revisao: 12000,
  correcao: 12000,
};

const NOMES: Record<MaterialId | 'missoes' | 'teste' | 'simulado', string> = {
  resumo: 'o resumo',
  explicacao: 'a explicação',
  mapa: 'o mapa mental',
  slides: 'os slides',
  grafico: 'os gráficos',
  fluxo: 'o fluxograma',
  imagens: 'as ilustrações',
  missoes: 'as missões',
  teste: 'o teste',
  simulado: 'o simulado',
};

/** Roda tarefas com no máximo `n` ao mesmo tempo. */
async function emParalelo<T>(tarefas: (() => Promise<T>)[], n: number): Promise<T[]> {
  const out: T[] = new Array(tarefas.length);
  let proxima = 0;
  const trabalhador = async () => {
    while (proxima < tarefas.length) {
      const i = proxima++;
      out[i] = await tarefas[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, tarefas.length) }, trabalhador));
  return out;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

function linhaDoMaterial(p: PedidoGeracao) {
  const fotos = p.anexos.filter((a) => a.tipo === 'foto').length;
  const pdfs = p.anexos.filter((a) => a.tipo === 'pdf').length;
  const partes = [fotos && plural(fotos, 'foto lida', 'fotos lidas'), pdfs && plural(pdfs, 'PDF lido', 'PDFs lidos')].filter(Boolean);
  return partes.length ? partes.join(' e ') : 'Texto lido';
}

export type OpcoesGeracao = {
  /** Plano já pronto (formato extra numa prova existente): pula a leitura do material. */
  plano?: Plano;
  /** false = não gera as missões da trilha (só os formatos pedidos). */
  missoes?: boolean;
};

export async function gerarProva(
  pedido: PedidoGeracao,
  motor: Motor,
  aoProgredir: (p: Progresso) => void = () => {},
  opcoes: OpcoesGeracao = {},
): Promise<ProvaGerada> {
  const espera = motor.espera ?? dormir;
  const concorrencia = motor.concorrencia ?? 3;
  const feitos: string[] = [];
  const avisos: string[] = [];
  const modelos: ProvaGerada['modelos'] = {};
  const progresso = (etapa: Progresso['etapa'], pct: number, texto: string) => aoProgredir({ etapa, pct: Math.round(pct), texto, feitos: [...feitos] });

  /** Chama o modelo da tarefa e confere a resposta; tenta de novo se vier quebrada ou der limite. */
  async function chamar<T>(tarefa: Tarefa, partes: Parte[], conferir: (v: unknown) => T): Promise<T> {
    const modelo = motor.modelo(tarefa);
    modelos[tarefa] = modelo.id;
    let ultimo: unknown;
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      try {
        const bruto = await modelo.gerar({
          tarefa,
          sistema: SISTEMA,
          partes,
          esquema: ESQUEMAS[tarefa],
          esforco: tarefa === 'missoes' || tarefa === 'teste' || tarefa === 'simulado' || tarefa === 'revisao' || tarefa === 'correcao' ? 'alto' : 'medio',
          maxTokens: TOKENS[tarefa],
        });
        return conferir(bruto);
      } catch (e) {
        ultimo = e;
        if (e instanceof ErroGeracao) throw e;
        await espera(ehLimite(e) ? 20000 * (tentativa + 1) : 1500 * (tentativa + 1));
      }
    }
    if (ehLimite(ultimo)) throw new ErroGeracao('limite', 'A IA tá com fila agora. Espera um minutinho e tenta de novo.');
    throw ultimo;
  }

  // ——— 1. Ler e planejar ———
  let plano: Plano;
  if (opcoes.plano) {
    plano = opcoes.plano;
  } else {
    if (pedido.anexos.length === 0) throw new ErroGeracao('sem-conteudo', 'Manda pelo menos uma foto, um PDF ou um texto.');
    const temFoto = pedido.anexos.some((a) => a.tipo === 'foto');
    progresso('lendo', 3, temFoto ? 'Lendo sua letra (tá bonita, hein)' : 'Lendo o seu material…');
    const partesDoPlano: Parte[] = [
      ...pedido.anexos.map((a): Parte => (a.tipo === 'texto' ? { texto: `TEXTO DO ALUNO:\n${a.texto}` } : { arquivo: { mime: a.mime, base64: a.base64 } })),
      { texto: pedidoDoPlano(pedido) },
    ];
    try {
      plano = await chamar('plano', partesDoPlano, N.plano);
    } catch (e) {
      // Resposta quebrada = o material não deu pra ler; outros erros (rede, IA fora do ar) seguem pra quem chamou.
      if (e instanceof N.RespostaInvalida || e instanceof SyntaxError) throw new ErroGeracao('falhou', 'Não consegui ler o material. Tenta fotos mais nítidas ou cola o texto.');
      throw e;
    }
    if (plano.foraDoTema) throw new ErroGeracao('fora-do-tema', 'Não achei matéria de estudo aí. Manda a foto do caderno, do livro ou da lousa.');
    avisos.push(...plano.avisos);
    feitos.push(linhaDoMaterial(pedido), plural(plano.topicos.length, 'tópico encontrado', 'tópicos encontrados'));
  }
  progresso('planejando', 22, 'Separando o que mais cai…');

  // ——— 2. Materiais e missões ———
  const contexto: Parte = { texto: blocoDoMaterial(pedido, plano), cache: true };
  const materiaisEscolhidos = pedido.formatos.filter(ehMaterial);
  const praticas = (['teste', 'simulado'] as const).filter((f) => pedido.formatos.includes(f));
  const materiais: Partial<Materiais> = {};
  let missoes: MissaoIA[] = [];
  let teste: MissaoIA | null = null;
  let simulado: MissaoIA | null = null;

  const comMissoes = opcoes.missoes !== false;
  const total = materiaisEscolhidos.length + (comMissoes ? 1 : 0) + praticas.length;
  let prontos = 0;
  const avancar = (proximo: string) => {
    prontos++;
    progresso('criando', 22 + (53 * prontos) / total, prontos < total ? `Criando ${proximo}…` : 'Afiando as garras…');
  };
  progresso('criando', 24, `Criando ${materiaisEscolhidos.length ? NOMES[materiaisEscolhidos[0]] : NOMES.missoes}…`);

  const trabalhos: (() => Promise<void>)[] = [
    ...(comMissoes
      ? [
          async () => {
            missoes = await chamar('missoes', [contexto, { texto: instrucaoDaTarefa('missoes') }], N.missoes);
            avancar(NOMES[materiaisEscolhidos[0] ?? 'missoes']);
          },
        ]
      : []),
    ...materiaisEscolhidos.map((m) => async () => {
      try {
        // A atribuição genérica precisa do cast: o TypeScript não liga a chave ao tipo do normalizador.
        const conferir: (v: unknown) => unknown = N.material[m];
        (materiais as Record<MaterialId, unknown>)[m] = await chamar(m, [contexto, { texto: instrucaoDaTarefa(m) }], conferir);
      } catch (e) {
        if (e instanceof ErroGeracao && e.codigo === 'limite') throw e;
        avisos.push(`Não deu pra criar ${NOMES[m]} agora. Dá pra tentar de novo nos Materiais.`);
      }
      avancar(NOMES[m]);
    }),
    ...praticas.map((f) => async () => {
      try {
        const m = await chamar(f, [contexto, { texto: instrucaoDaTarefa(f) }], (v) => N.missao(v, 5));
        if (!m) throw new N.RespostaInvalida(`${f} vazio`);
        if (f === 'teste') teste = m;
        else simulado = m;
      } catch (e) {
        if (e instanceof ErroGeracao && e.codigo === 'limite') throw e;
        avisos.push(`Não deu pra criar ${NOMES[f]} agora. Dá pra tentar de novo nos Materiais.`);
      }
      avancar(NOMES[f]);
    }),
  ];
  try {
    await emParalelo(trabalhos, concorrencia);
  } catch (e) {
    if (e instanceof N.RespostaInvalida || e instanceof SyntaxError) throw new ErroGeracao('falhou', 'Não consegui montar as missões. Tenta de novo daqui a pouco.');
    throw e;
  }
  const qtdMateriais = Object.keys(materiais).length;
  if (comMissoes)
    feitos.push(qtdMateriais ? `${plural(qtdMateriais, 'material criado', 'materiais criados')} e ${plural(missoes.length, 'missão', 'missões')}` : plural(missoes.length, 'missão criada', 'missões criadas'));

  // ——— 3. Revisão independente das questões ———
  const grupos: MissaoIA[] = [...missoes, ...(teste ? [teste] : []), ...(simulado ? [simulado] : [])];
  if (grupos.length) progresso('revisando', 78, 'Outro professor tá conferindo as questões…');
  const revisao = await revisar(grupos);
  if (revisao.conferidas)
    feitos.push(revisao.corrigidas || revisao.removidas ? `${revisao.conferidas} questões conferidas · ${revisao.corrigidas + revisao.removidas} ajustadas` : `${revisao.conferidas} questões conferidas`);

  // ——— 4. Ilustrações ———
  if (materiais.imagens && motor.imagem) {
    progresso('imagens', 92, 'Desenhando as ilustrações…');
    const img = motor.imagem;
    modelos.arte = img.id;
    const lista = materiais.imagens.imagens;
    await emParalelo(
      lista.map((it, indice) => async () => {
        try {
          it.url = await img.gerar(it.prompt, { indice });
        } catch {
          it.url = null;
        }
      }),
      3,
    );
    if (lista.every((i) => !i.url)) avisos.push('As ilustrações não saíram agora; as legendas ficaram.');
  }

  progresso('pronto', 100, 'Trilha pronta!');
  return {
    versao: 1,
    plano,
    materiais,
    missoes: missoes.filter((m) => m.questoes.length >= 3),
    teste,
    simulado,
    modelos,
    avisos,
    revisao,
    geradoEm: new Date().toISOString(),
  };

  /** Um segundo modelo resolve tudo sem gabarito; divergências vão pra correção e voltam pra conferência. */
  async function revisar(grupos: MissaoIA[]) {
    type Item = { q: QuestaoIA; g: number; k: number };
    const todas: Item[] = grupos.flatMap((m, g) => m.questoes.map((q, k) => ({ q, g, k })));
    let corrigidas = 0;
    let removidas = 0;
    if (!todas.length) return { conferidas: 0, corrigidas, removidas };

    const conferir = async (itens: Item[]) => {
      const texto = itens.map((it, i) => questaoSemGabarito(it.q, i + 1, bancoDa(it.q))).join('\n\n');
      const vereditos = await chamar('revisao', [{ texto: pedidoDaRevisao(texto) }], N.vereditos);
      // Sem veredito = não conferida: conta como divergência pra não passar batido.
      return itens.map((item, i) => {
        const v = vereditos.find((x) => x.indice === i + 1) ?? { indice: i + 1, resposta: '?', problema: 'o revisor não respondeu' };
        return { item, v, ok: revisorConcorda(item.q, v) };
      });
    };

    let divergentes: Awaited<ReturnType<typeof conferir>>;
    try {
      divergentes = (await conferir(todas)).filter((r) => !r.ok);
    } catch (e) {
      if (e instanceof ErroGeracao && e.codigo === 'limite') throw e;
      avisos.push('A conferência automática das questões não rodou desta vez.');
      return { conferidas: 0, corrigidas, removidas };
    }

    const sai = new Set<QuestaoIA>();
    if (divergentes.length) {
      try {
        // O autor revê cada divergente com a objeção do revisor; a versão nova passa por outra conferência.
        const novas = await chamar(
          'correcao',
          [contexto, { texto: pedidoDaCorrecao(divergentes.map(({ item, v }) => ({ questao: item.q, resposta: v.resposta, problema: v.problema }))) }],
          N.correcao,
        );
        const trocas: Item[] = divergentes.flatMap(({ item }, i) => {
          const q = novas[i];
          return q && q.tipo === item.q.tipo ? [{ ...item, q }] : [];
        });
        const aprovadas = trocas.length ? (await conferir(trocas)).filter((r) => r.ok).map((r) => r.item) : [];
        for (const { item } of divergentes) {
          const nova = aprovadas.find((a) => a.g === item.g && a.k === item.k);
          if (nova) {
            grupos[item.g].questoes[item.k] = nova.q;
            corrigidas++;
          } else {
            sai.add(item.q);
          }
        }
      } catch (e) {
        if (e instanceof ErroGeracao && e.codigo === 'limite') throw e;
        divergentes.forEach(({ item }) => sai.add(item.q));
      }
    }
    for (const g of grupos) {
      const antes = g.questoes.length;
      g.questoes = g.questoes.filter((q) => !sai.has(q));
      removidas += antes - g.questoes.length;
    }
    return { conferidas: todas.length, corrigidas, removidas };
  }
}
