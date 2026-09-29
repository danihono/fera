// Firebase do app. Sem as variáveis EXPO_PUBLIC_FIREBASE_* o app roda em modo demonstração (tudo no aparelho).
// Com EXPO_PUBLIC_FIREBASE_EMULADOR=<host> fala com os emuladores locais (firebase emulators:start).
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, onAuthStateChanged, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { iniciarAuth } from './firebaseAuth';

// O Expo só embute no app as variáveis lidas assim, uma por uma (process.env.EXPO_PUBLIC_…).
const emulador = process.env.EXPO_PUBLIC_FIREBASE_EMULADOR?.trim() || null;

// Nos emuladores basta um projeto "demo-*" (não precisa de conta no Firebase).
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || (emulador ? 'demo-key' : undefined),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || (emulador ? 'demo-fera' : undefined),
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || (emulador ? 'demo-app' : undefined),
};

export const firebaseLigado = !!(config.apiKey && config.projectId && config.appId);
export const usandoEmulador = firebaseLigado && !!emulador;

/** Região das Cloud Functions (a mesma do functions/src/index.ts). */
export const REGIAO = 'southamerica-east1';

type Servicos = { app: FirebaseApp; auth: Auth; db: Firestore; functions: Functions };
let servicos: Servicos | null = null;

/** Serviços do Firebase (null no modo demonstração). Inicializa uma vez só. */
export function firebase(): Servicos | null {
  if (!firebaseLigado) return null;
  if (servicos) return servicos;
  const jaExiste = getApps().length > 0;
  const app = jaExiste ? getApp() : initializeApp(config);
  const auth = iniciarAuth(app);
  // E-mails de verificação e de nova senha em português.
  auth.languageCode = 'pt-BR';
  // Long polling: mais estável em redes de celular e no Expo Go.
  const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true, ignoreUndefinedProperties: true });
  const functions = getFunctions(app, REGIAO);
  if (emulador && !jaExiste) {
    connectAuthEmulator(auth, `http://${emulador}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulador, 8080);
    connectFunctionsEmulator(functions, emulador, 5001);
  }
  servicos = { app, auth, db, functions };
  return servicos;
}

/** Login anônimo: cada aparelho vira um usuário sem pedir e-mail. Resolve com o usuário (ou null no modo demonstração). */
export function entrar(): Promise<User | null> {
  const s = firebase();
  if (!s) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const parar = onAuthStateChanged(
      s.auth,
      (user) => {
        if (user) {
          parar();
          resolve(user);
        } else {
          signInAnonymously(s.auth).catch((e) => {
            parar();
            reject(e);
          });
        }
      },
      (e) => {
        parar();
        reject(e);
      },
    );
  });
}

export const usuarioAtual = () => firebase()?.auth.currentUser ?? null;
