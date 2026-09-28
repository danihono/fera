// Turma de exemplo (a do design), usada no modo demonstração, sem Firebase.
export type Colega = { nome: string; inicial: string; xp: number };

// Ranking da turma até a prova (Turma · 10). O índice 3 é você.
export const mockTurma = {
  nome: '2º B · Matemática',
  codigo: 'FERA-72K',
  ranking: [
    { nome: 'Lari', inicial: 'L', xp: 1880 },
    { nome: 'João', inicial: 'J', xp: 1610 },
    { nome: 'Bia', inicial: 'B', xp: 1395 },
    { nome: 'Você', inicial: 'M', xp: 1240 },
    { nome: 'Pedro', inicial: 'P', xp: 1105 },
    { nome: 'Duda', inicial: 'D', xp: 980 },
  ] as Colega[],
  voce: 3,
};
