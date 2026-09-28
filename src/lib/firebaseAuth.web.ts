// Auth na web: o padrão do Firebase já guarda a sessão no navegador (IndexedDB).
import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

export const iniciarAuth = (app: FirebaseApp): Auth => getAuth(app);
