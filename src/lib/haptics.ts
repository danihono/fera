// Vibração nos momentos que importam (acertou, errou, fim de missão). Respeita "Sons e vibração" das Configurações.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { app } from '@/data/store';

export function vibrar(tipo: 'acerto' | 'erro' | 'fim' | 'toque') {
  if (Platform.OS === 'web' || !app.get().sons) return;
  const p =
    tipo === 'acerto'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : tipo === 'erro'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : tipo === 'fim'
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  p.catch(() => {});
}
