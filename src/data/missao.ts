// Tipos das questões das telas de missão (06a–c). As questões vêm da IA (src/data/missoes.ts).
export type Feedback = {
  /** Tópico do plano (pra contar os erros e montar a revisão da véspera). */
  topico?: string;
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
