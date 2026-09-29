// Quais notificações agendar (código puro, testado em tests/lembretes.test.ts). Quem agenda é src/lib/notificacoes.ts.
// Tudo é notificação local, recalculada sempre que o estado muda: estudou hoje → o lembrete de hoje some.

export type EntradaLembretes = {
  lembrete: boolean;
  /** "19:00" */
  hora: string;
  /** Último dia com missão (AAAA-MM-DD). */
  ultimoDia: string | null;
  streak: number;
  provas: { id: string; materia: string; data: Date }[];
};

export type Aviso = { id: string; quando: Date; titulo: string; texto: string; url: string };

const DIAS_DE_LEMBRETE = 7;
const MAX_AVISOS = 40; // o iOS guarda no máximo 64 agendadas

const dia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const noDia = (base: Date, somaDias: number, h: number, m: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + somaDias, h, m);

const FRASES = [
  'Bora de missão? 5 minutinhos e tá feito.',
  'O Rugi tá te esperando pra missão de hoje!',
  'Uma missão rapidinha e você fica mais perto de virar fera.',
  'Hoje ainda não teve missão. Bora?',
  'Cinco minutos agora valem mais que uma noite na véspera.',
  'Sua trilha tá parada. Bora andar uma casinha?',
  'Missão do dia liberada. Partiu?',
];

export function planejarLembretes(e: EntradaLembretes, agora: Date = new Date()): Aviso[] {
  if (!e.lembrete) return [];
  const [h, m] = e.hora.split(':').map(Number);
  const hoje = dia(agora);
  const ontem = dia(noDia(agora, -1, 0, 0));
  const estudouHoje = e.ultimoDia === hoje;
  const streak = e.ultimoDia === hoje || e.ultimoDia === ontem ? e.streak : 0;
  const avisos: Aviso[] = [];
  const futuro = (d: Date) => d.getTime() > agora.getTime();

  // Lembrete diário nos próximos 7 dias (hoje só se ainda não estudou).
  for (let i = 0; i < DIAS_DE_LEMBRETE; i++) {
    if (i === 0 && estudouHoje) continue;
    const quando = noDia(agora, i, h, m);
    if (!futuro(quando)) continue;
    const texto = i === 0 && streak > 0 ? `Sua sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'} tá esperando a missão de hoje.` : FRASES[(quando.getDate() + i) % FRASES.length];
    avisos.push({ id: `dia-${dia(quando)}`, quando, titulo: 'Hora da missão', texto, url: '/' });
  }

  // Resgate da sequência: 1h30 depois do lembrete (não antes de 20:30, não depois de 22:30), no dia em que ela corre risco.
  if (streak >= 2) {
    const minutos = Math.min(22 * 60 + 30, Math.max(20 * 60 + 30, h * 60 + m + 90));
    const quando = noDia(agora, estudouHoje ? 1 : 0, Math.floor(minutos / 60), minutos % 60);
    if (futuro(quando))
      avisos.push({ id: `sequencia-${dia(quando)}`, quando, titulo: `Sua sequência de ${streak} dias acaba hoje!`, texto: 'Faz uma missão rapidinha antes de dormir pra não zerar.', url: '/' });
  }

  // Véspera (18:00 do dia antes) e dia da prova (06:30).
  for (const p of e.provas) {
    const vespera = noDia(p.data, -1, 18, 0);
    if (futuro(vespera))
      avisos.push({ id: `vespera-${p.id}`, quando: vespera, titulo: `Amanhã é a prova de ${p.materia}!`, texto: 'Modo véspera liberado: revisão rapidinha do que mais cai.', url: `/vespera/${p.id}` });
    const diaD = noDia(p.data, 0, 6, 30);
    if (futuro(diaD)) avisos.push({ id: `prova-${p.id}`, quando: diaD, titulo: `Hoje é a prova de ${p.materia}`, texto: 'Você treinou pra isso. Bora, fera!', url: '/' });
  }

  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime()).slice(0, MAX_AVISOS);
}
