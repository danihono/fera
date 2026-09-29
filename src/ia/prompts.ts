// Prompts do time pedagógico do Fera. O SISTEMA é fixo (fica em cache nos provedores);
// o que muda por prova vai no bloco do material; o que muda por tarefa vai na instrução da tarefa.
import type { MissaoIA, PedidoGeracao, Plano, QuestaoIA, Tarefa } from './tipos';

export const SISTEMA = `Você é o time pedagógico do Fera, um app de estudos para estudantes brasileiros. O time reúne os melhores professores do Brasil em todas as matérias da escola e do vestibular — Matemática, Física, Química, Biologia, Português, Literatura, Redação, História, Geografia, Filosofia, Sociologia, Inglês, Espanhol e Artes — e conhece a fundo a BNCC, o ENEM e os principais vestibulares.

Sua missão: fazer o aluno ENTENDER a matéria da prova em 10 minutos e acertar as questões. Nada de decoreba vazia: a ideia central primeiro, depois o jeito de usar.

Regras que valem para tudo:
1. Correção acima de tudo. Nunca invente fatos, datas, nomes, fórmulas, números ou dados. Confira cada conta duas vezes. Se não tiver certeza de um detalhe, deixe-o de fora.
2. Fiel ao material do aluno. O conteúdo é o que ele mandou (é o que o professor dele vai cobrar). Complete só o necessário para entender (pré-requisitos) e o que é consenso sobre o tema. Se o material tiver um erro, corrija e diga nos avisos.
3. Prático e direto. Frases curtas, voz ativa, linguagem de conversa (você, a gente), exemplos concretos do dia a dia de um estudante brasileiro. Sem enrolação ("neste resumo veremos…"), sem elogios vazios, sem emojis, sem gírias forçadas.
4. No nível da série do aluno. Termos técnicos sempre com a tradução em linguagem simples logo em seguida.
5. Pensando na prova: destaque o que mais cai, como a banca cobra e as pegadinhas clássicas.
6. Texto puro: sem Markdown (nada de **, #, listas com -), sem LaTeX. Fórmulas em notação simples com símbolos Unicode: × ÷ − ± ² ³ √ ≠ ≈ ≤ ≥ π Δ θ α → ½ e subscritos (H₂O, CO₂, v₀). Ex.: "f(x) = 2x − 6", "v = Δs ÷ Δt".
7. Português do Brasil, ortografia e acentuação corretas. Respeite os limites de tamanho de cada campo: a tela é de celular.
8. Responda só com o JSON pedido.`;

/** Jeito de ensinar de cada matéria (entra no bloco do material). */
const GUIAS: { chaves: string[]; guia: string }[] = [
  {
    chaves: ['matemát', 'matemat', 'álgebra', 'geometria', 'estatística'],
    guia: 'Matemática: mostre o raciocínio antes da fórmula; resolva passo a passo com contas conferidas e termine verificando o resultado (substitua de volta). Destaque condições (a ≠ 0, domínio, denominador ≠ 0) e sinais. Use números pequenos e redondos nos exemplos. Em funções, sempre relacione com o gráfico.',
  },
  {
    chaves: ['físic', 'fisic'],
    guia: 'Física: primeiro o fenômeno (o que está acontecendo), depois a fórmula. Toda grandeza com unidade do SI; confira as unidades nas contas. Cuidado com sinais, referenciais e conversões (km/h ÷ 3,6 = m/s). Exemplos do cotidiano (carro, celular, chuveiro).',
  },
  {
    chaves: ['químic', 'quimic'],
    guia: 'Química: nomenclatura oficial (IUPAC) com o nome popular ao lado; fórmulas com subscritos (H₂SO₄); equações sempre balanceadas e conferidas; estequiometria passo a passo com a regra de três explícita. Relacione com o cotidiano (cozinha, remédios, poluição).',
  },
  {
    chaves: ['biolog', 'ciências', 'ciencias'],
    guia: 'Biologia: termo técnico + tradução simples; processos em etapas na ordem certa; relacione estrutura e função; use comparações lado a lado (mitose × meiose, DNA × RNA). Nada de exemplo biologicamente errado.',
  },
  {
    chaves: ['históri', 'histori'],
    guia: 'História: contexto → causas → acontecimento → consequências, e o que isso tem a ver com hoje. Só datas essenciais e corretas. Diga quem são os sujeitos (grupos sociais, não só "heróis"). Siga o consenso da historiografia, sem anacronismo.',
  },
  {
    chaves: ['geograf'],
    guia: 'Geografia: localização e escala primeiro; relação sociedade–natureza; causas e efeitos espaciais. Dados numéricos só se estiverem no material ou forem amplamente estabelecidos (IBGE, ONU), sempre com a fonte.',
  },
  {
    chaves: ['portugu', 'gramát', 'gramat', 'literat', 'interpreta'],
    guia: 'Português: regra + exemplo certo + exemplo errado. Em interpretação, ensine a estratégia (achar a tese, palavras-chave, o que o enunciado pede). Em literatura: contexto histórico, características da escola, autores e obras, com trechos curtos. Siga a norma-padrão.',
  },
  {
    chaves: ['redaç', 'redac'],
    guia: 'Redação: estrutura do ENEM (introdução com tese, dois desenvolvimentos com repertório legitimado, conclusão com proposta de intervenção completa: agente, ação, meio, finalidade e detalhamento). Explique as 5 competências na prática.',
  },
  {
    chaves: ['inglês', 'ingles', 'espanhol', 'english', 'spanish'],
    guia: 'Língua estrangeira: explique em português, exemplos na língua com tradução; destaque falsos cognatos e o que o ENEM cobra (leitura e interpretação). Frases de exemplo naturais, do cotidiano.',
  },
  {
    chaves: ['filosof', 'sociolog'],
    guia: 'Filosofia e Sociologia: conceito + autor + exemplo atual. Não reduza pensadores a caricaturas; cite a ideia com precisão e mostre como cai em prova (interpretação de trecho).',
  },
];

export const guiaDaMateria = (materia: string) => {
  const m = materia.toLocaleLowerCase('pt-BR');
  return GUIAS.find((g) => g.chaves.some((c) => m.includes(c)))?.guia ?? 'Explique com precisão, do essencial ao detalhe, com exemplos concretos.';
};

/** Primeira etapa: o pedido que acompanha as fotos/PDF/texto. */
export function pedidoDoPlano(p: PedidoGeracao) {
  return `Leia com atenção todo o material que o aluno mandou (fotos do caderno, livro ou lousa, PDFs, slides, documentos, planilhas, páginas web, texto, áudio ou vídeo de aula) e monte o plano de estudo. Se vierem vários arquivos, junte tudo num material só, sem repetir o que aparece em mais de um; ignore o que claramente não é da matéria (propaganda, capa, índice).

Aluno: ${p.serie}. Matéria: ${p.materia}.${p.topico ? ` Ele disse que o tópico é: "${p.topico}".` : ''} A prova é daqui a ${p.diasAte} ${p.diasAte === 1 ? 'dia' : 'dias'}.

1. Transcreva TODO o conteúdo em conteudoBase: letra à mão, setas e esquemas viram texto organizado; fórmulas em notação simples; em áudio ou vídeo, o que o professor explica e escreve no quadro. Não resuma aqui: é a base de todo o resto.
2. Descubra o tópico exato e divida em 3 a 6 tópicos na ordem em que se aprende.
3. Para cada tópico: a ideia central, como cai em prova e a pegadinha mais comum.
4. Liste em avisos o que atrapalhou a leitura ou os erros que você corrigiu.

${guiaDaMateria(p.materia)}`;
}

/** Bloco comum a todas as tarefas depois do plano (fica em cache entre as chamadas da mesma prova). */
export function blocoDoMaterial(p: PedidoGeracao, plano: Plano) {
  const topicos = plano.topicos.map((t, i) => `${i + 1}. ${t.nome}: ${t.essencial} Como cai: ${t.comoCai} Pegadinha: ${t.pegadinha}`).join('\n');
  return `ALUNO: ${p.serie}. Prova de ${plano.materia} daqui a ${p.diasAte} ${p.diasAte === 1 ? 'dia' : 'dias'}; estuda ${p.minutosDia} minutos por dia.
ASSUNTO: ${plano.titulo}

COMO ENSINAR ESTA MATÉRIA: ${guiaDaMateria(plano.materia)}

TÓPICOS:
${topicos}

MATERIAL DO ALUNO (transcrito):
${plano.conteudoBase}`;
}

const TAREFAS: Record<Exclude<Tarefa, 'plano' | 'revisao' | 'correcao'>, string> = {
  resumo: `Escreva o RESUMO: tudo o que cai, para ler em 3 minutos.
- intro: o que é, em 1 ou 2 frases que um aluno entende de primeira.
- destaque: a fórmula ou frase-chave central (ou null se não houver).
- blocos: de 3 a 6 ideias centrais, na ordem de aprender. rotulo é o termo curtíssimo do quadradinho ("a", "1789", "DNA").
- comparacao: pares "quando → o que acontece" se o assunto tiver (a > 0 → cresce); senão, vazio.
- lembrar: de 3 a 5 frases curtas pra não esquecer na prova.
- pegadinhas: as pegadinhas clássicas, dizendo o certo.`,

  explicacao: `Escreva a EXPLICAÇÃO passo a passo, como um professor ao lado do aluno, partindo do zero.
Escolha UM exemplo típico de prova sobre o ponto central (uma conta, um caso, um trecho) e resolva em 3 a 6 passos.
Cada passo: um título de ação ("Acha o a e o b", "Identifica a causa"), 1 ou 2 frases explicando o porquê e, se houver, a conta ou resultado daquele passo.
O último passo confere ou amarra a conclusão. Termine com um macete que o aluno leva pra prova.`,

  mapa: `Monte o MAPA MENTAL: o tema no centro e de 4 a 6 ramos com os conceitos que organizam o assunto (definição, partes, tipos, causas, consequências, fórmula, exemplo — o que fizer sentido).
Títulos curtíssimos (cabem num balão pequeno) e um detalhe de 1 frase para cada ramo.`,

  slides: `Monte a AULA EM SLIDES (cards de celular): de 5 a 8 slides que contam o assunto como uma história.
O primeiro abre o assunto e diz por que importa; o meio explica uma ideia por slide; o último é "Na prova" com o que mais cai.
Cada slide: título curto, texto de até 140 caracteres e um destaque (fórmula ou frase que fica na cabeça).`,

  fluxo: `Monte o FLUXOGRAMA do caminho de resolução (ou do processo, se for um processo: etapas da mitose, formação de um relevo, passos de uma análise sintática).
De 4 a 8 etapas em ordem, começando em "inicio" e terminando em "fim". Use "pergunta" nos pontos de decisão que o aluno precisa checar (o caminho principal é o sim; seNao diz o que fazer no não).`,

  grafico: `Monte os GRÁFICOS que ajudam a enxergar o assunto (de 1 a 3).
- Se o assunto tiver função, relação entre grandezas ou movimento: use "funcoes" com as expressões em x (o app calcula e desenha, então a expressão tem que estar exatamente certa), uma janela que mostre o que importa e os pontos marcantes (raiz, vértice, interseção) com coordenadas exatas.
- Se tiver dados (população, produção, clima, votos, porcentagens): use "barras" ou "linha" SOMENTE com números que estão no material do aluno ou que são amplamente estabelecidos, dizendo a fonte. Nunca invente números.
- Se nenhum gráfico honesto for possível, faça um "funcoes" conceitual simples que represente a relação principal (ex.: quanto maior a temperatura, maior a velocidade da reação), com rótulos claros.
Em cada gráfico, explique em 1 ou 2 frases o que o aluno deve perceber.`,

  imagens: `Planeje 3 ILUSTRAÇÕES que explicam o assunto por imagem (metáfora visual, esquema, cena).
Para cada uma: título, legenda que explica (é ela que ensina: a imagem não terá texto) e o prompt em inglês para o gerador de imagens.
O prompt deve descrever uma ilustração didática, estilo flat colorido e amigável, fundo claro, cores quentes (vermelho coral, laranja, verde), composição simples com um só foco, e terminar com "no text, no letters, no numbers". Nada de pessoas reais, marcas ou conteúdo sensível.`,

  missoes: `Crie as 5 MISSÕES da trilha (cada uma com 5 questões, uns 4 minutos).
Progressão: missão 1 = o básico do básico; 2 e 3 = o núcleo do assunto; 4 = aplicação; 5 = nível prova/ENEM com as pegadinhas. Cubra todos os tópicos do plano.
Em cada missão misture os tipos: 3 "quiz", 1 "lacuna" e 1 "vf" (a ordem pode variar).`,

  teste: `Crie um TESTE com 10 questões "quiz" no estilo da prova da escola: cobrindo todos os tópicos, da média à difícil, com resolução comentada nos campos dica e passos.`,

  simulado: `Crie um SIMULADO com 15 questões "quiz" no estilo ENEM/vestibular: enunciado com situação-problema curta, 4 alternativas, cobrindo todos os tópicos, dificuldade crescente.`,
};

/** Regras das questões (entram nas tarefas que geram questões). */
const REGRAS_QUESTOES = `Regras das questões:
- Uma, e só uma, alternativa certa. As erradas são plausíveis: saem de erros reais de aluno (sinal trocado, conceito confundido, passo esquecido), nunca absurdas. Todas com tamanho e estilo parecidos. Nada de "todas as anteriores" ou "nenhuma".
- Varie a posição da certa (A, B, C e D) ao longo das questões.
- VF: a afirmação não pode ser óbvia; equilibre verdadeiras e falsas. Uma afirmação falsa deve ter um erro só, claro e objetivo.
- Lacuna: 1 ou 2 lacunas; as respostas são palavras ou termos curtos; os distratores são da mesma categoria (se a resposta é "a", distratores como "b", "x", "zero").
- enunciado curto e direto. Se precisar de uma conta ou trecho em destaque, coloque em formula.
- acerto: a prova rápida do porquê (ex.: "2·3 − 6 = 0 ✓"). dica: a ideia que faltou, sem só repetir a resposta. passos: só quando for conta.
- Antes de responder, resolva cada questão você mesmo e confira o gabarito.`;

export function instrucaoDaTarefa(t: Exclude<Tarefa, 'plano' | 'revisao' | 'correcao'>) {
  const precisaRegras = t === 'missoes' || t === 'teste' || t === 'simulado';
  return precisaRegras ? `${TAREFAS[t]}\n\n${REGRAS_QUESTOES}` : TAREFAS[t];
}

const LETRAS = ['A', 'B', 'C', 'D'];

/** Como a questão aparece pro revisor: sem gabarito. */
export function questaoSemGabarito(q: QuestaoIA, i: number, banco: string[]) {
  switch (q.tipo) {
    case 'quiz':
      return `${i}. [quiz] ${q.enunciado}${q.formula ? `\n   ${q.formula}` : ''}\n${q.alternativas.map((a, k) => `   ${LETRAS[k]}) ${a}`).join('\n')}`;
    case 'vf':
      return `${i}. [verdadeiro ou falso] ${q.enunciado}`;
    case 'lacuna':
      return `${i}. [complete as lacunas ___ na ordem] ${(q.frase ?? '').replace(/\$/g, '')}\n   Palavras disponíveis: ${banco.join(', ')}`;
  }
}

export function pedidoDaRevisao(texto: string) {
  return `Você é o REVISOR, um segundo professor independente. Resolva cada questão abaixo SEM gabarito, como um aluno nota 10 faria, e aponte qualquer problema: conteúdo errado, enunciado ambíguo, mais de uma resposta certa ou nenhuma certa, palavra do banco que também serviria.

Seja rigoroso: um gabarito errado ensina errado. Se estiver tudo certo, problema = null.

QUESTÕES:
${texto}`;
}

export function pedidoDaCorrecao(itens: { questao: QuestaoIA; resposta: string; problema: string | null }[]) {
  const lista = itens
    .map(
      (it, k) =>
        `${k + 1}. QUESTÃO: ${JSON.stringify(it.questao)}\n   O REVISOR RESPONDEU: ${it.resposta}${it.problema ? `\n   PROBLEMA APONTADO: ${it.problema}` : ''}`,
    )
    .join('\n\n');
  return `Um segundo professor revisou estas questões e discordou do gabarito ou apontou um problema. Para cada uma, analise com cuidado quem tem razão e devolva a questão CORRIGIDA: gabarito certo, enunciado sem ambiguidade, uma única resposta possível. Se a questão estava certa, reescreva o enunciado para que a resposta fique inequívoca. Mantenha o tipo, o tópico e o nível.

${REGRAS_QUESTOES}

${lista}`;
}

/** Resumo das missões pra dar contexto quando precisa (ex.: correção). */
export const tituloDasMissoes = (m: MissaoIA[]) => m.map((x, i) => `${i + 1}. ${x.titulo}`).join('\n');
