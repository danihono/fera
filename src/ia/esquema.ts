// Esquemas JSON das respostas da IA. O mesmo JSON Schema serve pro Claude (output_config.format)
// e pro Gemini (responseJsonSchema): todos os campos obrigatórios, opcionais como "ou null",
// additionalProperties: false e sem limites numéricos (as quantidades vão na descrição e são conferidas em normalizar.ts).
import type { Tarefa } from './tipos';

export type JsonSchema = { [k: string]: unknown };

const d = (description?: string) => (description ? { description } : {});

export const s = {
  str: (description?: string): JsonSchema => ({ type: 'string', ...d(description) }),
  num: (description?: string): JsonSchema => ({ type: 'number', ...d(description) }),
  int: (description?: string): JsonSchema => ({ type: 'integer', ...d(description) }),
  bool: (description?: string): JsonSchema => ({ type: 'boolean', ...d(description) }),
  enum: (values: string[], description?: string): JsonSchema => ({ type: 'string', enum: values, ...d(description) }),
  arr: (items: JsonSchema, description?: string): JsonSchema => ({ type: 'array', items, ...d(description) }),
  obj: (properties: Record<string, JsonSchema>, description?: string): JsonSchema => ({
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
    ...d(description),
  }),
  /** Valor ou null. */
  ou: (schema: JsonSchema): JsonSchema => ({ anyOf: [schema, { type: 'null' }] }),
};

const plano = s.obj({
  titulo: s.str('Nome curto do conteúdo, até 32 caracteres. Ex.: "Funções do 1º grau", "Revolução Francesa".'),
  materia: s.str('Matéria escolar, com acento. Ex.: "Matemática".'),
  resumoDoMaterial: s.str('O que o aluno mandou, em 1 ou 2 frases.'),
  conteudoBase: s.str(
    'Transcrição fiel, completa e organizada de todo o conteúdo do material (títulos, definições, fórmulas, exemplos, exercícios), corrigindo erros evidentes. Texto puro.',
  ),
  topicos: s.arr(
    s.obj({
      nome: s.str('Até 28 caracteres.'),
      essencial: s.str('A ideia central em uma frase.'),
      comoCai: s.str('Como costuma ser cobrado em prova.'),
      pegadinha: s.str('O erro mais comum dos alunos nesse ponto.'),
    }),
    'De 3 a 6 tópicos, na ordem em que se aprende.',
  ),
  avisos: s.arr(s.str(), 'Problemas no material: parte ilegível, foto cortada, erro do caderno que você corrigiu. Vazio se não houver.'),
  foraDoTema: s.bool('true só se o material não for conteúdo de estudo (ex.: foto de pessoa, meme, tela em branco).'),
});

const resumo = s.obj({
  intro: s.str('1 ou 2 frases: o que é, em linguagem de gente.'),
  destaque: s.ou(s.str('A fórmula ou frase-chave central, até 30 caracteres.')),
  blocos: s.arr(
    s.obj({
      rotulo: s.ou(s.str('Termo curtíssimo pro quadradinho (até 4 caracteres): "a", "1789", "DNA". null se não couber.')),
      titulo: s.str('Até 32 caracteres.'),
      texto: s.str('1 ou 2 frases curtas.'),
    }),
    'De 3 a 6 ideias centrais.',
  ),
  comparacao: s.arr(s.obj({ quando: s.str('Até 14 caracteres.'), diz: s.str('Até 24 caracteres.') }), '0, 2 ou 4 pares "se isso → aquilo".'),
  lembrar: s.arr(s.str('Até 60 caracteres.'), 'De 3 a 5 frases pra não esquecer.'),
  pegadinhas: s.arr(s.str('Até 110 caracteres.'), 'De 1 a 3 pegadinhas clássicas de prova.'),
});

const explicacao = s.obj({
  chamada: s.str('Até 40 caracteres. Ex.: "Vamos achar a raiz de", "Vamos entender por que".'),
  exemplo: s.str('O exemplo trabalhado: uma fórmula, conta ou situação curta (até 40 caracteres).'),
  passos: s.arr(
    s.obj({
      titulo: s.str('Até 28 caracteres.'),
      texto: s.str('1 ou 2 frases.'),
      conta: s.ou(s.str('A conta ou o resultado desse passo, até 26 caracteres.')),
    }),
    'De 3 a 6 passos.',
  ),
  dica: s.str('Macete final, até 90 caracteres.'),
});

const mapa = s.obj({
  centro: s.str('Tema central, até 26 caracteres.'),
  ramos: s.arr(s.obj({ titulo: s.str('Até 22 caracteres.'), detalhe: s.str('1 frase explicando o ramo.') }), 'De 4 a 6 ramos.'),
});

const slides = s.obj({
  slides: s.arr(
    s.obj({
      titulo: s.str('Até 26 caracteres.'),
      texto: s.str('Até 140 caracteres.'),
      destaque: s.str('A frase ou fórmula que fica na cabeça, até 22 caracteres.'),
    }),
    'De 5 a 8 slides. O primeiro abre o assunto e o último é "Na prova".',
  ),
});

const fluxo = s.obj({
  titulo: s.str('O que o fluxograma resolve, até 40 caracteres.'),
  etapas: s.arr(
    s.obj({
      tipo: s.enum(['inicio', 'passo', 'pergunta', 'fim']),
      texto: s.str('Até 34 caracteres.'),
      sub: s.ou(s.str('Detalhe ou conta, até 30 caracteres.')),
      seNao: s.ou(s.obj({ texto: s.str('Até 30 caracteres.'), sub: s.ou(s.str('Até 30 caracteres.')) })),
    }),
    'De 4 a 8 etapas. Começa com "inicio", termina com "fim". Em "pergunta" o caminho principal é o sim e seNao diz o que acontece no não; nas outras, seNao é null.',
  ),
});

const grafico = s.obj({
  graficos: s.arr(
    s.obj({
      tipo: s.enum(['funcoes', 'barras', 'linha']),
      titulo: s.str('Até 36 caracteres.'),
      explicacao: s.str('O que perceber no gráfico, 1 ou 2 frases.'),
      eixoX: s.str(),
      eixoY: s.str(),
      funcoes: s.arr(
        s.obj({
          expressao: s.str('Em x, sintaxe de calculadora: 2*x - 6, x^2 - 4*x + 3, 3*sin(x), sqrt(x), abs(x), exp(x), log(x), ln(x).'),
          rotulo: s.str('Como aparece pro aluno: "f(x) = 2x − 6".'),
          diz: s.str('Até 40 caracteres.'),
        }),
        'Só em "funcoes" (1 a 3). Vazio nos outros.',
      ),
      janela: s.ou(s.obj({ xMin: s.num(), xMax: s.num(), yMin: s.num(), yMax: s.num() })),
      pontos: s.arr(s.obj({ x: s.num(), y: s.num(), rotulo: s.str('Até 16 caracteres.') }), 'Pontos importantes (raiz, vértice…), no máximo 4.'),
      dados: s.arr(s.obj({ rotulo: s.str('Até 12 caracteres.'), valor: s.num() }), 'Só em "barras" e "linha": de 3 a 8 valores reais. Vazio em "funcoes".'),
      unidade: s.ou(s.str()),
      fonte: s.ou(s.str('De onde vêm os números (o material do aluno, IBGE…). null em "funcoes".')),
    }),
    'De 1 a 3 gráficos.',
  ),
});

const imagens = s.obj({
  imagens: s.arr(
    s.obj({
      titulo: s.str('Até 40 caracteres.'),
      texto: s.str('Legenda que explica, 1 ou 2 frases.'),
      prompt: s.str(
        'Pedido em inglês para um gerador de imagens: ilustração didática, clara, estilo flat colorido, fundo claro, SEM nenhum texto, letra ou número dentro da imagem.',
      ),
    }),
    'Exatamente 3 imagens.',
  ),
});

const questao = s.obj({
  tipo: s.enum(['quiz', 'lacuna', 'vf']),
  topico: s.str('Nome do tópico do plano.'),
  enunciado: s.str('Quiz: a pergunta (até 90 caracteres). VF: a afirmação (até 110). Lacuna: a instrução ("Arrasta a palavra pro lugar certo.").'),
  formula: s.ou(s.str('Quiz: expressão ou trecho curto em destaque (até 34 caracteres). null se não precisar.')),
  alternativas: s.arr(s.str('Até 40 caracteres.'), 'Quiz: exatamente 4. Lacuna e VF: vazio.'),
  correta: s.ou(s.int('Quiz: índice da certa, de 0 a 3. Outros: null.')),
  frase: s.ou(s.str('Lacuna: frase com ___ no lugar de cada lacuna (1 ou 2) e fórmulas entre $…$. Outros: null.')),
  respostas: s.arr(s.str(), 'Lacuna: a palavra de cada ___, na ordem. Outros: vazio.'),
  distratores: s.arr(s.str(), 'Lacuna: 3 ou 4 palavras erradas da mesma categoria. Outros: vazio.'),
  verdadeira: s.ou(s.bool('VF: se a afirmação é verdadeira. Outros: null.')),
  acerto: s.str('Reforço quando acerta: a prova rápida ou o porquê, até 40 caracteres.'),
  dica: s.str('Quando erra: a ideia que faltou, até 100 caracteres.'),
  passos: s.arr(s.str('Até 12 caracteres.'), 'Resolução em 2 ou 3 passos curtíssimos (contas). Vazio se não for conta.'),
  dificuldade: s.enum(['facil', 'media', 'dificil']),
});

const missao = s.obj({
  titulo: s.str('Até 28 caracteres.'),
  foco: s.str('O que essa missão treina, 1 frase.'),
  questoes: s.arr(questao),
});

const missoes = s.obj({ missoes: s.arr(missao, 'Exatamente 5 missões, da mais fácil pra mais difícil.') });

const revisao = s.obj({
  vereditos: s.arr(
    s.obj({
      indice: s.int('Número da questão.'),
      resposta: s.str('Quiz: a letra (A, B, C ou D). VF: "verdadeiro" ou "falso". Lacuna: as palavras na ordem, separadas por " | ".'),
      problema: s.ou(s.str('Erro de conteúdo, ambiguidade, mais de uma certa ou nenhuma certa. null se estiver tudo certo.')),
    }),
  ),
});

const correcao = s.obj({ questoes: s.arr(questao, 'As questões corrigidas, na mesma ordem.') });

export const ESQUEMAS: Record<Tarefa, JsonSchema> = {
  plano,
  resumo,
  explicacao,
  mapa,
  slides,
  fluxo,
  grafico,
  imagens,
  missoes,
  teste: missao,
  simulado: missao,
  revisao,
  correcao,
};
