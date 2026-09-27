// Missão de exemplo (Funções do 1º grau · Missão 3), com as questões do design.
export type Feedback = {
  /** Linha ao lado do "+10 XP" no Acerto. */
  acerto: string;
  /** Explicação e passo a passo (opcional) do Erro. */
  erro: { dica: string; passos?: string[] };
};

export type QuizQuestion = { kind: 'quiz'; pergunta: string; formula: string; alternativas: string[]; resposta: number } & Feedback;

export type LacunaPart = string | { formula: string } | { lacuna: number };
export type LacunaQuestion = {
  kind: 'lacuna';
  instrucao: string;
  frase: LacunaPart[];
  banco: string[];
  respostas: string[];
} & Feedback;

export type VFQuestion = { kind: 'vf'; afirmacao: string; resposta: boolean } & Feedback;

export type Question = QuizQuestion | LacunaQuestion | VFQuestion;

export const TAGS: Record<Question['kind'], string> = {
  quiz: 'ESCOLHA A CERTA',
  lacuna: 'COMPLETE A FRASE',
  vf: 'VERDADEIRO OU FALSO?',
};

export const XP_POR_ACERTO = 10;
export const XP_BONUS_MISSAO = 5;

export const mockMissao = {
  topico: 'Funções do 1º grau',
  numero: 3,
  questoes: [
    {
      kind: 'quiz',
      pergunta: 'Qual é a raiz dessa função?',
      formula: 'f(x) = 2x − 6',
      alternativas: ['x = −3', 'x = 3', 'x = 6', 'x = 2'],
      resposta: 1,
      acerto: '2·3 − 6 = 0',
      erro: { dica: 'Raiz é onde f(x) = 0. Iguala a zero e isola o x.', passos: ['2x − 6 = 0', '2x = 6', 'x = 3'] },
    },
    {
      kind: 'lacuna',
      instrucao: 'Arrasta a palavra pro lugar certo.',
      frase: ['Em ', { formula: 'f(x) = ax + b' }, ', o coeficiente ', { lacuna: 0 }, ' define a inclinação, e o ', { lacuna: 1 }, ' mostra onde a reta corta o eixo y.'],
      banco: ['a', 'b', 'x', 'zero', 'f(x)', 'raiz'],
      respostas: ['a', 'b'],
      acerto: 'a inclina, b corta o eixo y',
      erro: { dica: 'O a multiplica o x e muda a inclinação. O b é o valor de f(0).' },
    },
    {
      kind: 'vf',
      afirmacao: 'Toda função do 1º grau (a ≠ 0) tem exatamente uma raiz.',
      resposta: true,
      acerto: 'A reta cruza o eixo x uma vez',
      erro: { dica: 'Com a ≠ 0 a reta é inclinada, então cruza o eixo x em um único ponto.' },
    },
    {
      kind: 'quiz',
      pergunta: 'Qual é a raiz dessa função?',
      formula: 'f(x) = 3x + 9',
      alternativas: ['x = 3', 'x = −3', 'x = 9', 'x = −9'],
      resposta: 1,
      acerto: '3·(−3) + 9 = 0',
      erro: { dica: 'Raiz é onde f(x) = 0. Iguala a zero e isola o x.', passos: ['3x + 9 = 0', '3x = −9', 'x = −3'] },
    },
  ] as Question[],
};
