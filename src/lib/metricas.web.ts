// Métricas de uso (Google Analytics pelo Firebase), só na web por enquanto. Nada do conteúdo da prova sai daqui:
// só nomes de evento e números (quantos itens, modo, precisão). A pessoa desliga em Configurações.
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled, type Analytics } from 'firebase/analytics';
import { app } from '@/data/store';
import { firebase, usandoEmulador } from './firebase';

type Params = Record<string, string | number | boolean>;

let analytics: Promise<Analytics | null> | null = null;

function obter() {
  analytics ??= (async () => {
    const s = firebase();
    if (!s || usandoEmulador || !process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
    if (!(await isSupported())) return null;
    return getAnalytics(s.app);
  })().catch(() => null);
  return analytics;
}

export function evento(nome: string, params?: Params) {
  if (!app.get().metricas) return;
  obter()
    .then((a) => a && logEvent(a, nome, params))
    .catch(() => {});
}

/** Liga/desliga a coleta (toggle das Configurações). */
export function aplicarConsentimento(ligado: boolean) {
  if (!ligado && !analytics) return; // nunca iniciou: nada a desligar
  obter()
    .then((a) => a && setAnalyticsCollectionEnabled(a, ligado))
    .catch(() => {});
}

/** Erros de JavaScript que escaparam (só a mensagem, cortada): mostra onde o app quebra de verdade. */
export function capturarErros() {
  if (typeof window === 'undefined') return;
  const registrar = (msg: unknown) => evento('erro_js', { msg: String(msg).slice(0, 100) });
  window.addEventListener('error', (e) => registrar(e.message));
  window.addEventListener('unhandledrejection', (e) => registrar((e.reason as Error)?.message ?? e.reason));
}
