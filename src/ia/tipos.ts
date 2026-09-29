// Contratos da geração por IA. Código puro (sem React Native): o app e as Cloud Functions usam o mesmo arquivo.

/** Formatos de estudo que o aluno escolhe na Nova prova. */
export type FormatoId = 'resumo' | 'explicacao' | 'mapa' | 'quiz' | 'slides' | 'grafico' | 'fluxo' | 'imagens' | 'teste' | 'simulado';

/** Formatos que viram material pra ler (os outros viram missões). */
export type MaterialId = 'resumo' | 'explicacao' | 'mapa' | 'slides' | 'grafico' | 'fluxo' | 'imagens';
export const MATERIAIS: MaterialId[] = ['resumo', 'explicacao', 'mapa', 'slides', 'grafico', 'fluxo', 'imagens'];
export const ehMaterial = (f: string): f is MaterialId => (MATERIAIS as string[]).includes(f);

/**
 * O que o aluno mandou: fotos (caderno, livro, lousa), PDF, áudio/vídeo de aula (só o Gemini lê)
 * ou texto — digitado ou extraído de Word, slides, planilha, página web, zip… (src/lib/arquivos.ts).
 */
export type Anexo =
  | { tipo: 'foto'; mime: string; base64: string; nome: string }
  | { tipo: 'pdf'; mime: 'application/pdf'; base64: string; nome: string }
  | { tipo: 'midia'; mime: string; base64: string; nome: string }
  | { tipo: 'texto'; texto: string; nome?: string };

export type PedidoGeracao = {
  materia: string;
  /** Tópico que o aluno digitou ou escolheu (pode ser vazio: a IA descobre pelo material). */
  topico: string;
  /** "2º ano (EM)", "9º ano", "Cursinho / ENEM"… */
  serie: string;
  /** Dias até a prova (≥ 1). */
  diasAte: number;
  minutosDia: number;
  formatos: FormatoId[];
  anexos: Anexo[];
};

// ——— 1ª etapa: ler o material e montar o plano ———

export type Topico = {
  nome: string;
  /** A ideia central em uma frase. */
  essencial: string;
  /** Como costuma cair em prova. */
  comoCai: string;
  /** O erro mais comum. */
  pegadinha: string;
};

export type Plano = {
  /** Nome curto do conteúdo (vai no card da prova). */
  titulo: string;
  materia: string;
  /** O que o aluno mandou, em 1–2 frases. */
  resumoDoMaterial: string;
  /** Transcrição fiel e organizada do material (base de todo o resto). */
  conteudoBase: string;
  topicos: Topico[];
  /** Foto borrada, parte ilegível, erro do caderno corrigido… */
  avisos: string[];
  /** O material não parece conteúdo de estudo. */
  foraDoTema: boolean;
};

// ——— Materiais ———

export type Resumo = {
  intro: string;
  /** Fórmula ou frase-chave do assunto. */
  destaque: string | null;
  blocos: { rotulo: string | null; titulo: string; texto: string }[];
  comparacao: { quando: string; diz: string }[];
  lembrar: string[];
  pegadinhas: string[];
};

export type Explicacao = {
  chamada: string;
  exemplo: string;
  passos: { titulo: string; texto: string; conta: string | null }[];
  dica: string;
};

export type Mapa = { centro: string; ramos: { titulo: string; detalhe: string }[] };

export type Slides = { slides: { titulo: string; texto: string; destaque: string }[] };

export type EtapaFluxo = {
  tipo: 'inicio' | 'passo' | 'pergunta' | 'fim';
  texto: string;
  sub: string | null;
  /** Numa pergunta, o caminho principal é o "sim"; o "não" sai pro lado. */
  seNao: { texto: string; sub: string | null } | null;
};
export type Fluxo = { titulo: string; etapas: EtapaFluxo[] };

export type GraficoItem = {
  tipo: 'funcoes' | 'barras' | 'linha';
  titulo: string;
  explicacao: string;
  eixoX: string;
  eixoY: string;
  /** Só em "funcoes": expressões em x que o app calcula e desenha (nada de pixel inventado). */
  funcoes: { expressao: string; rotulo: string; diz: string }[];
  janela: { xMin: number; xMax: number; yMin: number; yMax: number } | null;
  pontos: { x: number; y: number; rotulo: string }[];
  /** Em "barras" e "linha". */
  dados: { rotulo: string; valor: number }[];
  unidade: string | null;
  fonte: string | null;
};
export type Grafico = { graficos: GraficoItem[] };

export type Imagens = {
  imagens: {
    titulo: string;
    texto: string;
    /** Pedido para o modelo de imagem (em inglês, sem texto dentro da imagem). */
    prompt: string;
    /** Preenchido depois que a imagem é gerada. */
    url: string | null;
  }[];
};

export type Materiais = {
  resumo: Resumo;
  explicacao: Explicacao;
  mapa: Mapa;
  slides: Slides;
  grafico: Grafico;
  fluxo: Fluxo;
  imagens: Imagens;
};

// ——— Questões ———

export type QuestaoIA = {
  tipo: 'quiz' | 'lacuna' | 'vf';
  topico: string;
  /** Quiz: a pergunta. VF: a afirmação. Lacuna: a instrução. */
  enunciado: string;
  /** Quiz: expressão ou trecho em destaque (ou null). */
  formula: string | null;
  /** Quiz: exatamente 4. */
  alternativas: string[];
  /** Quiz: índice da certa (0–3). */
  correta: number | null;
  /** Lacuna: frase com ___ em cada lacuna; fórmulas entre $…$. */
  frase: string | null;
  /** Lacuna: palavra de cada ___, na ordem. */
  respostas: string[];
  /** Lacuna: palavras erradas que vão pro banco. */
  distratores: string[];
  /** VF. */
  verdadeira: boolean | null;
  /** Reforço curto quando acerta. */
  acerto: string;
  /** Quando erra: a ideia que faltou. */
  dica: string;
  /** Resolução em passos bem curtos (pode ser vazio). */
  passos: string[];
  dificuldade: 'facil' | 'media' | 'dificil';
};

export type MissaoIA = { titulo: string; foco: string; questoes: QuestaoIA[] };

/** Revisor: resolve cada questão sem ver o gabarito. */
export type Veredito = {
  indice: number;
  /** Quiz: índice escolhido. VF: "verdadeiro"/"falso". Lacuna: palavras separadas por " | ". */
  resposta: string;
  problema: string | null;
};

// ——— Resultado final ———

export type Tarefa =
  | 'plano'
  | MaterialId
  | 'missoes'
  | 'teste'
  | 'simulado'
  | 'revisao'
  | 'correcao';

export type ProvaGerada = {
  versao: 1;
  plano: Plano;
  materiais: Partial<Materiais>;
  /** Missões da trilha, em ordem. */
  missoes: MissaoIA[];
  teste: MissaoIA | null;
  simulado: MissaoIA | null;
  /** Qual modelo fez cada parte (transparência pro aluno e pra gente). */
  modelos: Partial<Record<Tarefa | 'arte', string>>;
  avisos: string[];
  /** Questões trocadas ou tiradas pela revisão. */
  revisao: { conferidas: number; corrigidas: number; removidas: number };
  geradoEm: string;
};

export type EtapaGeracao = 'lendo' | 'planejando' | 'criando' | 'questoes' | 'revisando' | 'imagens' | 'pronto';

export type Progresso = {
  etapa: EtapaGeracao;
  /** 0–100. */
  pct: number;
  /** Frase pra tela Gerando. */
  texto: string;
  /** Linhas já concluídas ("3 fotos lidas", "4 tópicos encontrados"…). */
  feitos: string[];
};
