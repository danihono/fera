// App Check no celular: o SDK JS do Firebase não tem atestado nativo (Play Integrity / App Attest).
// No build das lojas, trocar por @react-native-firebase/app-check (veja docs/COMO-LIGAR.md). Aqui não faz nada.
import type { FirebaseApp } from 'firebase/app';

export function iniciarAppCheck(_app: FirebaseApp) {}
