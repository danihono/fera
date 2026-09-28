// Motor de demonstração: "gera" a prova de exemplo sem chamar IA nenhuma. Usado quando o app não tem
// Firebase configurado (site de prévia) e nos testes. Passa pelas mesmas conferências da geração real.
import { materiaisExemplo, missoesExemplo, planoExemplo, simuladoExemplo, testeExemplo } from './exemplo';
import type { Motor, ModeloIA, PedidoIA } from './pipeline';
import { questaoSemGabarito } from './prompts';
import { bancoDa } from './questoes';
import type { QuestaoIA } from './tipos';

const LETRAS = ['A', 'B', 'C', 'D'];

const gabarito = (q: QuestaoIA) =>
  q.tipo === 'quiz' ? LETRAS[q.correta ?? 0] : q.tipo === 'vf' ? (q.verdadeira ? 'verdadeiro' : 'falso') : q.respostas.join(' | ');

/** Texto de cada questão como o revisor recebe (sem o número) → resposta certa. */
const RESPOSTAS = new Map(
  [...missoesExemplo.flatMap((m) => m.questoes)].map((q) => [questaoSemGabarito(q, 0, bancoDa(q)).replace(/^0\. /, ''), gabarito(q)]),
);

/** Revisor de mentira: acha cada questão pelo texto e responde o gabarito. */
function revisar(p: PedidoIA) {
  const pedido = p.partes.map((x) => ('texto' in x ? x.texto : '')).join('\n');
  const blocos = pedido.split('QUESTÕES:\n')[1]?.split(/\n\n(?=\d+\. \[)/) ?? [];
  return {
    vereditos: blocos.map((b) => {
      const m = /^(\d+)\. ([\s\S]*)$/.exec(b.trim());
      const indice = Number(m?.[1] ?? 0);
      const resposta = RESPOSTAS.get(m?.[2] ?? '');
      return { indice, resposta: resposta ?? '?', problema: resposta ? null : 'não reconheci a questão' };
    }),
  };
}

const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function modeloDemo(atrasoMs = 700): ModeloIA {
  return {
    id: 'exemplo',
    async gerar(p) {
      if (atrasoMs) await new Promise((r) => setTimeout(r, atrasoMs * (p.tarefa === 'plano' || p.tarefa === 'missoes' ? 2 : 1)));
      switch (p.tarefa) {
        case 'plano':
          return copia(planoExemplo);
        case 'missoes':
          return { missoes: copia(missoesExemplo) };
        case 'teste':
          return copia(testeExemplo);
        case 'simulado':
          return copia(simuladoExemplo);
        case 'revisao':
          return revisar(p);
        case 'correcao':
          return { questoes: [] };
        default:
          return copia(materiaisExemplo[p.tarefa]);
      }
    },
  };
}

export const motorDemo = (atrasoMs?: number): Motor => {
  const m = modeloDemo(atrasoMs);
  return { modelo: () => m, imagem: null, concorrencia: 3 };
};
