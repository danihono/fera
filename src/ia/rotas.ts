// Qual IA faz cada parte no modo qualidade (Fera+). Cada uma no que é melhor:
//   Gemini  lê fotos/PDF/letra à mão (multimodal, contexto enorme, barato) e confere o gabarito sem vê-lo
//           (um modelo de outra família pega erros que o autor não enxerga).
//   Claude  escreve: explica, resume, organiza em mapa/fluxo/slides e cria as questões (didática e raciocínio).
//   GPT Image ilustra (entra depois, a partir do roteiro que o Claude escreve).
// Gráficos: a IA manda expressões e números; quem desenha é o app (conta exata, nada de pixel inventado).
import type { Tarefa } from './tipos';

export type Provedor = 'claude' | 'gemini';

export const ROTAS: Record<Tarefa, Provedor> = {
  plano: 'gemini',
  resumo: 'claude',
  explicacao: 'claude',
  mapa: 'claude',
  slides: 'claude',
  fluxo: 'claude',
  grafico: 'claude',
  imagens: 'claude',
  missoes: 'claude',
  teste: 'claude',
  simulado: 'claude',
  revisao: 'gemini',
  correcao: 'claude',
};
