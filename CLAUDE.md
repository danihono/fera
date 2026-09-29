@AGENTS.md

# Fera — regras do projeto

App de estudos gamificado (iOS + Android) com o mascote Rugi. Expo SDK 57, TypeScript, Expo Router, Firebase (em breve).

## O design é a especificação — "tem que ficar exatamente assim"

- Cada tela tem seu código-fonte em `design/telas/<Tela>.dc.html` (HTML com estilos inline, base 390 × 844). Esse arquivo é a fonte das medidas: tamanhos, espaçamentos, raios, fontes, pesos, cores e animações (`@keyframes`).
- `design/Fera-telas.pdf` mostra como cada tela deve ficar. `design/telas/DesignSystem.dc.html` tem o design system inteiro.
- Traduza 1:1 para React Native. Não "melhore", não simplifique, não invente elementos. Se algo não existe no design, pergunte.
- Nenhum valor solto: cores, fontes e medidas vêm de `src/theme/` (`colors`, `fonts`, `type`, `space`, `radius`, `sizes`, `solidShadow`). Se faltar um token, adicione no theme.
- Sombras do design são sólidas, sem blur (`box-shadow: 0 4px 0 <cor>`): use `boxShadow: solidShadow(cor)`. Botões e cards "afundam" 4px ao tocar e a sombra some.
- Elipses (sombra do Rugi no chão): use `<Ellipse>` de `src/components/Ellipse.tsx`, não `borderRadius`.
- Ícones: copie os paths SVG do `.dc.html` para `src/components/icons.tsx` (react-native-svg).
- Rugi: `<Rugi mood="..." width={...} />` — as 9 expressões estão em `assets/rugi/`.
- Topo das telas: `paddingTop: insets.top + sizes.topExtra` (o design usa 58 = 47 da status bar + 11). Margem lateral 20.
- Animações com react-native-reanimated, reproduzindo durações e curvas dos `@keyframes`.

## Mapa tela → arquivo

| Design | Rota |
| --- | --- |
| Main (01 Splash) | `src/app/index.tsx` ✅ |
| Onb1 (02a) | `src/app/onboarding/index.tsx` ✅ |
| Onb2 (02b Matéria) | `src/app/onboarding/materia.tsx` ✅ |
| Onb3 (02c Data) | `src/app/onboarding/data.tsx` ✅ |
| Home (03 Início) | `src/app/(tabs)/index.tsx` ✅ |
| NovaProva (04) | `src/app/prova/nova.tsx` ✅ |
| Gerando (05) | `src/app/prova/gerando.tsx` ✅ |
| Quiz, Lacuna, VF (06a–c) | `src/app/missao/[id].tsx` + `src/components/missao/` ✅ |
| Acerto, Erro (07a–b) | `src/components/missao/FeedbackSheet.tsx` ✅ |
| Fim (08) | `src/app/missao/fim.tsx` ✅ |
| Streak (09) | `src/app/streak.tsx` (modal) ✅ |
| Turma (10) | `src/app/(tabs)/turma.tsx` ✅ |
| Vespera (11) | `src/app/vespera/[provaId].tsx` ✅ |
| Perfil (12) | `src/app/(tabs)/perfil.tsx` ✅ |
| Premium (13 Fera+) | `src/app/premium.tsx` ✅ |
| TabBar | `src/components/TabBar.tsx` ✅ |

A aba Provas ainda não tem design.

### Telas extras (prévia, sem design no canvas)

Montadas só com o design system para dar uma ideia do app completo — substituir quando houver design:

| Tela | Rota | Entrada |
| --- | --- | --- |
| Provas (aba) | `src/app/(tabs)/provas.tsx` | tab bar |
| Detalhe da prova | `src/app/prova/[id].tsx` | provas da aba Provas |
| Configurações | `src/app/configuracoes.tsx` | engrenagem do Perfil |
| Minha conta | `src/app/conta/index.tsx` | avatar do Perfil, Configurações |
| Entrar · Criar conta · Esqueci a senha | `src/app/conta/entrar.tsx`, `criar.tsx`, `esqueci.tsx` | "Já tenho conta" (02a), Minha conta, cartão do Perfil |
| Trocar senha · Excluir conta | `src/app/conta/senha.tsx`, `excluir.tsx` | Minha conta |
| Exclusão de conta (pública) | `src/app/excluir-conta.tsx` | link das lojas (Google Play) |
| Ajuda · Termos/Privacidade · 404 | `src/app/ajuda.tsx`, `legal/[doc].tsx`, `+not-found.tsx` | Configurações, Criar conta |
| Todas as conquistas | `src/app/conquistas.tsx` | "Ver todas" do Perfil |
| Trocar/entrar em turma | sheets em `src/app/(tabs)/turma.tsx` | seletor de turma |
| Conferir o conteúdo | `src/app/prova/conteudo.tsx` | cards da Nova prova (04) |
| Escolha de formatos | `src/app/prova/formatos.tsx` | Conteúdo |
| Materiais da prova | `src/app/prova/materiais.tsx` | fim da Gerando, card da Início/Provas |
| Material (resumo, slides…) | `src/app/material/[tipo].tsx` + `src/components/materiais/` | Materiais |

Peças dessas telas: `Lista` (`Secao`/`Linha`), `Campo`, `Avatar`, `SerieSheet`, `DataSheet`, `Pilulas` (pílulas da Início/Turma com explicação), `SemInternet` (faixa no layout raiz) e `components/conta/ui.tsx`.

Conta (`src/data/conta.ts`) é opcional e só e-mail/senha: todo mundo começa anônimo; criar conta faz `linkWithCredential` (mesmo uid, nada se perde); entrar numa conta com progresso na nuvem troca o do aparelho (conta vazia herda o do aparelho); sair limpa o aparelho; excluir apaga nuvem + aparelho (+ `apagarMeusDados` nas Functions). Foto de perfil: `src/lib/fotoPerfil.ts` (256 px no estado, 72 px no ranking da turma, sem Storage).

Retenção: lembretes são notificações **locais** (`src/data/lembretes.ts` decide, puro e testado; `src/lib/notificacoes.ts` agenda e reagenda a cada mudança do estado; na web não tem). Missão `reforco` (`src/data/missoes.ts`, `topicosFracos`) volta nos tópicos com ≥ 40% de erro. Provas da turma: `turmas/{codigo}/provas/{id}` (conteúdo junto), `src/data/provasTurma.ts` importa pra lista da pessoa; convite por link `…/turma?codigo=FERA-XXX` (`src/lib/links.ts`).

Fera+: com Functions no ar, a assinatura é `assinaturas/{uid}` (só o servidor escreve; `src/data/assinatura.ts` acompanha). O `premium` do estado só vale como cache da tela.

Arquivos da Nova prova: `src/lib/arquivos.ts` (JS puro, testado em `tests/arquivos.test.ts`) lê imagem, PDF, Word, slides, planilha, ODF, ePub, HTML, RTF, legendas, texto, áudio/vídeo e .zip (inclusive zip dentro de zip); o que vira texto quase não pesa no limite de 14 MB.

Formatos (grátis e Fera+) ficam em `src/data/formatos.tsx`. Grátis escolhe até 2 formatos por prova, Fera+ até 4; o quiz (missões da trilha) sempre vem e não conta.

## IA e Firebase

- `src/ia/` é código puro (sem React Native), usado pelo app e pelas Cloud Functions (`functions/`, empacotado com esbuild). Só imports relativos lá dentro.
- Modos: demonstração (sem Firebase, prova de exemplo de `src/ia/exemplo.ts`), grátis (Firebase AI Logic + Gemini, `src/lib/iaGratis.ts`) e qualidade (Functions; `src/ia/rotas.ts` diz qual IA faz cada tarefa). Escolha em `src/data/geracao.ts`.
- Toda resposta da IA passa por `src/ia/normalizar.ts` (limites de tamanho da tela, gabarito coerente) e as questões por revisão independente. Mudou um esquema? Rode `npm run test:ia`.
- Chaves de IA só no Secret Manager das Functions. No app só vão as `EXPO_PUBLIC_*` (config pública do Firebase). Leia sempre `process.env.EXPO_PUBLIC_X` direto (o Expo só embute assim) e use `npx expo start --clear` depois de mudar o `.env.local`.
- Firestore: `usuarios/{uid}` (estado), `conteudos/{prova}`, `geracoes/{prova}` (só servidor escreve), `turmas/{codigo}/membros/{uid}`. Mudou as regras? Rode `npm run test:emuladores`.
- Passo a passo em `docs/COMO-LIGAR.md`; escolhas de IA e custos em `docs/IA.md`; lojas (ficha, prints, RevenueCat) em `docs/LOJAS.md`.

Também são prévia: preços do Fera+ (compra e cancelamento simulados), atalhos "Prévias" nas Configurações (Streak e Véspera), troféu do Dia D → Véspera, textos das sheets (`InfoSheet`), Termos e Política de privacidade (`src/data/legal.ts`, revisar com advogado).
O estado do app (onboarding, provas, progresso da trilha, XP, sequência, Fera+, turma, nome, foto, série) fica em `src/data/store.ts`, salvo no aparelho com AsyncStorage (localStorage na web) e espelhado no Firestore quando o Firebase está ligado (`src/data/nuvem.ts`). Sem conta, "Sair" apaga tudo (avisando e oferecendo criar conta); com conta, só limpa o aparelho.

Site (GitHub Pages): `/fera/` é a moldura de celular (`web/index.html`) e `/fera/app/` é o app (`baseUrl` no `app.json`). Dentro da moldura, `src/lib/webFrame.ts` simula as áreas seguras do iPhone (47/34).

Telas de altura fixa usam `<Rolavel>` (`src/components/Rolavel.tsx`) ou `flexGrow` no espaçador: no 390 × 844 nada muda, em celular baixo rolam em vez de cortar. Confira também em 375 × 667. Animações em loop usam `useLoop` / `kf` / `pingPong` de `src/lib/anim.ts`; curvas de easing ficam fora do componente (se mudarem de identidade a cada render, a animação reinicia).

Medidas de elementos com `border` e `height` **sem** `box-sizing: border-box` no `.dc.html` somam a borda à altura (ex.: pílula 64 + 2 × 2 = 68). Botões (`<button>`) já são border-box.

## Como conferir se ficou igual

1. `npx expo export --platform web` e sirva `dist/` (ou `npx expo start --web`).
2. Tire print em 390 × 844 (Playwright) e compare lado a lado com a página do PDF e com o `.dc.html` aberto no navegador.
3. Só marque a tela como pronta quando bater. Rode `npx tsc --noEmit` e `npx expo lint` antes de commitar.

## Rede

Se `npx expo install` falhar por rede, use `EXPO_OFFLINE=1 npx expo install <pacote>`.
