// Confere e limpa o que a IA devolveu: tira Markdown, corta o que não cabe na tela, descarta o que está quebrado.
// O esquema JSON garante o formato; aqui garantimos que dá pra mostrar e que o gabarito é coerente.
import { avaliar } from './expressao';
import type {
  EtapaFluxo,
  Explicacao,
  Fluxo,
  Grafico,
  GraficoItem,
  Imagens,
  Mapa,
  MaterialId,
  Materiais,
  MissaoIA,
  Plano,
  QuestaoIA,
  Resumo,
  Slides,
  Veredito,
} from './tipos';

export class RespostaInvalida extends Error {}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Texto limpo: sem Markdown nem espaços sobrando; corta na palavra e põe reticências se passar do limite. */
export function texto(v: unknown, max = 400): string {
  if (typeof v !== 'string' && typeof v !== 'number') return '';
  let t = String(v)
    .replace(/\*\*|`/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > max) {
    const corte = t.slice(0, max - 1);
    const espaco = corte.lastIndexOf(' ');
    t = `${(espaco > max * 0.6 ? corte.slice(0, espaco) : corte).replace(/[\s,;:.–-]+$/, '')}…`;
  }
  return t;
}

/** Texto longo (transcrição): mantém as quebras de linha. */
const textoLongo = (v: unknown) => (typeof v === 'string' ? v.replace(/\*\*|`/g, '').replace(/[ \t]+\n/g, '\n').trim() : '');

const textoOuNull = (v: unknown, max?: number) => {
  const t = texto(v, max);
  return t ? t : null;
};

const textos = (v: unknown, max: number, ate: number) => lista(v).map((x) => texto(x, max)).filter(Boolean).slice(0, ate);

const numero = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v.replace(',', '.'))) ? Number(v.replace(',', '.')) : null);

function exigir(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new RespostaInvalida(msg);
}

export function plano(v: unknown): Plano {
  const o = obj(v);
  const topicos = lista(o.topicos)
    .map((t) => {
      const x = obj(t);
      return { nome: texto(x.nome, 32), essencial: texto(x.essencial, 220), comoCai: texto(x.comoCai, 220), pegadinha: texto(x.pegadinha, 220) };
    })
    .filter((t) => t.nome)
    .slice(0, 6);
  const p: Plano = {
    titulo: texto(o.titulo, 36),
    materia: texto(o.materia, 30),
    resumoDoMaterial: texto(o.resumoDoMaterial, 300),
    conteudoBase: textoLongo(o.conteudoBase).slice(0, 60000),
    topicos,
    avisos: textos(o.avisos, 200, 5),
    foraDoTema: o.foraDoTema === true,
  };
  exigir(p.foraDoTema || (p.titulo && p.topicos.length > 0), 'plano sem título ou tópicos');
  return p;
}

function resumo(v: unknown): Resumo {
  const o = obj(v);
  const r: Resumo = {
    intro: texto(o.intro, 260),
    destaque: textoOuNull(o.destaque, 34),
    blocos: lista(o.blocos)
      .map((b) => {
        const x = obj(b);
        const rotulo = textoOuNull(x.rotulo, 5);
        return { rotulo: rotulo && rotulo.length <= 4 ? rotulo : null, titulo: texto(x.titulo, 40), texto: texto(x.texto, 220) };
      })
      .filter((b) => b.titulo && b.texto)
      .slice(0, 6),
    comparacao: lista(o.comparacao)
      .map((c) => ({ quando: texto(obj(c).quando, 16), diz: texto(obj(c).diz, 28) }))
      .filter((c) => c.quando && c.diz)
      .slice(0, 4),
    lembrar: textos(o.lembrar, 80, 5),
    pegadinhas: textos(o.pegadinhas, 140, 3),
  };
  // Comparação vem em pares lado a lado.
  if (r.comparacao.length % 2 === 1) r.comparacao = r.comparacao.slice(0, -1);
  exigir(r.intro && r.blocos.length >= 2, 'resumo incompleto');
  return r;
}

function explicacao(v: unknown): Explicacao {
  const o = obj(v);
  const e: Explicacao = {
    chamada: texto(o.chamada, 44),
    exemplo: texto(o.exemplo, 60),
    passos: lista(o.passos)
      .map((p) => {
        const x = obj(p);
        return { titulo: texto(x.titulo, 34), texto: texto(x.texto, 240), conta: textoOuNull(x.conta, 30) };
      })
      .filter((p) => p.titulo && p.texto)
      .slice(0, 6),
    dica: texto(o.dica, 120),
  };
  exigir(e.exemplo && e.passos.length >= 2, 'explicação incompleta');
  return e;
}

function mapa(v: unknown): Mapa {
  const o = obj(v);
  const m: Mapa = {
    centro: texto(o.centro, 30),
    ramos: lista(o.ramos)
      .map((r) => ({ titulo: texto(obj(r).titulo, 26), detalhe: texto(obj(r).detalhe, 200) }))
      .filter((r) => r.titulo)
      .slice(0, 6),
  };
  exigir(m.centro && m.ramos.length >= 3, 'mapa incompleto');
  return m;
}

function slides(v: unknown): Slides {
  const s: Slides = {
    slides: lista(obj(v).slides)
      .map((x) => {
        const o = obj(x);
        return { titulo: texto(o.titulo, 32), texto: texto(o.texto, 170), destaque: texto(o.destaque, 26) };
      })
      .filter((x) => x.titulo && x.texto)
      .slice(0, 8),
  };
  exigir(s.slides.length >= 3, 'poucos slides');
  return s;
}

function fluxo(v: unknown): Fluxo {
  const o = obj(v);
  const tipos = ['inicio', 'passo', 'pergunta', 'fim'] as const;
  const etapas: EtapaFluxo[] = lista(o.etapas)
    .map((e) => {
      const x = obj(e);
      const tipo = tipos.find((t) => t === x.tipo) ?? 'passo';
      const seNao = obj(x.seNao);
      return {
        tipo,
        texto: texto(x.texto, 40),
        sub: textoOuNull(x.sub, 34),
        seNao: tipo === 'pergunta' && texto(seNao.texto) ? { texto: texto(seNao.texto, 34), sub: textoOuNull(seNao.sub, 34) } : null,
      };
    })
    .filter((e) => e.texto)
    .slice(0, 8);
  exigir(etapas.length >= 3, 'fluxo curto');
  etapas[0].tipo = 'inicio';
  etapas[etapas.length - 1].tipo = 'fim';
  return { titulo: texto(o.titulo, 44), etapas };
}

function graficoItem(v: unknown): GraficoItem | null {
  const o = obj(v);
  const tipo = (['funcoes', 'barras', 'linha'] as const).find((t) => t === o.tipo);
  if (!tipo) return null;
  const funcoes = lista(o.funcoes)
    .map((f) => ({ expressao: texto(obj(f).expressao, 80), rotulo: texto(obj(f).rotulo, 34), diz: texto(obj(f).diz, 50) }))
    // Só fica a expressão que o app consegue calcular.
    .filter((f) => f.expressao && testaExpressao(f.expressao))
    .slice(0, 3);
  const j = obj(o.janela);
  const [xMin, xMax, yMin, yMax] = [numero(j.xMin), numero(j.xMax), numero(j.yMin), numero(j.yMax)];
  const janela = xMin != null && xMax != null && yMin != null && yMax != null && xMax > xMin && yMax > yMin ? { xMin, xMax, yMin, yMax } : null;
  const pontos = lista(o.pontos)
    .map((p) => ({ x: numero(obj(p).x), y: numero(obj(p).y), rotulo: texto(obj(p).rotulo, 18) }))
    .filter((p): p is { x: number; y: number; rotulo: string } => p.x != null && p.y != null)
    .slice(0, 4);
  const dados = lista(o.dados)
    .map((d) => ({ rotulo: texto(obj(d).rotulo, 12), valor: numero(obj(d).valor) }))
    .filter((d): d is { rotulo: string; valor: number } => !!d.rotulo && d.valor != null)
    .slice(0, 8);
  const item: GraficoItem = {
    tipo,
    titulo: texto(o.titulo, 40),
    explicacao: texto(o.explicacao, 240),
    eixoX: texto(o.eixoX, 24),
    eixoY: texto(o.eixoY, 24),
    funcoes: tipo === 'funcoes' ? funcoes : [],
    janela,
    pontos: tipo === 'funcoes' ? pontos : [],
    dados: tipo === 'funcoes' ? [] : dados,
    unidade: textoOuNull(o.unidade, 16),
    fonte: textoOuNull(o.fonte, 80),
  };
  if (tipo === 'funcoes' ? item.funcoes.length === 0 : item.dados.length < 2) return null;
  return item;
}

/** A expressão dá número em algum ponto da janela típica? */
function testaExpressao(expr: string) {
  for (const x of [-3, -1, 0.5, 1, 2, 4]) {
    const y = avaliar(expr, x);
    if (y != null && Number.isFinite(y)) return true;
  }
  return false;
}

function grafico(v: unknown): Grafico {
  const g: Grafico = { graficos: lista(obj(v).graficos).map(graficoItem).filter((x): x is GraficoItem => !!x).slice(0, 3) };
  exigir(g.graficos.length >= 1, 'nenhum gráfico válido');
  return g;
}

function imagens(v: unknown): Imagens {
  const i: Imagens = {
    imagens: lista(obj(v).imagens)
      .map((x) => {
        const o = obj(x);
        // Só a arte embutida do exemplo passa daqui; as URLs de verdade entram depois de gerar a imagem.
        const url = typeof o.url === 'string' && o.url.startsWith('exemplo:') ? o.url : null;
        return { titulo: texto(o.titulo, 44), texto: texto(o.texto, 220), prompt: texto(o.prompt, 1200), url };
      })
      .filter((x) => x.titulo && x.prompt)
      .slice(0, 3),
  };
  exigir(i.imagens.length >= 1, 'nenhuma imagem');
  return i;
}

export const material: { [K in MaterialId]: (v: unknown) => Materiais[K] } = { resumo, explicacao, mapa, slides, fluxo, grafico, imagens };

// ——— Questões ———

const LACUNA = '___';

export function questao(v: unknown): QuestaoIA | null {
  const o = obj(v);
  const tipo = (['quiz', 'lacuna', 'vf'] as const).find((t) => t === o.tipo);
  if (!tipo) return null;
  const base = {
    tipo,
    topico: texto(o.topico, 40),
    enunciado: texto(o.enunciado, tipo === 'vf' ? 150 : 120),
    formula: null as string | null,
    alternativas: [] as string[],
    correta: null as number | null,
    frase: null as string | null,
    respostas: [] as string[],
    distratores: [] as string[],
    verdadeira: null as boolean | null,
    acerto: texto(o.acerto, 44),
    dica: texto(o.dica, 110),
    passos: textos(o.passos, 14, 3),
    dificuldade: (['facil', 'media', 'dificil'] as const).find((d) => d === o.dificuldade) ?? 'media',
  } satisfies QuestaoIA;
  if (!base.enunciado || !base.dica) return null;

  if (tipo === 'quiz') {
    const alternativas = lista(o.alternativas).map((a) => texto(a, 48));
    const correta = numero(o.correta);
    if (alternativas.length !== 4 || alternativas.some((a) => !a)) return null;
    if (correta == null || !Number.isInteger(correta) || correta < 0 || correta > 3) return null;
    // Alternativas repetidas deixam a questão com duas certas.
    if (new Set(alternativas.map((a) => a.toLocaleLowerCase('pt-BR'))).size !== 4) return null;
    return { ...base, formula: textoOuNull(o.formula, 40), alternativas, correta };
  }

  if (tipo === 'vf') {
    if (typeof o.verdadeira !== 'boolean') return null;
    return { ...base, verdadeira: o.verdadeira };
  }

  const frase = texto(o.frase, 200);
  const respostas = lista(o.respostas).map((r) => texto(r, 18));
  const buracos = frase.split(LACUNA).length - 1;
  if (!frase || buracos < 1 || buracos > 2 || respostas.length !== buracos || respostas.some((r) => !r)) return null;
  const distratores = lista(o.distratores)
    .map((r) => texto(r, 18))
    .filter((r) => r && !respostas.includes(r))
    .slice(0, 4);
  if (distratores.length < 2) return null;
  return { ...base, frase, respostas, distratores };
}

export function missao(v: unknown, minimo = 3): MissaoIA | null {
  const o = obj(v);
  const questoes = lista(o.questoes)
    .map(questao)
    .filter((q): q is QuestaoIA => !!q);
  if (questoes.length < minimo) return null;
  return { titulo: texto(o.titulo, 32), foco: texto(o.foco, 160), questoes };
}

export function missoes(v: unknown): MissaoIA[] {
  const m = lista(obj(v).missoes)
    .map((x) => missao(x))
    .filter((x): x is MissaoIA => !!x)
    .slice(0, 5);
  exigir(m.length >= 3, 'poucas missões válidas');
  return m;
}

export function vereditos(v: unknown): Veredito[] {
  return lista(obj(v).vereditos)
    .map((x) => {
      const o = obj(x);
      const indice = numero(o.indice);
      return { indice: indice ?? -1, resposta: texto(o.resposta, 200), problema: textoOuNull(o.problema, 300) };
    })
    .filter((x) => x.indice >= 0);
}

export function correcao(v: unknown): (QuestaoIA | null)[] {
  return lista(obj(v).questoes).map(questao);
}
