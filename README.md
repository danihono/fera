# Fera 🐯

App de estudos gamificado: o aluno cadastra a prova, manda o conteúdo (foto, PDF ou texto) e a IA transforma em materiais — resumo, explicação, mapa mental, slides, gráficos, fluxograma, imagens — e em missões rápidas (quiz, teste, simulado), com o Rugi do lado até o dia da prova.

**Prévia no navegador:** https://danihono.github.io/fera/ (no computador aparece dentro de um celular; no celular abre direto).

**Fonte do design:** canvas "Fera — App de estudos" (Claude Design), em `design/`. As telas 01–13 são tradução 1:1 dos artboards; nada de valor solto — cores, fontes e medidas vêm de `src/theme/`. Regras completas em `CLAUDE.md`.

## Abrir no celular (Expo Go)

1. Instale o **Expo Go** no celular (App Store / Google Play).
2. No computador:
   ```bash
   npm install
   npx expo start
   ```
3. Escaneie o QR code que aparece no terminal (iPhone: pela câmera; Android: pelo próprio Expo Go).
   Celular e computador precisam estar na mesma rede Wi-Fi. Se não der, use `npx expo start --tunnel`.

Todas as bibliotecas do projeto já vêm no Expo Go (SDK 57), então não precisa de build nativo pra testar.

## Outros comandos

```bash
npx expo start --web            # versão web, pra comparar com o design
npx expo export --platform web  # build web (o GitHub Pages publica sozinho a cada push na main)
npx tsc --noEmit && npx expo lint   # antes de subir
```

## Estrutura

```
src/
  app/                    rotas (Expo Router)
    index.tsx             01 · Splash
    onboarding/           02a–c · Rugi, matéria, data
    (tabs)/               03 Início · Provas · 10 Turma · 12 Perfil
    prova/                04 Nova prova · formatos · 05 Gerando · materiais
    material/[tipo].tsx   materiais gerados (resumo, slides, mapa…)
    missao/               06 Quiz/Lacuna/VF + 07 Acerto/Erro · 08 Fim
    streak.tsx · vespera/ · premium.tsx · configuracoes.tsx · conquistas.tsx
  components/             FeraButton, TabBar, Rugi, sheets, missao/, materiais/, icons…
  data/                   store.ts (estado salvo no aparelho) + dados de exemplo
  lib/                    anim (loops/keyframes), datas, navegação, moldura web
  theme/                  tokens do design system
web/index.html            página da moldura de celular do site
design/                   telas do canvas (.dc.html) e Fera-telas.pdf
```

## Status

| Parte | Status |
| --- | --- |
| Telas 01–13 do design | ✅ iguais ao PDF (conferidas em 390 × 844) |
| Aba Provas, Configurações, Conquistas, escolha de formatos, materiais | 🧪 prévia montada com o design system — falta desenhar no canvas |
| Estado (onboarding, prova, XP, Fera+, formatos) | 🧪 salvo no aparelho; falta backend |
| Geração por IA | 🧪 conteúdo de exemplo (Funções do 1º grau) |
| Pagamento Fera+ | 🧪 compra simulada, preços de exemplo |

## Próximos passos

1. Testar no celular (Expo Go) e ajustar o que for diferente da web.
2. Firebase: login, dados do usuário, provas e progresso.
3. Captura do conteúdo (câmera, PDF, texto) e a função de IA que gera trilha, materiais e questões.
4. Regras do jogo: trilha que libera missões, sequência, vidas, nível, véspera automática.
5. Notificações, sons/vibração, compra do Fera+ e convite por link.
