// Testes com os emuladores do Firebase (npm run test:emuladores):
// regras do Firestore e a Cloud Function gerando uma prova de ponta a ponta (IA simulada: FERA_IA_MOCK=1).
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const PROJETO = 'demo-fera';
const HOST = '127.0.0.1';
let env: RulesTestEnvironment;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: { host: HOST, port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(async () => {
  await env.cleanup();
});

test('regras: cada um só mexe no que é seu', async () => {
  const ana = env.authenticatedContext('ana').firestore();
  const bia = env.authenticatedContext('bia').firestore();
  const anonimo = env.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(ana, 'usuarios/ana'), { estado: { xp: 10 }, atualizadoEm: 1 }));
  await assertFails(setDoc(doc(ana, 'usuarios/ana'), { estado: {}, admin: true })); // campo estranho
  await assertFails(getDoc(doc(bia, 'usuarios/ana')));
  await assertFails(setDoc(doc(bia, 'usuarios/ana'), { estado: {} }));
  await assertFails(getDoc(doc(anonimo, 'usuarios/ana')));

  await assertSucceeds(setDoc(doc(ana, 'usuarios/ana/conteudos/p1'), { versao: 1 }));
  await assertFails(getDoc(doc(bia, 'usuarios/ana/conteudos/p1')));

  // Progresso da geração: só o servidor escreve.
  await assertFails(setDoc(doc(ana, 'usuarios/ana/geracoes/p1'), { status: 'pronta' }));
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'usuarios/ana/geracoes/p1'), { status: 'gerando' });
  });
  await assertSucceeds(getDoc(doc(ana, 'usuarios/ana/geracoes/p1')));
  await assertFails(getDoc(doc(bia, 'usuarios/ana/geracoes/p1')));
});

test('regras: turmas e ranking', async () => {
  const ana = env.authenticatedContext('ana').firestore();
  const bia = env.authenticatedContext('bia').firestore();
  const anonimo = env.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(ana, 'turmas/FERA-A1B'), { nome: '2º B', criadaPor: 'ana', criadaEm: 1 }));
  await assertFails(setDoc(doc(ana, 'turmas/qualquer'), { nome: 'x', criadaPor: 'ana', criadaEm: 1 })); // código fora do padrão
  await assertFails(setDoc(doc(bia, 'turmas/FERA-C2D'), { nome: 'x', criadaPor: 'ana', criadaEm: 1 })); // criando em nome de outro
  await assertFails(setDoc(doc(bia, 'turmas/FERA-A1B'), { nome: 'tomei', criadaPor: 'bia', criadaEm: 1 })); // não dá pra sobrescrever
  await assertFails(getDoc(doc(anonimo, 'turmas/FERA-A1B')));

  await assertSucceeds(setDoc(doc(bia, 'turmas/FERA-A1B/membros/bia'), { nome: 'Bia', inicial: 'B', xp: 30, atualizadoEm: 1 }));
  await assertFails(setDoc(doc(bia, 'turmas/FERA-A1B/membros/ana'), { nome: 'Ana', inicial: 'A', xp: 0, atualizadoEm: 1 })); // linha dos outros
  await assertFails(setDoc(doc(bia, 'turmas/FERA-A1B/membros/bia'), { nome: 'Bia', inicial: 'B', xp: -5, atualizadoEm: 1 }));
  await assertFails(setDoc(doc(bia, 'turmas/FERA-ZZZ/membros/bia'), { nome: 'Bia', inicial: 'B', xp: 1, atualizadoEm: 1 })); // turma que não existe
  // Foto miniatura: só data URI de imagem e pequena.
  await assertSucceeds(setDoc(doc(bia, 'turmas/FERA-A1B/membros/bia'), { nome: 'Bia', inicial: 'B', xp: 30, foto: 'data:image/jpeg;base64,/9j/4AAQ', atualizadoEm: 1 }));
  await assertFails(setDoc(doc(bia, 'turmas/FERA-A1B/membros/bia'), { nome: 'Bia', inicial: 'B', xp: 30, foto: 'https://exemplo.com/x.jpg', atualizadoEm: 1 }));
  await assertFails(setDoc(doc(bia, 'turmas/FERA-A1B/membros/bia'), { nome: 'Bia', inicial: 'B', xp: 30, foto: `data:image/jpeg;base64,${'A'.repeat(13000)}`, atualizadoEm: 1 }));
  await assertSucceeds(getDoc(doc(ana, 'turmas/FERA-A1B/membros/bia')));
  await assertSucceeds(deleteDoc(doc(bia, 'turmas/FERA-A1B/membros/bia')));
});

// ——— Cloud Function (modo qualidade) ———

async function loginAnonimo(): Promise<{ uid: string; token: string }> {
  const r = await fetch(`http://${HOST}:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  const j = (await r.json()) as { localId: string; idToken: string };
  return { uid: j.localId, token: j.idToken };
}

async function chamar(nome: string, token: string, data: unknown) {
  const r = await fetch(`http://${HOST}:5001/${PROJETO}/southamerica-east1/${nome}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data }),
  });
  return { status: r.status, corpo: (await r.json()) as { result?: unknown; error?: { status: string; details?: { codigo: string } } } };
}

const pedido = {
  materia: 'Matemática',
  topico: '',
  serie: '2º ano (EM)',
  diasAte: 3,
  minutosDia: 10,
  formatos: ['resumo', 'grafico'],
  anexos: [{ tipo: 'texto', texto: 'f(x) = ax + b' }],
};

test('function: apagarMeusDados leva o usuário inteiro, inclusive as gerações', async () => {
  const { uid, token } = await loginAnonimo();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `usuarios/${uid}`), { estado: { xp: 10 } });
    await setDoc(doc(db, `usuarios/${uid}/conteudos/p1`), { ok: true });
    await setDoc(doc(db, `usuarios/${uid}/geracoes/p1`), { status: 'pronta' });
  });
  const sem = await chamar('apagarMeusDados', '', {});
  assert.equal(sem.corpo.error?.status, 'UNAUTHENTICATED');
  const r = await chamar('apagarMeusDados', token, {});
  assert.equal(r.status, 200, JSON.stringify(r.corpo));
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const caminho of [`usuarios/${uid}`, `usuarios/${uid}/conteudos/p1`, `usuarios/${uid}/geracoes/p1`]) assert.equal((await getDoc(doc(db, caminho))).exists(), false, caminho);
  });
});

test('function: só Fera+ de verdade gera no modo qualidade (premium do app não vale)', async () => {
  const { uid, token } = await loginAnonimo();
  // O app consegue escrever estado.premium, mas o servidor não confia nele.
  await setDoc(doc(env.authenticatedContext(uid).firestore(), `usuarios/${uid}`), { estado: { premium: true } });
  const r = await chamar('gerarProva', token, { provaId: 'ptesteab', pedido });
  assert.equal(r.corpo.error?.status, 'PERMISSION_DENIED');
  const sem = await chamar('gerarProva', '', { provaId: 'ptesteab', pedido });
  assert.equal(sem.corpo.error?.status, 'UNAUTHENTICATED');
});

test('regras: assinatura e uso do projeto só o servidor escreve', async () => {
  const eu = env.authenticatedContext('bia').firestore();
  await assertFails(setDoc(doc(eu, 'assinaturas/bia'), { ativo: true }));
  await assertSucceeds(getDoc(doc(eu, 'assinaturas/bia')));
  await assertFails(getDoc(doc(eu, 'assinaturas/ana')));
  await assertFails(setDoc(doc(eu, 'sistema/uso-2026-01-01'), { geracoes: 0 }));
});

test('function: compra de teste ativa e cancela o Fera+; o teto do projeto segura as gerações', async () => {
  const { uid, token } = await loginAnonimo();
  const r = await chamar('assinarTeste', token, { plano: 'mensal' });
  assert.equal(r.status, 200, JSON.stringify(r.corpo));
  const eu = env.authenticatedContext(uid).firestore();
  const a = (await getDoc(doc(eu, `assinaturas/${uid}`))).data()!;
  assert.equal(a.ativo, true);
  assert.equal(a.plano, 'mensal');

  // Teto do dia atingido: nem Fera+ gera.
  const dia = new Date().toISOString().slice(0, 10);
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `sistema/uso-${dia}`), { geracoes: 1000 }));
  const cheio = await chamar('gerarProva', token, { provaId: 'pteto001', pedido });
  assert.equal(cheio.corpo.error?.status, 'RESOURCE_EXHAUSTED');
  assert.equal(cheio.corpo.error?.details?.codigo, 'limite');
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `sistema/uso-${dia}`), { geracoes: 0 }));

  const c = await chamar('cancelarAssinaturaTeste', token, {});
  assert.equal(c.status, 200, JSON.stringify(c.corpo));
  assert.equal((await getDoc(doc(eu, `assinaturas/${uid}`))).data()!.ativo, false);
  const depois = await chamar('gerarProva', token, { provaId: 'pteto002', pedido });
  assert.equal(depois.corpo.error?.status, 'PERMISSION_DENIED');
});

test('function: gera a prova, grava o progresso e o conteúdo; formato extra junta no mesmo conteúdo', async () => {
  const { uid, token } = await loginAnonimo();
  await env.withSecurityRulesDisabled((ctx) =>
    Promise.all([
      setDoc(doc(ctx.firestore(), `usuarios/${uid}`), { estado: { serie: '2º ano (EM)', provas: [{ id: 'pquali01', data: new Date(Date.now() + 3 * 86400000).toISOString(), minutosDia: 10 }] } }),
      setDoc(doc(ctx.firestore(), `assinaturas/${uid}`), { ativo: true, plano: 'anual', origem: 'teste' }),
    ]),
  );
  const invalido = await chamar('gerarProva', token, { provaId: '../x', pedido });
  assert.equal(invalido.corpo.error?.status, 'INVALID_ARGUMENT');

  const r = await chamar('gerarProva', token, { provaId: 'pquali01', pedido });
  assert.equal(r.status, 200, JSON.stringify(r.corpo));
  const eu = env.authenticatedContext(uid).firestore();
  const conteudo = (await getDoc(doc(eu, `usuarios/${uid}/conteudos/pquali01`))).data()!;
  assert.equal(conteudo.missoes.length, 5);
  assert.deepEqual(Object.keys(conteudo.materiais).sort(), ['grafico', 'resumo']);
  assert.equal(conteudo.revisao.conferidas, 25);
  const geracao = (await getDoc(doc(eu, `usuarios/${uid}/geracoes/pquali01`))).data()!;
  assert.equal(geracao.status, 'pronta');
  assert.equal(geracao.progresso.pct, 100);

  const extra = await chamar('gerarFormato', token, { provaId: 'pquali01', formato: 'fluxo' });
  assert.equal(extra.status, 200, JSON.stringify(extra.corpo));
  const depois = (await getDoc(doc(eu, `usuarios/${uid}/conteudos/pquali01`))).data()!;
  assert.deepEqual(Object.keys(depois.materiais).sort(), ['fluxo', 'grafico', 'resumo']);
  assert.equal(depois.missoes.length, 5);
});
