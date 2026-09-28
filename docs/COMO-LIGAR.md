# Como ligar o Fera de verdade

O app funciona em três modos. Dá pra começar no primeiro e ir subindo:

| Modo | O que precisa | Custo | Quem gera |
| --- | --- | --- | --- |
| **Demonstração** | nada | zero | prova de exemplo (Funções do 1º grau), sem IA |
| **Grátis** | projeto Firebase no plano Spark + Firebase AI Logic | zero | Gemini Flash, rodando no app |
| **Qualidade (Fera+)** | plano Blaze + chaves Anthropic, Google AI e OpenAI | por uso (veja [IA.md](IA.md)) | Gemini lê e confere, Claude escreve, GPT Image ilustra (Cloud Functions) |

Sem configurar nada o app abre em **demonstração** (é assim que está o site do GitHub Pages).

---

## 1. Modo grátis (plano Spark, sem cartão)

### 1.1 Criar o projeto
1. Entre em <https://console.firebase.google.com> e crie um projeto (ex.: `fera-app`). Pode desligar o Google Analytics.
2. Em **Configurações do projeto → Seus apps**, adicione um app **Web** (ícone `</>`). Copie o objeto `firebaseConfig`.

### 1.2 Ligar os serviços
1. **Authentication → Método de login → Anônimo → Ativar.** (Cada celular vira um usuário sem pedir e-mail.)
2. **Firestore Database → Criar banco** → modo de produção → região `southamerica-east1` (São Paulo).
3. **Firebase AI Logic → Começar → Gemini Developer API.** O console cria a chave do Gemini dentro do projeto; ela nunca vai pro app.
4. (Pro site) **Authentication → Configurações → Domínios autorizados → adicionar `danihono.github.io`.**

### 1.3 Publicar as regras de segurança
```bash
npm install -g firebase-tools     # uma vez
firebase login
firebase use --add                 # escolha o projeto e dê o apelido "default"
firebase deploy --only firestore   # regras (firestore.rules) e índices
```

### 1.4 Apontar o app pro projeto
Copie `.env.example` para `.env.local` e preencha com o `firebaseConfig`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fera-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fera-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fera-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```
Esses valores são públicos (vão dentro do app de qualquer jeito); quem protege os dados são as regras do Firestore.

```bash
npx expo start --clear    # --clear: o Expo embute as variáveis no build e guarda em cache
```
Abra no **Expo Go**, faça o onboarding e mande uma foto do caderno. Em **Perfil → ⚙️ → Geração por IA** aparece "Grátis · Gemini".

### 1.5 Site (GitHub Pages) usando o Firebase
No GitHub: **Settings → Secrets and variables → Actions → Variables** e crie `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`. O próximo push na `main` publica o site já ligado.

### Limites do grátis
- O nível grátis do Gemini tem limite **por projeto** (por minuto e por dia). Uma prova usa ~3 pedidos + 1 por formato. Serve pra testar com poucas pessoas; pra abrir pro público, ative o faturamento (o Flash pago custa centavos por prova).
- No nível grátis o Google pode usar o conteúdo pra melhorar os modelos. Pra alunos menores de idade, use o nível pago antes de lançar (LGPD).
- Antes de lançar, ligue o **App Check** (Firebase → App Check) pra ninguém usar sua cota fora do app.

---

## 2. Modo qualidade (Fera+)

Precisa do plano **Blaze** (cartão cadastrado): Cloud Functions e Cloud Storage não funcionam no Spark. O Blaze tem cota grátis; o que custa de verdade são as IAs.

1. Firebase → **Faturamento → Blaze**. Crie um **alerta de orçamento** no Google Cloud (ex.: US$ 10).
2. **Storage → Começar** (região `southamerica-east1`). É onde ficam as ilustrações.
3. Chaves das IAs:
   - Anthropic (Claude): <https://console.anthropic.com> → API Keys
   - Google AI Studio (Gemini): <https://aistudio.google.com/apikey>
   - OpenAI (GPT Image): <https://platform.openai.com/api-keys>
4. Guarde as chaves no Secret Manager (nunca no código nem no app):
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   firebase functions:secrets:set GEMINI_API_KEY
   firebase functions:secrets:set OPENAI_API_KEY
   ```
   Não vai usar uma delas? Grave `-` como valor: a tarefa passa pro outro provedor (sem OpenAI, as ilustrações ficam só com legenda).
5. Publicar:
   ```bash
   npm --prefix functions install
   firebase deploy --only functions,firestore,storage
   ```
6. No `.env.local` (e na variável `IA_QUALIDADE` do GitHub): `EXPO_PUBLIC_IA_QUALIDADE=1`.

Quem tem Fera+ passa a gerar pelo servidor (`gerarProva` e `gerarFormato`, em `functions/src/index.ts`). Modelos, qualidade das imagens e limite por dia ficam em `functions/.env`.

> A compra do Fera+ ainda é simulada: o app marca `premium` no próprio perfil. Antes de cobrar de verdade, o premium tem que vir do servidor (RevenueCat ou Google Play/App Store → Cloud Function → custom claim) e a Function passa a checar o claim.

---

## 3. Testar tudo no computador (emuladores, sem conta nenhuma)

Precisa de Java instalado. O projeto `demo-fera` só existe nos emuladores e usa a IA de mentira (`functions/.env.demo-fera`).

```bash
npm run emuladores        # Auth, Firestore, Functions e Storage locais
```
Em outro terminal, com `EXPO_PUBLIC_FIREBASE_EMULADOR=<IP do computador>` no `.env.local` (no navegador pode ser `127.0.0.1`):
```bash
npx expo start --clear
```
Pra testar o modo qualidade no emulador, ponha também `EXPO_PUBLIC_IA_QUALIDADE=1` e compre o Fera+ (simulado) no app.

Testes automáticos:
```bash
npm run test:ia           # linha de montagem da IA (sem emulador)
npm run test:emuladores   # regras do Firestore + Cloud Function de ponta a ponta
```

---

## 4. Build pro celular (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # APK pra instalar direto
npx eas-cli@latest build --profile production --platform all     # lojas
```
As variáveis `EXPO_PUBLIC_*` vão no painel do EAS (Environment variables) ou no `eas.json`.
