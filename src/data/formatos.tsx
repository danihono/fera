// Formatos de estudo que a IA gera a partir do conteúdo da prova (prévia — sem design no canvas).
import type { ReactNode } from 'react';
import {
  ChartIcon,
  ClipboardCheckIcon,
  FileIcon,
  FlowIcon,
  ImageIcon,
  MindMapIcon,
  QuizIcon,
  SlidesIcon,
  StepsIcon,
  TimerIcon,
} from '@/components/icons';

export type FormatoId = 'resumo' | 'explicacao' | 'mapa' | 'quiz' | 'slides' | 'grafico' | 'fluxo' | 'imagens' | 'teste' | 'simulado';

export type Formato = {
  id: FormatoId;
  nome: string;
  descricao: string;
  premium: boolean;
  /** Vira missão (trilha) em vez de um material pra ler. */
  pratica?: boolean;
  icone: (color: string) => ReactNode;
};

export const FORMATOS: Formato[] = [
  { id: 'resumo', nome: 'Resumo', descricao: 'O essencial em tópicos curtos', premium: false, icone: (c) => <FileIcon size={22} color={c} /> },
  { id: 'explicacao', nome: 'Explicação', descricao: 'Passo a passo, do zero', premium: false, icone: (c) => <StepsIcon color={c} /> },
  { id: 'mapa', nome: 'Mapa mental', descricao: 'Quadro pra organizar as ideias', premium: false, icone: (c) => <MindMapIcon color={c} /> },
  { id: 'quiz', nome: 'Quiz', descricao: 'Missões de 5 min na trilha', premium: false, pratica: true, icone: (c) => <QuizIcon color={c} /> },
  { id: 'slides', nome: 'Slides', descricao: 'Aula em cards pra passar o dedo', premium: true, icone: (c) => <SlidesIcon color={c} /> },
  { id: 'grafico', nome: 'Gráficos', descricao: 'Ver a matéria em números e curvas', premium: true, icone: (c) => <ChartIcon color={c} /> },
  { id: 'fluxo', nome: 'Fluxograma', descricao: 'O caminho da resolução em etapas', premium: true, icone: (c) => <FlowIcon color={c} /> },
  { id: 'imagens', nome: 'Imagens', descricao: 'Ilustrações que explicam', premium: true, icone: (c) => <ImageIcon color={c} /> },
  { id: 'teste', nome: 'Teste', descricao: 'Questões com correção comentada', premium: true, pratica: true, icone: (c) => <ClipboardCheckIcon size={22} color={c} /> },
  { id: 'simulado', nome: 'Simulado', descricao: 'Estilo prova, com tempo', premium: true, pratica: true, icone: (c) => <TimerIcon size={22} color={c} /> },
];

export const formato = (id: string) => FORMATOS.find((f) => f.id === id);

/** Quantos formatos dá pra escolher por prova. */
export const LIMITE_FORMATOS = { gratis: 2, premium: 4 };

/** "resumo e quiz", "slides, gráficos e teste". */
export const listaDeFormatos = (ids: string[]) => {
  const nomes = ids.map((id) => formato(id)?.nome.toLowerCase() ?? id);
  return nomes.length <= 1 ? (nomes[0] ?? '') : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
};
