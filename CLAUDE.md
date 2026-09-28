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
| Configurações | `src/app/configuracoes.tsx` | engrenagem do Perfil |
| Todas as conquistas | `src/app/conquistas.tsx` | "Ver todas" do Perfil |
| Trocar/entrar em turma | sheets em `src/app/(tabs)/turma.tsx` | seletor de turma |
| Escolha de formatos | `src/app/prova/formatos.tsx` | cards da Nova prova (04) |
| Materiais da prova | `src/app/prova/materiais.tsx` | fim da Gerando, card da Início/Provas |
| Material (resumo, slides…) | `src/app/material/[tipo].tsx` + `src/components/materiais/` | Materiais |

Formatos (grátis e Fera+) ficam em `src/data/formatos.tsx`; conteúdo de exemplo em `src/data/materiais.ts`. Grátis escolhe até 2 formatos por prova, Fera+ até 4.

Também são prévia: preços do Fera+ (compra simulada), atalhos "Prévias" nas Configurações (Streak e Véspera), troféu do Dia D → Véspera, textos das sheets (`InfoSheet`).
O estado do app (onboarding feito, matéria/data, formatos, XP, Fera+, turma, nome) fica em `src/data/store.ts`, salvo no aparelho com AsyncStorage (localStorage na web). "Sair da conta" apaga.

Site (GitHub Pages): `/fera/` é a moldura de celular (`web/index.html`) e `/fera/app/` é o app (`baseUrl` no `app.json`). Dentro da moldura, `src/lib/webFrame.ts` simula as áreas seguras do iPhone (47/34).

Dados de exemplo (iguais aos do design) ficam em `src/data/` até o Firebase entrar. Animações em loop usam `useLoop` / `kf` / `pingPong` de `src/lib/anim.ts`; curvas de easing ficam fora do componente (se mudarem de identidade a cada render, a animação reinicia).

Medidas de elementos com `border` e `height` **sem** `box-sizing: border-box` no `.dc.html` somam a borda à altura (ex.: pílula 64 + 2 × 2 = 68). Botões (`<button>`) já são border-box.

## Como conferir se ficou igual

1. `npx expo export --platform web` e sirva `dist/` (ou `npx expo start --web`).
2. Tire print em 390 × 844 (Playwright) e compare lado a lado com a página do PDF e com o `.dc.html` aberto no navegador.
3. Só marque a tela como pronta quando bater. Rode `npx tsc --noEmit` e `npx expo lint` antes de commitar.

## Rede

Se `npx expo install` falhar por rede, use `EXPO_OFFLINE=1 npx expo install <pacote>`.
