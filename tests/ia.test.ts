// Linha de montagem da IA com motores de mentira: node --test via tsx (npm run test:ia).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { motorDemo, modeloDemo } from '../src/ia/demo';
import { ESQUEMAS } from '../src/ia/esquema';
import { avaliar } from '../src/ia/expressao';
import { missoesExemplo } from '../src/ia/exemplo';
import * as N from '../src/ia/normalizar';
import { ErroGeracao, gerarProva, type ModeloIA, type Motor } from '../src/ia/pipeline';
import { paraTela, partesDaFrase, revisorConcorda } from '../src/ia/questoes';
import type { PedidoGeracao, QuestaoIA } from '../src/ia/tipos';

const pedido: PedidoGeracao = {
  materia: 'Matemática',
  topico: '',
  serie: '2º ano (EM)',
  diasAte: 3,
  minutosDia: 10,
  formatos: ['resumo', 'grafico', 'fluxo', 'imagens', 'teste'],
  anexos: [{ tipo: 'texto', texto: 'f(x) = ax + b ...' }],
};

test('calculadora das funções', () => {
  assert.equal(avaliar('2*x - 6', 3), 0);
  assert.equal(avaliar('2x − 6', 4), 2);
  assert.equal(avaliar('f(x) = x² - 4x + 3', 1), 0);
  assert.equal(avaliar('-x^2', 3), -9);
  assert.equal(avaliar('2^-1', 0), 0.5);
  assert.equal(avaliar('3(x+1)', 1), 6);
  assert.ok(Math.abs(avaliar('sin(pi*x/2)', 1)! - 1) < 1e-9);
  assert.ok(Math.abs(avaliar('sqrt x', 9)! - 3) < 1e-9);
  assert.equal(avaliar('0,5x + 1', 2), 2);
  assert.equal(avaliar('sqrt(x)', -1), null);
  assert.equal(avaliar('x +* 2', 1), null);
  assert.equal(avaliar('alert(1)', 1), null);
});

test('esquemas: todo objeto fechado e com todos os campos obrigatórios', () => {
  const visita = (s: unknown, caminho: string) => {
    if (!s || typeof s !== 'object') return;
    const o = s as Record<string, unknown>;
    if (o.type === 'object') {
      assert.equal(o.additionalProperties, false, caminho);
      assert.deepEqual([...(o.required as string[])].sort(), Object.keys(o.properties as object).sort(), caminho);
    }
    for (const k of ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems']) assert.ok(!(k in o), `${caminho} usa ${k}`);
    for (const [k, v] of Object.entries(o)) visita(v, `${caminho}.${k}`);
  };
  for (const [t, s] of Object.entries(ESQUEMAS)) visita(s, t);
});

test('prova de exemplo: tudo válido e revisor concorda com o gabarito', async () => {
  const progresso: number[] = [];
  const prova = await gerarProva(pedido, { ...motorDemo(0), espera: async () => {} }, (p) => progresso.push(p.pct));
  assert.equal(prova.missoes.length, 5);
  assert.ok(prova.missoes.every((m) => m.questoes.length === 5));
  assert.deepEqual(Object.keys(prova.materiais).sort(), ['fluxo', 'grafico', 'imagens', 'resumo']);
  assert.equal(prova.teste?.questoes.length, 10);
  assert.deepEqual(prova.revisao, { conferidas: 35, corrigidas: 0, removidas: 0 });
  assert.equal(progresso.at(-1), 100);
  assert.ok(progresso.every((p, i) => i === 0 || p >= progresso[i - 1]), 'progresso nunca volta');
  // As questões convertem pras telas.
  const telas = prova.missoes.flatMap((m) => m.questoes.map(paraTela));
  const lacunas = telas.filter((t) => t.kind === 'lacuna');
  assert.ok(lacunas.every((l) => l.kind === 'lacuna' && l.respostas.every((r) => l.banco.includes(r))));
});

test('frase da lacuna vira partes', () => {
  assert.deepEqual(partesDaFrase('Em $f(x) = ax + b$, o ___ inclina e o ___ corta.'), ['Em ', { formula: 'f(x) = ax + b' }, ', o ', { lacuna: 0 }, ' inclina e o ', { lacuna: 1 }, ' corta.']);
});

test('revisor: compara letra, verdadeiro/falso e palavras', () => {
  const [quiz, , vf, lacuna] = missoesExemplo[0].questoes;
  assert.ok(revisorConcorda(quiz, { indice: 1, resposta: 'A', problema: null }));
  assert.ok(revisorConcorda(quiz, { indice: 1, resposta: 'A) 5', problema: null }));
  assert.ok(!revisorConcorda(quiz, { indice: 1, resposta: 'B', problema: null }));
  assert.ok(!revisorConcorda(quiz, { indice: 1, resposta: 'A', problema: 'ambígua' }));
  assert.ok(revisorConcorda(vf, { indice: 1, resposta: 'Falso', problema: null }));
  assert.ok(revisorConcorda(lacuna, { indice: 1, resposta: 'a | b', problema: null }));
  assert.ok(!revisorConcorda(lacuna, { indice: 1, resposta: 'b | a', problema: null }));
});

test('normalizador descarta questão quebrada e limpa Markdown', () => {
  const base = missoesExemplo[0].questoes[0];
  assert.equal(N.questao({ ...base, correta: 7 }), null);
  assert.equal(N.questao({ ...base, alternativas: ['1', '1', '2', '3'] }), null);
  assert.equal(N.questao({ ...base, alternativas: ['1', '2', '3'] }), null);
  assert.equal(N.questao({ ...missoesExemplo[0].questoes[3], respostas: ['a'] }), null);
  assert.equal(N.questao({ ...base, enunciado: '**Qual** é o `a`?' })?.enunciado, 'Qual é o a?');
  assert.equal(N.texto('uma frase bem comprida pra cortar no limite', 20), 'uma frase bem…');
});

test('revisão: divergência é corrigida e conferida de novo; se continuar errada, sai', async () => {
  const demo = modeloDemo(0);
  // O autor erra o gabarito da 1ª questão da 1ª missão; a correção devolve a certa.
  const errada: QuestaoIA = { ...missoesExemplo[0].questoes[0], correta: 1 };
  let correcoes = 0;
  const autor: ModeloIA = {
    id: 'autor',
    async gerar(p) {
      if (p.tarefa === 'missoes') {
        const r = (await demo.gerar(p)) as { missoes: typeof missoesExemplo };
        r.missoes[0].questoes[0] = errada;
        return r;
      }
      if (p.tarefa === 'correcao') {
        correcoes++;
        return { questoes: [missoesExemplo[0].questoes[0]] };
      }
      return demo.gerar(p);
    },
  };
  const motor: Motor = { modelo: () => autor, imagem: null, espera: async () => {} };
  const prova = await gerarProva({ ...pedido, formatos: ['resumo'] }, motor);
  assert.equal(correcoes, 1);
  assert.deepEqual(prova.revisao, { conferidas: 25, corrigidas: 1, removidas: 0 });
  assert.equal(prova.missoes[0].questoes[0].correta, 0);

  // Correção que não resolve: a questão sai.
  const teimoso: ModeloIA = {
    id: 'teimoso',
    async gerar(p) {
      if (p.tarefa === 'correcao') return { questoes: [errada] };
      return autor.gerar(p);
    },
  };
  const prova2 = await gerarProva({ ...pedido, formatos: ['resumo'] }, { modelo: (t) => (t === 'correcao' ? teimoso : autor), imagem: null, espera: async () => {} });
  assert.deepEqual(prova2.revisao, { conferidas: 25, corrigidas: 0, removidas: 1 });
  assert.equal(prova2.missoes[0].questoes.length, 4);
});

test('material fora do tema e sem anexo viram erro amigável', async () => {
  const demo = modeloDemo(0);
  const fora: ModeloIA = { id: 'x', gerar: async (p) => (p.tarefa === 'plano' ? { ...((await demo.gerar(p)) as object), foraDoTema: true } : demo.gerar(p)) };
  await assert.rejects(gerarProva(pedido, { modelo: () => fora, imagem: null, espera: async () => {} }), (e: unknown) => e instanceof ErroGeracao && e.codigo === 'fora-do-tema');
  await assert.rejects(gerarProva({ ...pedido, anexos: [] }, motorDemo(0)), (e: unknown) => e instanceof ErroGeracao && e.codigo === 'sem-conteudo');
});

test('material que falha vira aviso, não derruba a prova', async () => {
  const demo = modeloDemo(0);
  const falha: ModeloIA = { id: 'x', gerar: async (p) => (p.tarefa === 'fluxo' ? { etapas: [] } : demo.gerar(p)) };
  const prova = await gerarProva(pedido, { modelo: () => falha, imagem: null, espera: async () => {} });
  assert.ok(!prova.materiais.fluxo);
  assert.ok(prova.avisos.some((a) => a.includes('fluxograma')));
});

test('limite de uso (429) vira erro de fila', async () => {
  const limite: ModeloIA = { id: 'x', gerar: async () => Promise.reject(Object.assign(new Error('Resource exhausted'), { status: 429 })) };
  await assert.rejects(gerarProva(pedido, { modelo: () => limite, imagem: null, espera: async () => {} }), (e: unknown) => e instanceof ErroGeracao && e.codigo === 'limite');
});
