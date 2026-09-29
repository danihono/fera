// Notificações locais (lembrete diário, sequência em risco, véspera e dia da prova). Não precisa de servidor:
// sempre que o estado muda, recalcula (src/data/lembretes.ts) e reagenda. Na web não tem (notificacoes.web.ts).
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { planejarLembretes } from '@/data/lembretes';
import { app, diasAte } from '@/data/store';
import { colors } from '@/theme';

export const notificacoesDisponiveis = true;

const CANAL = 'lembretes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

async function prepararCanal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Lembretes de estudo',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: colors.red,
  });
}

/** Tem permissão? Com pedir=true, pergunta (se ainda der pra perguntar). */
export async function permitirNotificacoes(pedir: boolean): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!pedir || !atual.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

let rodando = false;
let pendente = false;

/** Cancela o que estava agendado e agenda de novo a partir do estado de agora. */
export async function reagendar() {
  if (rodando) {
    pendente = true;
    return;
  }
  rodando = true;
  try {
    if (!(await permitirNotificacoes(false))) return;
    await prepararCanal();
    const s = app.get();
    const avisos = planejarLembretes({
      lembrete: s.lembrete,
      hora: s.lembreteHora,
      ultimoDia: s.ultimoDia,
      streak: s.streak,
      provas: s.provas.filter((p) => diasAte(p.data) >= 0).map((p) => ({ id: p.id, materia: p.materia, data: p.data })),
    });
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const a of avisos) {
      await Notifications.scheduleNotificationAsync({
        identifier: a.id,
        content: { title: a.titulo, body: a.texto, data: { url: a.url }, color: colors.red },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.quando, channelId: CANAL },
      });
    }
  } catch {
    // Sem permissão ou sem suporte (Expo Go antigo): segue sem lembrete.
  } finally {
    rodando = false;
    if (pendente) {
      pendente = false;
      reagendar();
    }
  }
}

/** Reagenda ao abrir e sempre que o estado mudar (com uma folguinha pra juntar mudanças seguidas). */
export function iniciarLembretes() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  reagendar();
  return app.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(reagendar, 2000);
  });
}

/** Tocou na notificação: abre a tela dela (missão do dia ou modo véspera). */
export function useAbrirPelaNotificacao() {
  const resposta = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const url = resposta?.notification.request.content.data?.url;
    if (resposta?.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER && typeof url === 'string') router.push(url as never);
  }, [resposta]);
}
