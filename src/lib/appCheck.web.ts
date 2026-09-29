// App Check na web (reCAPTCHA Enterprise): prova pro Firebase que o pedido vem do site do Fera, não de um script
// gastando a cota do Gemini. Só liga com EXPO_PUBLIC_RECAPTCHA_SITE_KEY (e nunca nos emuladores).
import type { FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const CHAVE = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

export function iniciarAppCheck(app: FirebaseApp) {
  if (!CHAVE || process.env.EXPO_PUBLIC_FIREBASE_EMULADOR) return;
  try {
    initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(CHAVE), isTokenAutoRefreshEnabled: true });
  } catch {
    // Já iniciado (recarga rápida).
  }
}
