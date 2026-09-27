import { router } from 'expo-router';

/** Fecha tudo que estiver empilhado e volta pra aba Início (trilha). */
export function goHome() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/(tabs)');
}
