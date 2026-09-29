// Estudar uma prova que alguém da turma compartilhou: vira uma prova sua (com o conteúdo pronto, sem gastar geração).
import type { SubjectId } from '@/components/icons';
import type { FormatoId } from '@/ia/tipos';
import { salvarConteudo } from './conteudo';
import { modoIA } from './geracao';
import type { ProvaDaTurma } from './nuvem';
import { app, type ProvaSalva } from './store';
import { evento } from '@/lib/metricas';

export const origemDe = (codigo: string, provaId: string) => `${codigo}/${provaId}`;

/** Já está na lista da pessoa? (id da prova dela) */
export const provaImportada = (codigo: string, provaId: string) => app.get().provas.find((p) => p.origem === origemDe(codigo, provaId))?.id ?? null;

/** Traz a prova da turma pra lista da pessoa e deixa ela como a prova atual. */
export async function estudarProvaDaTurma(codigo: string, p: ProvaDaTurma) {
  const ja = provaImportada(codigo, p.id);
  if (ja) return app.setProvaAtual(ja);
  const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const s = app.get();
  const salva: ProvaSalva = {
    materia: p.materia,
    icone: p.icone as SubjectId,
    topico: p.topico,
    data: new Date(`${p.data}T00:00:00`),
    minutosDia: s.prova.minutosDia,
    formatos: Object.keys(p.conteudo.materiais ?? {}) as FormatoId[],
    id,
    modo: modoIA(s.premium),
    totalMissoes: p.conteudo.missoes.length,
    feitas: [],
    feitasEm: {},
    erros: {},
    acertos: 0,
    respondidas: 0,
    criadaEm: new Date().toISOString(),
    origem: origemDe(codigo, p.id),
  };
  await salvarConteudo(id, p.conteudo);
  app.adicionarProva(salva);
  evento('prova_da_turma_estudada');
}
