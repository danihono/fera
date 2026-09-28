// Dados de exemplo iguais aos do design, até o Firebase entrar.
export const mockUser = {
  nome: 'Maju Lima',
  inicial: 'M',
  usuario: '@maju.fera',
  turma: '2º B',
  tituloNivel: 'Fera em treino',
  xpTotal: 8420,
  provasFeitas: 6,
  streak: 12,
  xp: 1240,
  lives: 5,
  recordeStreak: 12,
  nivel: 7,
  xpNivel: 780,
  xpProximoNivel: 1000,
};

export const mockProva = {
  materia: 'Matemática',
  topico: 'Funções do 1º grau',
  data: new Date(2026, 8, 28), // seg, 28 set
  diasFaltando: 3,
  missoesFeitas: 4,
  missoesTotal: 12,
  minutosMissao: 4,
  missaoAtual: 3,
};

export type Colega = { nome: string; inicial: string; xp: number };

// Ranking da turma até a prova (Turma · 10). O índice 3 é você.
export const mockTurma = {
  nome: '2º B · Matemática',
  codigo: 'FERA-72K',
  subiuHoje: 2,
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

// Revisão da véspera (Véspera · 11): tópicos que você mais errou.
export const mockVespera = {
  questoes: 8,
  minutos: 5,
  topicos: [
    { nome: 'Raiz da função', erros: 2 },
    { nome: 'Crescente ou decrescente', erros: 2 },
    { nome: 'Coeficiente angular', erros: 1 },
  ],
};

// Aba Provas (sem design ainda — prévia): próximas e já feitas, além da prova atual.
export const mockProvas = {
  proximas: [
    { materia: 'Português', icone: 'portugues', topico: 'Interpretação de texto', emDias: 17 },
    { materia: 'História', icone: 'historia', topico: 'Revolução Francesa', emDias: 24 },
  ],
  feitas: [
    { materia: 'Biologia', icone: 'biologia', topico: 'Citologia', nota: '9,0', quando: 'há 5 dias' },
    { materia: 'Química', icone: 'quimica', topico: 'Tabela periódica', nota: '8,5', quando: 'há 2 semanas' },
    { materia: 'Inglês', icone: 'ingles', topico: 'Simple past', nota: '10', quando: 'há 1 mês' },
  ],
} as const;
