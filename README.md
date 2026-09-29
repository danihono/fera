# Fera 🐯

App de estudos gamificado: o aluno cadastra a prova, manda o conteúdo (foto, PDF, Word, slides, planilha, página web, áudio, texto — vários de uma vez ou um .zip com tudo) e a IA transforma em materiais — resumo, explicação, mapa mental, slides, gráficos, fluxograma, imagens — e em missões rápidas (quiz, teste, simulado), com o Rugi do lado até o dia da prova.

**Prévia no navegador:** https://danihono.github.io/fera/ (no computador aparece dentro de um celular; no celular abre direto). Sem Firebase configurado ela roda em modo demonstração, com uma prova de exemplo.

**Ligar de verdade (Firebase + IA):** [docs/COMO-LIGAR.md](docs/COMO-LIGAR.md) · **Qual IA faz o quê e quanto custa:** [docs/IA.md](docs/IA.md)

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
npm test                        # IA (sem chamar IA nenhuma) + leitura de arquivos (Word, slides, zip…)
npm run emuladores              # Firebase local (Auth, Firestore, Functions, Storage)
npm run test:emuladores         # regras de segurança + Cloud Function de ponta a ponta
```

## Estrutura

```
src/
  app/                    rotas (Expo Router)
    index.tsx             01 · Splash
    onboarding/           02a–c · Rugi, matéria, data
    (tabs)/               03 Início (trilha) · Provas · 10 Turma · 12 Perfil
    prova/                04 Nova prova · conteúdo · formatos · 05 Gerando · materiais
    material/[tipo].tsx   materiais gerados (resumo, slides, mapa, gráficos…)
    missao/               06 Quiz/Lacuna/VF + 07 Acerto/Erro · 08 Fim
    prova/[id].tsx        detalhe da prova (desempenho por tópico, mudar data, excluir)
    conta/                minha conta · entrar · criar · esqueci a senha · trocar senha · excluir
    streak.tsx · vespera/ · premium.tsx · configuracoes.tsx · conquistas.tsx
    ajuda.tsx · legal/[doc].tsx (termos e privacidade) · +not-found.tsx
  ia/                     a IA: tipos, esquemas JSON, prompts, linha de montagem, revisão, exemplo
                          (o mesmo código roda no app e nas Cloud Functions)
  components/             FeraButton, TabBar, Rugi, sheets, missao/, materiais/, icons…
  data/                   store (estado), nuvem (Firestore), conta (e-mail e senha), geração, conteúdo,
                          rascunho (o que o aluno mandou), textos legais
  lib/                    firebase, arquivos (lê Word/slides/planilha/HTML/zip…), foto de perfil,
                          IA grátis (AI Logic), vibração, anim, datas, navegação, moldura web
  theme/                  tokens do design system
functions/                Cloud Functions do modo qualidade (Claude, Gemini, GPT Image)
firestore.rules · storage.rules · firebase.json
tests/                    testes da IA, da leitura de arquivos e dos emuladores
web/index.html            página da moldura de celular do site
design/                   telas do canvas (.dc.html) e Fera-telas.pdf
docs/                     como ligar o Firebase e a IA
```

## Status

| Parte | Status |
| --- | --- |
| Telas 01–13 do design | ✅ iguais ao PDF em 390 × 844; em celular menor rolam em vez de cortar |
| Captura (câmera, galeria, qualquer arquivo, vários de uma vez, .zip, arrastar na web) | ✅ |
| Geração por IA | ✅ demonstração · grátis (Gemini) · qualidade (Claude + Gemini + GPT Image), com revisão do gabarito |
| Trilha, missões, vidas, XP, nível, sequência, véspera, conquistas | ✅ com dados reais |
| Firebase (login anônimo, Firestore, turmas com ranking ao vivo) | ✅ testado nos emuladores |
| Conta opcional (e-mail e senha): criar sem perder progresso, entrar, esqueci a senha, trocar senha, foto, sair, excluir | ✅ testado nos emuladores |
| Aba Provas, detalhe da prova, Configurações, Conquistas, formatos, materiais, conta, ajuda, termos, 404 | 🧪 montadas com o design system — falta desenhar no canvas |
| Termos de uso e Política de privacidade | 🧪 versão preliminar — revisar com advogado |
| Pagamento Fera+ | 🧪 compra simulada, preços de exemplo |

## Próximos passos

1. Criar o projeto Firebase e testar no celular com a IA de verdade ([docs/COMO-LIGAR.md](docs/COMO-LIGAR.md)).
2. Pagamento de verdade (RevenueCat / lojas) com o premium vindo do servidor.
3. Notificação do lembrete diário e da véspera (expo-notifications).
4. Prova da turma: gerar uma vez e compartilhar com a sala.
5. App Check e login com Google/Apple (hoje é só e-mail e senha).
