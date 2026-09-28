// Auth no celular: a sessão fica salva no AsyncStorage (o login anônimo sobrevive a fechar o app).
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import * as authRN from 'firebase/auth';

// getReactNativePersistence só existe no build react-native do firebase/auth (os tipos padrão são os da web).
const { getReactNativePersistence } = authRN as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => authRN.Persistence;
};

export function iniciarAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Já inicializado (recarga rápida do Metro).
    return getAuth(app);
  }
}
