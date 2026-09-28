# A IA do Fera

Objetivo: o aluno manda a foto do caderno e **entende a matéria em 10 minutos**, com material certo, prático e no nível dele. Nada de conteúdo raso ou gabarito errado.

## Qual IA faz cada coisa (modo qualidade / Fera+)

| Parte | IA | Por quê |
| --- | --- | --- |
| Ler fotos, PDF, letra à mão, lousa | **Gemini** (Flash) | Multimodal forte, contexto enorme (PDF grande inteiro) e barato. Transcreve tudo e corrige erro do caderno. |
| Plano (tópicos, o que cai, pegadinhas) | **Gemini** | Sai junto da leitura, numa chamada só. |
| Resumo, explicação passo a passo | **Claude** | O melhor em didática: explica do zero, com exemplo e sem enrolar. |
| Mapa mental e fluxograma | **Claude** | Estrutura e raciocínio: organiza o assunto em ramos e caminhos de decisão. |
| Slides | **Claude** escreve, **o app desenha** | Os cards seguem o design do Fera (Rugi, cores, fontes). Slide feito por IA de imagem erra texto e sai sem identidade. |
| Gráficos | **Claude** manda as contas, **o app calcula e desenha** | A IA manda `2*x - 6`; o app calcula cada ponto. Conta exata, nada de gráfico "desenhado" errado. Dados reais só com fonte. |
| Ilustrações | **GPT Image** | O melhor em seguir o pedido. A imagem vem **sem texto** (IA de imagem erra letra); a explicação fica na legenda. |
| Questões (missões, teste, simulado) | **Claude** | Distratores tirados de erros reais de aluno, uma única certa, dica e passo a passo. |
| Conferir o gabarito | **Gemini** (outro "professor") | Resolve cada questão **sem ver o gabarito**. Um modelo de outra família pega erros que o autor não vê. |
| Corrigir o que o revisor contestou | **Claude**, e o Gemini confere de novo | Se ainda discordarem, a questão sai. |

A tabela está no código em `src/ia/rotas.ts`. Os modelos são configuráveis em `functions/.env`:
`FERA_MODELO_CLAUDE` (padrão `claude-opus-5`), `FERA_MODELO_CLAUDE_MATERIAIS` (opcional, ex. `claude-sonnet-5` só nos materiais), `FERA_MODELO_GEMINI` (`gemini-3.5-flash`), `FERA_MODELO_IMAGEM` (`gpt-image-2`) e `FERA_QUALIDADE_IMAGEM` (`low`/`medium`/`high`).

No **modo grátis** tudo roda no Gemini Flash pelo Firebase AI Logic, com a mesma linha de montagem e a mesma revisão (sem a rodada de correção, pra gastar menos pedidos). Sem ilustrações.

## Linha de montagem (`src/ia/pipeline.ts`)

1. **Ler e planejar** — transcrição fiel de todo o material + 3 a 6 tópicos, cada um com a ideia central, como cai e a pegadinha. Material que não é de estudo (selfie, meme) é recusado com aviso.
2. **Criar** — os formatos escolhidos e as 5 missões da trilha (5 questões cada: 3 quiz, 1 lacuna, 1 V/F; da mais fácil à nível ENEM), em paralelo. Tudo em JSON com esquema fixo (`src/ia/esquema.ts`).
3. **Conferir** — o normalizador (`src/ia/normalizar.ts`) limpa Markdown, corta o que não cabe na tela e descarta o que está quebrado (quiz sem 4 alternativas, alternativas repetidas, gabarito fora do lugar, lacuna sem resposta no banco…). Depois vem a **revisão independente** do gabarito.
4. **Ilustrar** — GPT Image, só no Fera+.

Se um formato falhar, a prova sai sem ele e o aluno pode gerar de novo nos Materiais. Se a IA estiver com fila (limite de uso), o app avisa e tenta de novo.

## Os prompts (`src/ia/prompts.ts`)

- **Um time de professores especialistas** em todas as matérias, que conhece BNCC, ENEM e vestibulares.
- **Correção acima de tudo**: nada de fato, data, fórmula ou número inventado; na dúvida, fica de fora. Erro no caderno é corrigido e avisado.
- **Fiel ao material** do aluno (é o que o professor dele vai cobrar), completando só pré-requisitos.
- **Prático**: frases curtas, exemplo do dia a dia, sem "neste resumo veremos". No nível da série escolhida em Configurações.
- **Pensando na prova**: o que mais cai, como a banca cobra, as pegadinhas.
- **Jeito de ensinar de cada matéria** (Matemática confere substituindo, Física começa pelo fenômeno e cuida das unidades, Química balanceia e usa IUPAC, História vai de causa a consequência sem anacronismo, Redação segue as 5 competências do ENEM…).
- Limites de tamanho de cada campo, pra caber na tela do celular.

O prompt de sistema é fixo (fica em cache nos provedores); o material da prova vai num bloco marcado pra cache, reaproveitado entre as chamadas da mesma prova.

## Custos (estimativa)

Preços por milhão de tokens: Claude Opus 5 US$ 5 entrada / US$ 25 saída; Claude Sonnet 5 US$ 2 / US$ 10. GPT Image 2 em 1024×1024: ~US$ 0,006 (low), ~US$ 0,053 (medium), ~US$ 0,211 (high). O raciocínio do modelo conta como saída.

Uma prova com 5 fotos, 2 formatos e as 5 missões, no modo qualidade:

| Parte | Estimativa |
| --- | --- |
| Gemini (leitura + revisão) | centavos |
| Claude Opus 5 (2 materiais + 25 questões, com raciocínio) | ~US$ 0,60–0,90 |
| 3 ilustrações (medium) | ~US$ 0,16 |
| **Total** | **~US$ 0,70–1,10 por prova** |

Com `FERA_MODELO_CLAUDE_MATERIAIS=claude-sonnet-5` os materiais custam ~60% menos (as questões continuam no Opus). Tudo no Sonnet 5 fica por volta de US$ 0,30–0,45. O limite por pessoa por dia é `FERA_LIMITE_DIA` (padrão 10).

Ideia pra baixar muito o custo: **prova da turma** — a mesma matéria gerada uma vez e compartilhada com a sala toda.

## Fallback de recusa

As chamadas do Claude vão com `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`): se o modelo recusar um pedido, a própria API tenta de novo num modelo reserva, na mesma chamada.
