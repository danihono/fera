// 11 · Modo véspera — canvas artboard Vespera.dc.html
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FeraButton } from '@/components/FeraButton';
import { CloseIcon, TimerIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import { mockProva, mockVespera } from '@/data/mock';
import { kf, pingPong, useLoop } from '@/lib/anim';
import { goHome } from '@/lib/nav';
import { colors, fonts, radius, sizes, space } from '@/theme';

export default function Vespera() {
  const insets = useSafeAreaInsets();
  const v = mockVespera;
  const top = insets.top + sizes.topExtra;

  // glow 1.4s · tick 1s (steps) · shake .5s
  const glow = useLoop(1400);
  const tick = useLoop(1000);
  const shake = useLoop(500);
  const glowStyle = useAnimatedStyle(() => {
    const w = pingPong(glow.value);
    return { opacity: 0.9 + 0.1 * w, transform: [{ scale: 1 + 0.08 * w }] };
  });
  const tickStyle = useAnimatedStyle(() => ({ opacity: tick.value < 0.5 ? 1 : 0.35 }));
  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${kf(shake.value, [0, 0.25, 0.75, 1], [0, -1.5, 1.5, 0])}deg` }],
    transformOrigin: '50% 100%',
  }));

  return (
    <View style={[styles.screen, { paddingTop: top, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}>
      {/* Listras em coordenadas da tela base; acompanham o topo do conteúdo. */}
      <Svg width={390} height={844} viewBox="0 0 390 844" style={[styles.stripes, { top: top - 58 }]}>
        <Path d="M-20 170 C 50 150 100 175 125 210 C 80 205 30 212 -20 230 Z" fill={colors.redStripe} />
        <Path d="M410 250 C 340 232 295 255 272 290 C 315 284 365 290 410 305 Z" fill={colors.redStripe} />
        <Path d="M-20 360 C 30 348 65 362 85 388 C 50 386 15 392 -20 402 Z" fill={colors.redStripe} />
      </Svg>

      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair do modo véspera" onPress={goHome} style={styles.close}>
          <CloseIcon size={24} strokeWidth={3} color={colors.white} />
        </Pressable>
        <View style={styles.modeTag}>
          <Text style={styles.modeText}>MODO VÉSPERA</Text>
        </View>
        <View style={styles.timer} accessible accessibilityLabel={`Tempo restante ${v.minutos} minutos`}>
          <TimerIcon size={20} color={colors.red} />
          <Text style={styles.timerText}>
            {v.minutos}
            <Animated.Text style={tickStyle}>:</Animated.Text>
            00
          </Text>
        </View>
      </View>

      <View style={styles.art}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={fireStyle}>
          <Rugi mood="fogo" width={200} />
        </Animated.View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Amanhã é o dia. Tamo junto.</Text>
        </View>
      </View>

      <Text style={styles.title}>Revisão relâmpago</Text>
      <Text style={styles.subtitle}>Só o que você errou. {v.questoes} questões.</Text>

      <View style={styles.list}>
        {v.topicos.map((t, i) => (
          <View key={t.nome} style={[styles.item, i < v.topicos.length - 1 && styles.itemDivider]}>
            <View style={styles.dot} />
            <Text style={styles.itemText}>{t.nome}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>errou {t.erros}x</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <FeraButton label="Começar revisão" variant="onRed" onPress={() => router.replace(`/missao/${mockProva.missaoAtual}`)} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.red, paddingHorizontal: space.gutter, alignItems: 'center' },
  stripes: { position: 'absolute', left: 0 },
  header: { alignSelf: 'stretch', height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  modeTag: { height: 30, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redDeep, justifyContent: 'center' },
  modeText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1.2, color: colors.white },
  timer: { height: 40, paddingLeft: 10, paddingRight: 12, borderRadius: radius.pill, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { fontFamily: fonts.fredoka700, fontSize: 18, color: colors.redText },
  art: { width: 300, height: 270, marginTop: 8, alignItems: 'center', justifyContent: 'flex-end' },
  glow: { position: 'absolute', left: 40, top: 30, width: 220, height: 220, borderRadius: 110, backgroundColor: colors.glowRed },
  bubble: {
    position: 'absolute',
    right: -14,
    top: 6,
    maxWidth: 120 + 2 * 12, // max-width do design não conta o padding
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleText: { fontFamily: fonts.nunito800, fontSize: 14, lineHeight: 17.5, color: colors.text },
  title: { marginTop: 18, fontFamily: fonts.fredoka700, fontSize: 34, lineHeight: 36, textAlign: 'center', color: colors.white },
  subtitle: { marginTop: 8, fontFamily: fonts.nunito800, fontSize: 17, textAlign: 'center', color: colors.white },
  list: { alignSelf: 'stretch', marginTop: 20, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.white, borderRadius: radius.card },
  item: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemDivider: { height: 52 + sizes.borderWidth, borderBottomWidth: sizes.borderWidth, borderColor: colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  itemText: { flex: 1, fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  badge: { height: 26, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.errorBg, justifyContent: 'center' },
  badgeText: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.errorText },
});
