// As 3 pílulas do topo (Início e Turma): sequência, XP e vidas. Tocar numa explica o que ela é.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { InfoSheet } from '@/components/InfoSheet';
import { StatPill } from '@/components/StatPill';
import { XP_BONUS_MISSAO, XP_POR_ACERTO } from '@/data/missao';
import { nivelDe, streakAtual, useApp, VIDAS, XP_POR_NIVEL } from '@/data/store';

type Qual = 'streak' | 'xp' | 'vidas';

export function Pilulas() {
  const estado = useApp();
  const { xp, premium, recorde } = estado;
  const streak = streakAtual(estado);
  const [aberta, setAberta] = useState<Qual | null>(null);
  const n = nivelDe(xp);

  const sheet = {
    streak: {
      mood: streak > 0 ? ('fogo' as const) : ('dormindo' as const),
      title: streak === 1 ? '1 dia seguido' : `${streak} dias seguidos`,
      text: `${streak > 0 ? 'Faz pelo menos uma missão por dia pra sequência não zerar.' : 'Faz uma missão hoje pra começar uma sequência.'} Seu recorde: ${recorde} ${recorde === 1 ? 'dia' : 'dias'}.`,
      button: 'Bora',
    },
    xp: {
      mood: 'trofeu' as const,
      title: `Nível ${n.nivel} · ${n.titulo}`,
      text: `Faltam ${XP_POR_NIVEL - n.noNivel} XP pro nível ${n.nivel + 1}. Cada acerto vale ${XP_POR_ACERTO} XP e cada missão terminada, mais ${XP_BONUS_MISSAO}. O XP também conta no ranking da turma.`,
      button: 'Show',
    },
    vidas: premium
      ? { mood: 'comemorando' as const, title: 'Vidas infinitas', text: 'Com o Fera+ você erra à vontade: as missões nunca param no meio.', button: 'Show' }
      : {
          mood: 'forca' as const,
          title: `${VIDAS} vidas por missão`,
          text: 'Cada erro gasta uma vida. Se acabarem, é só tentar a missão de novo. No Fera+ as vidas são infinitas.',
          button: 'Entendi',
          secondary: { label: 'Conhecer o Fera+', onPress: () => router.push('/premium') },
        },
  }[aberta ?? 'streak'];

  return (
    <View style={styles.linha}>
      <StatPill kind="streak" value={streak} onPress={() => setAberta('streak')} />
      <StatPill kind="xp" value={xp} onPress={() => setAberta('xp')} />
      <StatPill kind="lives" value={premium ? '∞' : VIDAS} onPress={() => setAberta('vidas')} />
      {aberta && <InfoSheet {...sheet} onClose={() => setAberta(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
