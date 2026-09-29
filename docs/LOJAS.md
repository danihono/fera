# Fera nas lojas (App Store e Google Play)

Checklist do que falta pra publicar, com os textos prontos. O que depende de conta sua (Apple Developer, Google Play Console, RevenueCat) está marcado com 👤.

## 1. Antes de tudo
- [ ] 👤 **Termos e Política revisados por advogado** (`src/data/legal.ts`): trocar `[Razão social]`, `[CNPJ]`, `[endereço]`, `[nome]` do encarregado e tirar o aviso de "versão preliminar".
- [ ] 👤 E-mails de verdade: `ajuda@fera.app` e `privacidade@fera.app` (ou troque no código: `src/app/ajuda.tsx`, `src/data/legal.ts`, `src/app/excluir-conta.tsx`).
- [ ] Site publicado (`npm run build:hosting && firebase deploy --only hosting,firestore`). As lojas pedem estes links:
  - Política de privacidade: `https://fera-bfdbb.web.app/legal/privacidade`
  - Termos de uso: `https://fera-bfdbb.web.app/legal/termos`
  - Exclusão de conta (Google Play exige): `https://fera-bfdbb.web.app/excluir-conta`
  - Suporte: `https://fera-bfdbb.web.app/ajuda`
- [ ] `FERA_COMPRA_TESTE=0` nas Functions (só a loja ativa o Fera+).

## 2. Builds (EAS)
```bash
npx eas-cli@latest login
npx eas-cli@latest init                                        # liga o projeto à sua conta Expo (grava o projectId no app.json)
npx eas-cli@latest build --profile preview --platform android  # APK pra testar no celular
npx eas-cli@latest build --profile production --platform all   # lojas (versão sobe sozinha: autoIncrement)
npx eas-cli@latest submit --platform android                   # manda pro teste interno do Play
npx eas-cli@latest submit --platform ios                       # manda pro TestFlight
```
As variáveis `EXPO_PUBLIC_*` do `.env` entram no build; confira no painel do EAS (Environment variables) se vai usar valores diferentes em produção.

**Trocas que só dá pra fazer no build nativo** (Expo Go não tem):
- 👤 **Pagamento (RevenueCat):** `npx expo install react-native-purchases`; no app, `Purchases.configure({ apiKey, appUserID: <uid do Firebase> })` e, em `src/data/assinatura.ts`, trocar a chamada `assinarTeste` por `Purchases.purchasePackage(...)`. No RevenueCat: produtos `fera_plus_mensal` e `fera_plus_anual` (o webhook entende "anual" pelo nome), entitlement `fera_plus`, e em **Integrations → Webhooks**: URL da função `revenuecatWebhook` e o header de autorização igual ao segredo:
  ```bash
  firebase functions:secrets:set REVENUECAT_WEBHOOK_AUTH   # uma senha longa qualquer; a mesma vai no RevenueCat
  firebase deploy --only functions
  ```
- **App Check nativo:** `@react-native-firebase/app-check` (Play Integrity / App Attest), no lugar de `src/lib/appCheck.ts`.
- **Métricas nativas:** `@react-native-firebase/analytics`, no lugar de `src/lib/metricas.ts` (mesmos nomes de evento).

## 3. Textos da ficha (pt-BR)

**Nome:** Fera: estude com IA
**Subtítulo (App Store, 30):** Caderno vira missão de 5 min
**Descrição curta (Play, 80):** Manda a matéria da prova e o Rugi transforma em missões rápidas até o dia D.

**Descrição:**
> Tem prova chegando? Tira foto do caderno, manda o PDF, os slides do professor, o áudio da aula ou até um .zip com tudo. O Fera lê, separa o que mais cai e monta uma trilha de missões de 5 minutos até o dia da prova.
>
> • Missões rápidas: quiz, complete a frase e verdadeiro ou falso, com explicação passo a passo quando errar
> • Materiais prontos: resumo, explicação, mapa mental, slides, gráficos e fluxogramas
> • Modo véspera: revisão do que você mais errou, na noite antes da prova
> • Reforço: o app volta nos tópicos em que você erra mais
> • Turma: ranking com a sala e provas compartilhadas — alguém gera, todo mundo estuda
> • Sequência, XP, níveis e conquistas pra manter o ritmo
> • Lembrete diário no horário que você escolher
>
> Fera+: provas ilimitadas, vidas infinitas, mais formatos e a IA mais caprichada (Claude + Gemini + ilustrações).
>
> Sem conta você já usa. Criando conta, seu progresso vai junto se trocar de celular.

**Palavras-chave (App Store, 100):** estudo,prova,enem,vestibular,resumo,flashcard,quiz,escola,lição,caderno,mapa mental,revisão

**Categoria:** Educação · **Classificação:** Livre / 4+ (marcar "usuários interagem": turmas mostram nome e XP).

## 4. Prints
Em `docs/lojas/` (1290 × 2796, iPhone 6,7"; o Play aceita os mesmos): Rugi · Nova prova · Trilha · Resumo · Missão · Turma. Gerados do modo demonstração com Playwright; pra refazer depois de mudar telas, veja o roteiro em `CLAUDE.md` (Como conferir).

## 5. Privacidade nas lojas
Coerente com a Política (`/legal/privacidade`):

| Dado | Coleta? | Pra quê | Compartilha? | Opcional |
| --- | --- | --- | --- | --- |
| Nome, e-mail | sim (só com conta) | conta | não | sim (conta é opcional) |
| Fotos e arquivos enviados | sim | gerar os materiais | processado por provedores de IA (Google, Anthropic, OpenAI) em nome do Fera | não |
| Foto de perfil | sim | perfil e ranking da turma | não | sim |
| Progresso (respostas, XP, provas) | sim | funcionamento do app | não | não |
| Uso do app (eventos) | sim | estatísticas | não | sim (Configurações) |
| Localização, contatos, dados de saúde | não | — | — | — |

Dados criptografados em trânsito: **sim**. A pessoa pode pedir exclusão: **sim** (no app e em `/excluir-conta`).

**Play → Segurança dos dados / Apple → Privacidade do app:** use a tabela acima. Público-alvo inclui menores: no Play, preencha "Público-alvo e conteúdo" (13+ e menores com consentimento; o app pede o responsável pra menores de 12 no Criar conta e desliga as estatísticas).

## 6. Notas pra revisão
> O login é opcional (o app funciona sem conta). Pra testar a conta: [crie um e-mail de teste e cole aqui a senha]. O Fera+ usa assinatura da loja pelo RevenueCat (ambiente sandbox). Pra gerar uma prova, toque em "Escrever ou colar" e cole qualquer texto de matéria.
