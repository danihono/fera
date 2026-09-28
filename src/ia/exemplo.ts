// Prova de exemplo (Funções do 1º grau), igual à do design. É o que o modo demonstração "gera"
// quando não há IA ligada, e a base dos testes da linha de montagem.
import type { Materiais, MissaoIA, Plano, QuestaoIA } from './tipos';

const T = {
  forma: 'Forma f(x) = ax + b',
  coef: 'Coeficientes a e b',
  raiz: 'Raiz da função',
  sinal: 'Crescente ou decrescente',
  grafico: 'Gráfico e sinal',
};

export const planoExemplo: Plano = {
  titulo: 'Funções do 1º grau',
  materia: 'Matemática',
  resumoDoMaterial: 'Anotações do caderno sobre função afim: forma geral, coeficientes, raiz, crescimento e estudo do sinal.',
  conteudoBase: `FUNÇÃO DO 1º GRAU (função afim)
Forma geral: f(x) = ax + b, com a e b reais e a ≠ 0.
a = coeficiente angular (taxa de variação): quanto y muda quando x aumenta 1.
b = coeficiente linear: onde a reta corta o eixo y; f(0) = b.
Gráfico: sempre uma reta.
Raiz (zero): valor de x com f(x) = 0 → ax + b = 0 → x = −b/a.
Ex.: f(x) = 2x − 6 → 2x − 6 = 0 → x = 3.
Crescimento: a > 0 → crescente; a < 0 → decrescente.
Estudo do sinal: a > 0 → f(x) > 0 para x > raiz; a < 0 → f(x) > 0 para x < raiz.
Exercícios do caderno: raiz de f(x) = 3x + 9 (x = −3); lei do táxi: R$ 5 + R$ 2 por km → f(x) = 2x + 5.`,
  topicos: [
    {
      nome: T.forma,
      essencial: 'Toda função do 1º grau tem o formato f(x) = ax + b, com a ≠ 0.',
      comoCai: 'Identificar a lei ou montar a lei a partir de uma situação.',
      pegadinha: 'Esquecer que o a não pode ser zero: aí não é do 1º grau.',
    },
    {
      nome: T.coef,
      essencial: 'O a é a inclinação (taxa de variação); o b é onde a reta corta o eixo y.',
      comoCai: 'Ler a e b numa lei, num gráfico ou numa tabela.',
      pegadinha: 'Achar que o b é onde a reta corta o eixo x.',
    },
    {
      nome: T.raiz,
      essencial: 'A raiz é o x que faz f(x) = 0: x = −b ÷ a.',
      comoCai: 'Calcular a raiz ou achar onde o gráfico cruza o eixo x.',
      pegadinha: 'Perder o sinal de menos em −b ÷ a.',
    },
    {
      nome: T.sinal,
      essencial: 'Se a > 0 a função cresce; se a < 0, decresce.',
      comoCai: 'Dizer se cresce olhando a lei ou o gráfico.',
      pegadinha: 'Olhar o sinal do b em vez do sinal do a.',
    },
    {
      nome: T.grafico,
      essencial: 'O gráfico é uma reta e muda de sinal na raiz.',
      comoCai: 'Estudo do sinal: para que valores de x a função é positiva.',
      pegadinha: 'Inverter os lados do estudo do sinal quando a < 0.',
    },
  ],
  avisos: [],
  foraDoTema: false,
};

export const materiaisExemplo: Materiais = {
  resumo: {
    intro: 'Função do 1º grau é toda função no formato f(x) = ax + b, com a ≠ 0. O gráfico é sempre uma reta.',
    destaque: 'f(x) = ax + b',
    blocos: [
      { rotulo: 'a', titulo: 'Coeficiente angular', texto: 'Diz a inclinação da reta: quanto o y muda quando o x aumenta 1. Quanto maior, mais em pé.' },
      { rotulo: 'b', titulo: 'Coeficiente linear', texto: 'É onde a reta corta o eixo y (o valor de f(0)).' },
      { rotulo: 'x₀', titulo: 'Raiz: x = −b ÷ a', texto: 'É o x que faz f(x) = 0: onde a reta cruza o eixo x.' },
      { rotulo: null, titulo: 'Gráfico é uma reta', texto: 'Dois pontos bastam pra desenhar: o (0, b) e a raiz.' },
    ],
    comparacao: [
      { quando: 'a > 0', diz: 'crescente ↗' },
      { quando: 'a < 0', diz: 'decrescente ↘' },
    ],
    lembrar: ['a nunca é zero', 'b é o "chute inicial" no eixo y', 'raiz: iguala a zero e isola o x'],
    pegadinhas: ['O b não é a raiz: ele é onde a reta corta o eixo y, não o eixo x.', 'Quem decide se cresce é o sinal do a, não o do b.'],
  },
  explicacao: {
    chamada: 'Vamos achar a raiz de',
    exemplo: 'f(x) = 2x − 6',
    passos: [
      { titulo: 'Acha o a e o b', texto: 'Em 2x − 6, o a é 2 (o número colado no x) e o b é −6.', conta: 'a = 2 · b = −6' },
      { titulo: 'Iguala a zero', texto: 'A raiz é onde a função vale zero. Então troca f(x) por 0.', conta: '2x − 6 = 0' },
      { titulo: 'Isola o x', texto: 'Passa o −6 pro outro lado (vira +6) e divide por 2.', conta: '2x = 6 → x = 3' },
      { titulo: 'Confere', texto: 'Coloca o 3 no lugar do x. Se der zero, acertou.', conta: '2·3 − 6 = 0 ✓' },
    ],
    dica: 'Macete: a raiz sempre é −b dividido por a.',
  },
  mapa: {
    centro: 'Função do 1º grau',
    ramos: [
      { titulo: 'f(x) = ax + b', detalhe: 'A forma geral, sempre com a ≠ 0.' },
      { titulo: 'a: inclinação', detalhe: 'Quanto o y muda quando o x aumenta 1.' },
      { titulo: 'b: corta o eixo y', detalhe: 'É o valor de f(0), o ponto (0, b).' },
      { titulo: 'Raiz: x = −b/a', detalhe: 'Onde a reta cruza o eixo x: f(x) = 0.' },
      { titulo: 'Gráfico: reta', detalhe: 'Dois pontos bastam pra desenhar.' },
      { titulo: 'a > 0 cresce', detalhe: 'E se a < 0, a reta desce.' },
    ],
  },
  slides: {
    slides: [
      { titulo: 'Funções do 1º grau', texto: 'Tudo o que cai na prova, em 5 cards.', destaque: 'f(x) = ax + b' },
      { titulo: 'O "a" inclina', texto: 'É o coeficiente angular. a > 0 sobe, a < 0 desce.', destaque: 'a = inclinação' },
      { titulo: 'O "b" corta o y', texto: 'É o valor da função quando x = 0.', destaque: 'f(0) = b' },
      { titulo: 'Raiz', texto: 'Onde a reta cruza o eixo x. Iguala a zero e isola o x.', destaque: 'x = −b / a' },
      { titulo: 'Na prova', texto: 'Cai muito: achar a raiz, dizer se cresce e ler o gráfico.', destaque: 'Bora!' },
    ],
  },
  fluxo: {
    titulo: 'Como achar a raiz',
    etapas: [
      { tipo: 'inicio', texto: 'f(x) = ax + b', sub: 'começa aqui', seNao: null },
      { tipo: 'passo', texto: 'Troca f(x) por 0', sub: 'ax + b = 0', seNao: null },
      { tipo: 'pergunta', texto: 'O a é diferente de zero?', sub: null, seNao: { texto: 'Não é do 1º grau', sub: 'vira f(x) = b' } },
      { tipo: 'passo', texto: 'Isola o x', sub: 'x = −b / a', seNao: null },
      { tipo: 'fim', texto: 'Achou a raiz!', sub: 'confere: f(x) = 0', seNao: null },
    ],
  },
  grafico: {
    graficos: [
      {
        tipo: 'funcoes',
        titulo: 'Crescente × decrescente',
        explicacao: 'As duas retas cortam o eixo x no mesmo ponto (x = 3), mas uma sobe e a outra desce: quem manda é o sinal do a.',
        eixoX: 'x',
        eixoY: 'y',
        funcoes: [
          { expressao: '2*x - 6', rotulo: 'f(x) = 2x − 6', diz: 'a = 2 > 0 → cresce' },
          { expressao: '-x + 3', rotulo: 'g(x) = −x + 3', diz: 'a = −1 < 0 → decresce' },
        ],
        janela: { xMin: -1, xMax: 6, yMin: -7, yMax: 6 },
        pontos: [
          { x: 3, y: 0, rotulo: 'raiz x = 3' },
          { x: 0, y: -6, rotulo: 'b = −6' },
        ],
        dados: [],
        unidade: null,
        fonte: null,
      },
      {
        tipo: 'barras',
        titulo: 'A conta do táxi',
        explicacao: 'Bandeirada de R$ 5 mais R$ 2 por km: f(x) = 2x + 5. Cada km a mais soma sempre o mesmo valor: isso é função do 1º grau.',
        eixoX: 'km rodados',
        eixoY: 'preço',
        funcoes: [],
        janela: null,
        pontos: [],
        dados: [
          { rotulo: '1 km', valor: 7 },
          { rotulo: '2 km', valor: 9 },
          { rotulo: '3 km', valor: 11 },
          { rotulo: '4 km', valor: 13 },
          { rotulo: '5 km', valor: 15 },
        ],
        unidade: 'R$',
        fonte: 'Exemplo com números redondos',
      },
    ],
  },
  imagens: {
    imagens: [
      {
        titulo: 'O a é a inclinação da rampa',
        texto: 'Rampa mais em pé = a maior. Se a rampa desce, o a é negativo.',
        prompt: 'Friendly flat illustration of a small tiger cub walking up a straight ramp, warm coral and orange colors, light background, simple educational composition, no text, no letters, no numbers',
        url: 'exemplo:rampa',
      },
      {
        titulo: 'O b é onde a rampa começa',
        texto: 'Quando x = 0, a função vale b. É o ponto em que a reta encosta no eixo y.',
        prompt: 'Flat illustration of a straight line starting from a vertical wall with a highlighted dot where it touches the wall, warm coral colors, light background, no text, no letters, no numbers',
        url: 'exemplo:b',
      },
      {
        titulo: 'A raiz é onde a rampa cruza o chão',
        texto: 'O chão é o eixo x. No ponto em que a reta atravessa, f(x) = 0.',
        prompt: 'Flat illustration of a straight line crossing green ground with a highlighted crossing point and a happy tiger cub celebrating, warm colors, no text, no letters, no numbers',
        url: 'exemplo:raiz',
      },
    ],
  },
};

const quiz = (topico: string, enunciado: string, formula: string | null, alternativas: string[], correta: number, acerto: string, dica: string, passos: string[] = [], dificuldade: QuestaoIA['dificuldade'] = 'media'): QuestaoIA => ({
  tipo: 'quiz',
  topico,
  enunciado,
  formula,
  alternativas,
  correta,
  frase: null,
  respostas: [],
  distratores: [],
  verdadeira: null,
  acerto,
  dica,
  passos,
  dificuldade,
});

const vf = (topico: string, enunciado: string, verdadeira: boolean, acerto: string, dica: string, dificuldade: QuestaoIA['dificuldade'] = 'media'): QuestaoIA => ({
  tipo: 'vf',
  topico,
  enunciado,
  formula: null,
  alternativas: [],
  correta: null,
  frase: null,
  respostas: [],
  distratores: [],
  verdadeira,
  acerto,
  dica,
  passos: [],
  dificuldade,
});

const lacuna = (topico: string, frase: string, respostas: string[], distratores: string[], acerto: string, dica: string, dificuldade: QuestaoIA['dificuldade'] = 'media'): QuestaoIA => ({
  tipo: 'lacuna',
  topico,
  enunciado: 'Arrasta a palavra pro lugar certo.',
  formula: null,
  alternativas: [],
  correta: null,
  frase,
  respostas,
  distratores,
  verdadeira: null,
  acerto,
  dica,
  passos: [],
  dificuldade,
});

export const missoesExemplo: MissaoIA[] = [
  {
    titulo: 'O básico da função',
    foco: 'Reconhecer a forma f(x) = ax + b e achar o a e o b.',
    questoes: [
      quiz(T.coef, 'Qual é o coeficiente a?', 'f(x) = 5x − 2', ['5', '−2', '2', 'x'], 0, 'a é o número colado no x', 'O a é o número que multiplica o x. O b é o termo sozinho.', [], 'facil'),
      quiz(T.coef, 'Qual é o coeficiente b?', 'f(x) = −3x + 7', ['−3', '3', '7', '−7'], 2, 'b é o termo sem x: 7', 'O b é o número que aparece sozinho, sem x, com o sinal dele.', [], 'facil'),
      vf(T.forma, 'f(x) = 4 é uma função do 1º grau.', false, 'Sem x, o a vale 0', 'Do 1º grau precisa de a ≠ 0. Em f(x) = 4 não tem x: é uma função constante.', 'facil'),
      lacuna(T.coef, 'Em $f(x) = ax + b$, o coeficiente ___ define a inclinação, e o ___ mostra onde a reta corta o eixo y.', ['a', 'b'], ['x', 'zero', 'raiz', 'f(x)'], 'a inclina, b corta o eixo y', 'O a multiplica o x e muda a inclinação. O b é o valor de f(0).', 'facil'),
      quiz(T.forma, 'Quanto vale f(2)?', 'f(x) = 3x + 1', ['7', '6', '5', '9'], 0, '3·2 + 1 = 7', 'Troca o x por 2 e faz a conta: primeiro a multiplicação, depois a soma.', ['3·2 + 1', '6 + 1', '7'], 'facil'),
    ],
  },
  {
    titulo: 'Achando a raiz',
    foco: 'Calcular o x que faz f(x) = 0.',
    questoes: [
      quiz(T.raiz, 'Qual é a raiz dessa função?', 'f(x) = 2x − 6', ['x = −3', 'x = 6', 'x = 3', 'x = 2'], 2, '2·3 − 6 = 0', 'Raiz é onde f(x) = 0. Iguala a zero e isola o x.', ['2x − 6 = 0', '2x = 6', 'x = 3']),
      quiz(T.raiz, 'Qual é a raiz dessa função?', 'f(x) = 3x + 9', ['x = 3', 'x = −3', 'x = 9', 'x = −9'], 1, '3·(−3) + 9 = 0', 'Raiz é onde f(x) = 0. Iguala a zero e isola o x.', ['3x + 9 = 0', '3x = −9', 'x = −3']),
      lacuna(T.raiz, 'A raiz é o valor de ___ que faz a função valer ___.', ['x', 'zero'], ['y', 'um', 'b'], 'o x que zera a função', 'Raiz: troca f(x) por 0 e descobre o x.'),
      vf(T.raiz, 'A raiz de f(x) = 4x − 8 é x = 2.', true, '4·2 − 8 = 0 ✓', 'Iguala a zero: 4x − 8 = 0, então 4x = 8 e x = 2.'),
      quiz(T.raiz, 'Qual é a raiz dessa função?', 'f(x) = −2x + 10', ['x = 5', 'x = −5', 'x = 10', 'x = −10'], 0, '−2·5 + 10 = 0', 'Iguala a zero e isola o x. Cuidado com o sinal ao dividir por −2.', ['−2x = −10', 'x = 5']),
    ],
  },
  {
    titulo: 'Cresce ou decresce?',
    foco: 'Ler o sinal do a.',
    questoes: [
      quiz(T.sinal, 'Essa função é…', 'f(x) = −4x + 1', ['crescente', 'decrescente', 'constante', 'não é função'], 1, 'a = −4 < 0: a reta desce', 'Quem decide é o sinal do a. Negativo: a reta desce.'),
      vf(T.sinal, 'Em f(x) = 2x − 10, a função é decrescente porque o b é negativo.', false, 'Quem manda é o a, não o b', 'O sinal do b não muda a inclinação. Aqui a = 2 > 0, então ela cresce.'),
      quiz(T.sinal, 'Qual dessas funções é crescente?', null, ['f(x) = −x + 5', 'f(x) = 3 − 2x', 'f(x) = 0,5x − 4', 'f(x) = −7x'], 2, 'a = 0,5 > 0', 'Procura a que tem o número do x positivo. Cuidado: em 3 − 2x o a é −2.'),
      lacuna(T.sinal, 'Se $a > 0$, a função é ___; se $a < 0$, ela é ___.', ['crescente', 'decrescente'], ['constante', 'nula', 'positiva'], 'a positivo sobe, negativo desce', 'Pensa na rampa: a positivo é subida, a negativo é descida.'),
      quiz(T.sinal, 'Um celular perde R$ 150 de valor por ano. Essa função é…', 'V(t) = 1200 − 150t', ['crescente', 'constante', 'crescente só no início', 'decrescente'], 3, 'a = −150 < 0', 'O número que multiplica o t é −150: o valor cai a cada ano.'),
    ],
  },
  {
    titulo: 'Montando a lei',
    foco: 'Transformar situações do dia a dia em f(x) = ax + b.',
    questoes: [
      quiz(T.coef, 'Táxi: R$ 5 de bandeirada + R$ 2 por km. Qual é a lei?', null, ['f(x) = 5x + 2', 'f(x) = 2x + 5', 'f(x) = 7x', 'f(x) = 2x − 5'], 1, 'fixo é o b, por km é o a', 'O valor fixo é o b. O que multiplica pelos km é o a.'),
      quiz(T.forma, 'Quanto custa uma corrida de 8 km?', 'f(x) = 2x + 5', ['R$ 16', 'R$ 13', 'R$ 56', 'R$ 21'], 3, '2·8 + 5 = 21', 'Troca o x por 8: 2 vezes 8 é 16, mais 5 dá 21.', ['2·8 + 5', '16 + 5', '21']),
      vf(T.coef, 'A reta que passa por (0, 3) e (1, 5) é f(x) = 2x + 3.', true, 'f(0) = 3 e f(1) = 5 ✓', 'b = f(0) = 3. De x = 0 pra x = 1 o y subiu 2, então a = 2.'),
      quiz(T.coef, 'Qual é o a da reta que passa por (1, 4) e (3, 10)?', null, ['a = 2', 'a = 6', 'a = 3', 'a = 4'], 2, '(10 − 4) ÷ (3 − 1) = 3', 'O a é a variação do y dividida pela variação do x.', ['6 ÷ 2', 'a = 3'], 'dificil'),
      lacuna(T.coef, 'Numa conta de luz com taxa fixa, a taxa fixa é o ___ e o preço por kWh é o ___.', ['b', 'a'], ['x', 'raiz', 'zero'], 'fixo = b, por unidade = a', 'O que não depende do consumo é o b. O que multiplica o consumo é o a.'),
    ],
  },
  {
    titulo: 'Nível prova',
    foco: 'Questões no estilo da prova, com as pegadinhas.',
    questoes: [
      quiz(T.grafico, 'Para quais x a função é positiva?', 'f(x) = 2x − 8', ['x > 4', 'x < 4', 'x > −4', 'x < −4'], 0, 'raiz 4 e a > 0: positiva depois', 'Acha a raiz (x = 4). Como a > 0 a reta sobe: depois da raiz ela é positiva.', ['2x − 8 = 0', 'x = 4'], 'dificil'),
      quiz(T.grafico, 'Para quais x a função é positiva?', 'f(x) = −3x + 6', ['x > 2', 'x < 2', 'x > −2', 'x < −2'], 1, 'a < 0: positiva antes da raiz', 'Raiz em x = 2. Como a < 0 a reta desce: ela é positiva antes da raiz.', ['−3x + 6 = 0', 'x = 2'], 'dificil'),
      vf(T.coef, 'Se o gráfico de f(x) = ax + b passa pela origem, então b = 0.', true, 'f(0) = 0, então b = 0', 'Passar pela origem quer dizer f(0) = 0. E f(0) é sempre o b.'),
      quiz(T.forma, 'Plano: R$ 40 fixos + R$ 0,50 por minuto extra. Com R$ 55, quantos minutos extras?', '40 + 0,5x = 55', ['15', '27,5', '110', '30'], 3, '40 + 0,5·30 = 55', 'Tira o fixo: sobram R$ 15. Cada minuto custa 0,50, então 15 ÷ 0,5 = 30.', ['0,5x = 15', 'x = 30'], 'dificil'),
      lacuna(T.grafico, 'O gráfico de uma função do 1º grau é uma ___, que cruza o eixo x na ___.', ['reta', 'raiz'], ['parábola', 'origem', 'curva'], 'reta que cruza o x na raiz', 'Função do 1º grau sempre dá reta. Ela cruza o eixo x onde f(x) = 0: a raiz.'),
    ],
  },
];

const todasQuiz = missoesExemplo.flatMap((m) => m.questoes.filter((q) => q.tipo === 'quiz'));

export const testeExemplo: MissaoIA = { titulo: 'Teste da prova', foco: 'Tudo o que cai, com correção comentada.', questoes: todasQuiz.slice(0, 10) };
export const simuladoExemplo: MissaoIA = { titulo: 'Simulado', foco: 'Estilo prova, do começo ao fim.', questoes: todasQuiz };
