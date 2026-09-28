// Conteúdo de exemplo dos materiais (Funções do 1º grau). Na versão real, a IA gera isto a partir do conteúdo enviado.
export const resumo = {
  intro: 'Função do 1º grau é toda função no formato f(x) = ax + b, com a ≠ 0. O gráfico é sempre uma reta.',
  formula: 'f(x) = ax + b',
  partes: [
    { termo: 'a', nome: 'coeficiente angular', texto: 'Diz a inclinação da reta. Quanto maior, mais em pé.' },
    { termo: 'b', nome: 'coeficiente linear', texto: 'É onde a reta corta o eixo y (o valor de f(0)).' },
  ],
  raiz: { titulo: 'Raiz (zero da função)', formula: 'x = −b / a', texto: 'É o x que faz f(x) = 0: onde a reta cruza o eixo x.' },
  sinal: [
    { quando: 'a > 0', diz: 'crescente ↗' },
    { quando: 'a < 0', diz: 'decrescente ↘' },
  ],
  lembrar: ['a nunca é zero', 'b é o "chute inicial" no eixo y', 'raiz: iguala a zero e isola o x'],
};

export const explicacao = {
  exemplo: 'f(x) = 2x − 6',
  passos: [
    { titulo: 'Acha o a e o b', texto: 'Em 2x − 6, o a é 2 (o número colado no x) e o b é −6.', conta: 'a = 2 · b = −6' },
    { titulo: 'Iguala a zero', texto: 'A raiz é onde a função vale zero. Então troca f(x) por 0.', conta: '2x − 6 = 0' },
    { titulo: 'Isola o x', texto: 'Passa o −6 pro outro lado (vira +6) e divide por 2.', conta: '2x = 6 → x = 3' },
    { titulo: 'Confere', texto: 'Coloca o 3 no lugar do x. Se der zero, acertou.', conta: '2·3 − 6 = 0 ✓' },
  ],
  dica: 'Macete: a raiz sempre é −b dividido por a.',
};

export const slides = [
  { titulo: 'Funções do 1º grau', texto: 'Tudo o que cai na prova, em 5 cards.', destaque: 'f(x) = ax + b' },
  { titulo: 'O "a" inclina', texto: 'É o coeficiente angular. a > 0 sobe, a < 0 desce.', destaque: 'a = inclinação' },
  { titulo: 'O "b" corta o y', texto: 'É o valor da função quando x = 0.', destaque: 'f(0) = b' },
  { titulo: 'Raiz', texto: 'Onde a reta cruza o eixo x. Iguala a zero e isola o x.', destaque: 'x = −b / a' },
  { titulo: 'Na prova', texto: 'Cai muito: achar a raiz, dizer se cresce e ler o gráfico.', destaque: 'Bora!' },
];

export const mapa = {
  centro: 'Função do 1º grau',
  ramos: ['f(x) = ax + b', 'a: inclinação', 'b: corta o eixo y', 'Raiz: x = −b/a', 'Gráfico: reta', 'a > 0 cresce'],
};
