// Planejamento das notificações locais (npm test).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planejarLembretes, type EntradaLembretes } from '../src/data/lembretes';

// Segunda, 10h.
const AGORA = new Date(2026, 8, 28, 10, 0);
const base: EntradaLembretes = { lembrete: true, hora: '19:00', ultimoDia: null, streak: 0, provas: [] };

test('lembrete desligado: nada', () => {
  assert.deepEqual(planejarLembretes({ ...base, lembrete: false, provas: [{ id: 'p', materia: 'X', data: new Date(2026, 9, 2) }] }, AGORA), []);
});

test('7 dias de lembrete, começando hoje às 19:00', () => {
  const a = planejarLembretes(base, AGORA);
  assert.equal(a.length, 7);
  assert.equal(a[0].quando.getTime(), new Date(2026, 8, 28, 19, 0).getTime());
  assert.equal(a[6].quando.getDate(), 4); // 4 de outubro
});

test('estudou hoje: o de hoje some e o resgate da sequência vai pra amanhã', () => {
  const a = planejarLembretes({ ...base, ultimoDia: '2026-09-28', streak: 5 }, AGORA);
  assert.ok(!a.some((x) => x.id === 'dia-2026-09-28'));
  const resgate = a.find((x) => x.id.startsWith('sequencia'))!;
  assert.equal(resgate.quando.getTime(), new Date(2026, 8, 29, 20, 30).getTime());
  assert.match(resgate.titulo, /5 dias/);
});

test('não estudou hoje com sequência: lembrete fala da sequência e resgate é hoje', () => {
  const a = planejarLembretes({ ...base, ultimoDia: '2026-09-27', streak: 3, hora: '21:00' }, AGORA);
  assert.match(a[0].texto, /sequência de 3 dias/);
  const resgate = a.find((x) => x.id.startsWith('sequencia'))!;
  assert.equal(resgate.quando.getTime(), new Date(2026, 8, 28, 22, 30).getTime());
});

test('sequência quebrada (último estudo anteontem) não gera resgate', () => {
  const a = planejarLembretes({ ...base, ultimoDia: '2026-09-26', streak: 9 }, AGORA);
  assert.ok(!a.some((x) => x.id.startsWith('sequencia')));
});

test('prova: véspera às 18h (abre o modo véspera) e dia D às 6h30; passado não agenda', () => {
  const a = planejarLembretes({ ...base, provas: [{ id: 'p1', materia: 'História', data: new Date(2026, 9, 1) }, { id: 'p0', materia: 'Física', data: new Date(2026, 8, 20) }] }, AGORA);
  const v = a.find((x) => x.id === 'vespera-p1')!;
  assert.equal(v.quando.getTime(), new Date(2026, 8, 30, 18, 0).getTime());
  assert.equal(v.url, '/vespera/p1');
  assert.ok(a.some((x) => x.id === 'prova-p1'));
  assert.ok(!a.some((x) => x.id.endsWith('p0')));
  for (let i = 1; i < a.length; i++) assert.ok(a[i].quando >= a[i - 1].quando, 'em ordem');
});

test('já passou das 19h: o de hoje não entra', () => {
  const a = planejarLembretes(base, new Date(2026, 8, 28, 19, 30));
  assert.equal(a[0].quando.getDate(), 29);
});
