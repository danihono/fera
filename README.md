# Fera 🐯

App de estudos gamificado: o aluno cadastra a prova, manda o conteúdo (foto, PDF ou texto) e o Rugi transforma em missões rápidas até o dia da prova.

**Fonte do design:** canvas "Fera — App de estudos" (Claude Design). Cada tela aqui é tradução 1:1 do artboard correspondente. Nada de valor solto: cores, fontes e medidas vêm de `src/theme/`.

## Rodar

```bash
npm install
npx expo start        # abre no celular com o Expo Go (QR code)
npx expo start --web  # versão web pra comparar com o design
```

Antes de subir: `npx tsc --noEmit` e `npx expo lint`.

## Estrutura

```
src/
  app/                  rotas (Expo Router)
    index.tsx           01 · Splash
    onboarding/         02a · Onboarding — Rugi
    (tabs)/             03 Início · Provas · 10 Turma · 12 Perfil
    prova/nova.tsx      04 · Nova prova
  theme/                colors.ts · type.ts · spacing.ts (tokens do design system)
  components/           FeraButton · TabBar · Rugi · StatPill · icons · Ellipse
assets/rugi/            as 9 expressões do Rugi
```

## Status

| Tela | Status |
| --- | --- |
| 01 Splash | ✅ igual ao design |
| 02a Onboarding — Rugi | ✅ igual ao design |
| Tab bar | ✅ igual ao design |
| 02b Matéria, 02c Data | ⏳ |
| 03 Início (trilha) | ⏳ placeholder |
| 04 Nova prova, 05 Gerando | ⏳ |
| 06–08 Missão e feedback | ⏳ |
| 09–13 Engajamento, turma, conta | ⏳ |
| Provas (aba) | ✏️ falta desenhar no canvas |

## Próximos passos

1. Onboarding 02b e 02c
2. Home com a trilha (Home.dc.html)
3. Firebase (Auth, Firestore, Storage) e a Function `generateTrail`
