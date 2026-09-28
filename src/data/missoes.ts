// Monta a lista de questões de cada missão a partir do que a IA gerou.
import { missoesExemplo } from '@/ia/exemplo';
import { paraTela } from '@/ia/questoes';
import type { ProvaGerada, QuestaoIA } from '@/ia/tipos';
import type { Question } from './missao';
import type { ProvaSalva } from './store';

export type MissaoTela = { titulo: string; subtitulo: string; numero: number | null; questoes: Question[] };

const REVISAO_MAX = 8;

/** id: "1"…"5" (trilha), "teste", "simulado" ou "revisao" (véspera). */
export function montarMissao(id: string, prova: ProvaSalva | null, conteudo: ProvaGerada | null): MissaoTela | null {
  // Sem prova gerada (prévias), usa a missão 3 de exemplo, como no design.
  const missoes = conteudo?.missoes ?? missoesExemplo;
  const topico = prova?.topico ?? 'Funções do 1º grau';
  const n = Number(id);
  if (Number.isInteger(n) && n >= 1) {
    const m = missoes[n - 1];
    if (!m) return null;
    return { titulo: m.titulo, subtitulo: `${topico} · Missão ${n}`, numero: n, questoes: m.questoes.map(paraTela) };
  }
  if (id === 'teste' || id === 'simulado') {
    const m = conteudo?.[id];
    if (!m) return null;
    return { titulo: m.titulo, subtitulo: `${topico} · ${id === 'teste' ? 'Teste' : 'Simulado'}`, numero: null, questoes: m.questoes.map(paraTela) };
  }
  if (id === 'revisao') {
    // Véspera: primeiro as questões dos tópicos em que a pessoa mais errou.
    const erros = prova?.erros ?? {};
    const todas = missoes.flatMap((m) => m.questoes);
    const peso = (q: QuestaoIA) => erros[q.topico] ?? 0;
    const escolhidas = [...todas]
      .map((q, i) => ({ q, i }))
      .sort((a, b) => peso(b.q) - peso(a.q) || b.i - a.i)
      .slice(0, REVISAO_MAX)
      .map((x) => x.q);
    return { titulo: 'Revisão da véspera', subtitulo: `${topico} · Revisão`, numero: null, questoes: escolhidas.map(paraTela) };
  }
  return null;
}
