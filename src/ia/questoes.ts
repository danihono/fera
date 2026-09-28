// Questões da IA ↔ questões das telas de missão (06a–c), e a conferência do revisor.
import type { QuestaoIA, Veredito } from './tipos';

/** Mesmos tipos de src/data/missao.ts, sem depender do app. */
export type LacunaParte = string | { formula: string } | { lacuna: number };
type Retorno = { topico: string; acerto: string; erro: { dica: string; passos?: string[] } };
export type QuestaoTela =
  | ({ kind: 'quiz'; pergunta: string; formula: string; alternativas: string[]; resposta: number } & Retorno)
  | ({ kind: 'lacuna'; instrucao: string; frase: LacunaParte[]; banco: string[]; respostas: string[] } & Retorno)
  | ({ kind: 'vf'; afirmacao: string; resposta: boolean } & Retorno);

/** Embaralha de um jeito que se repete (mesma questão → mesmo banco), pra tela e revisor verem a mesma ordem. */
export function embaralhar<T>(itens: T[], semente: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) h = Math.imul(h ^ semente.charCodeAt(i), 16777619);
  const out = [...itens];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = (h >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const bancoDa = (q: QuestaoIA) => embaralhar([...q.respostas, ...q.distratores], q.frase ?? q.enunciado);

/** "Em $f(x) = ax + b$, o ___ inclina" → ['Em ', {formula}, ', o ', {lacuna: 0}, ' inclina']. */
export function partesDaFrase(frase: string): LacunaParte[] {
  const partes: LacunaParte[] = [];
  let n = 0;
  for (const pedaco of frase.split(/(___|\$[^$]+\$)/)) {
    if (!pedaco) continue;
    if (pedaco === '___') partes.push({ lacuna: n++ });
    else if (pedaco.startsWith('$') && pedaco.endsWith('$') && pedaco.length > 2) partes.push({ formula: pedaco.slice(1, -1) });
    else partes.push(pedaco);
  }
  return partes;
}

export function paraTela(q: QuestaoIA): QuestaoTela {
  const base = { topico: q.topico, acerto: q.acerto, erro: { dica: q.dica, ...(q.passos.length ? { passos: q.passos } : {}) } };
  switch (q.tipo) {
    case 'quiz':
      return { kind: 'quiz', pergunta: q.enunciado, formula: q.formula ?? '', alternativas: q.alternativas, resposta: q.correta ?? 0, ...base };
    case 'vf':
      return { kind: 'vf', afirmacao: q.enunciado, resposta: q.verdadeira ?? true, ...base };
    case 'lacuna':
      return { kind: 'lacuna', instrucao: q.enunciado, frase: partesDaFrase(q.frase ?? ''), banco: bancoDa(q), respostas: q.respostas, ...base };
  }
}

const LETRAS = ['A', 'B', 'C', 'D'];
const limpa = (s: string) =>
  s
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/** O revisor chegou na mesma resposta do gabarito e não viu problema? */
export function revisorConcorda(q: QuestaoIA, v: Veredito): boolean {
  if (v.problema) return false;
  const r = v.resposta.trim();
  switch (q.tipo) {
    case 'quiz': {
      const letra = /^[\s(]*([A-Da-d])\b/.exec(r)?.[1]?.toUpperCase();
      return letra != null && LETRAS.indexOf(letra) === q.correta;
    }
    case 'vf': {
      const t = limpa(r);
      const disse = t.startsWith('verdade') || t === 'v' ? true : t.startsWith('fals') || t === 'f' ? false : null;
      return disse === q.verdadeira;
    }
    case 'lacuna': {
      const palavras = r.split('|').map(limpa);
      return palavras.length === q.respostas.length && q.respostas.every((w, i) => limpa(w) === palavras[i]);
    }
  }
}
