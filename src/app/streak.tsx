// 09 · Streak perdida — canvas artboard Streak.dc.html
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ellipse } from '@/components/Ellipse';
import { FeraButton } from '@/components/FeraButton';
import { CloseIcon, FireIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import { mockProva, mockUser } from '@/data/mock';
import { pingPong, useLoop } from '@/lib/anim';
import { goHome } from '@/lib/nav';
import { colors, fonts, radius, sizes, space } from '@/theme';

const smokeEasing = Easing.out(Easing.ease);

export default function Streak() {
  const insets = useSafeAreaInsets();
  // sob 1.6s · smoke 2.2s (atrasos 0 / .7s / 1.4s)
  const sob = useLoop(1600);
  const smoke = [useLoop(2200, { easing: smokeEasing }), useLoop(2200, { delay: 700, easing: smokeEasing }), useLoop(2200, { delay: 1400, easing: smokeEasing })];
  const sobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 3 * pingPong(sob.value) }] }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra }]}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={goHome} style={styles.close}>
          <CloseIcon size={24} strokeWidth={3} color={colors.iconMuted} />
        </Pressable>
      </View>

      <View style={styles.counter} accessible accessibilityLabel="Sequência: 0 dias">
        <View style={styles.flame}>
          <Smoke t={smoke[0]} left={12} top={0} size={10} />
          <Smoke t={smoke[1]} left={18} top={2} size={8} />
          <Smoke t={smoke[2]} left={8} top={4} size={7} />
          <Svg width={36} height={40} viewBox="0 0 24 24" style={styles.flameSvg}>
            <Path
              d="M12 2.5c.8 3 3.8 4.8 5.2 8 1.6 3.8-.6 9-5.2 9s-6.8-4-5.6-7.6c.5-1.6 1.6-2.6 2.6-3.2 0 1.6.8 2.6 1.8 2.8C10.2 9.2 10.4 5.6 12 2.5z"
              fill={colors.axis}
            />
          </Svg>
        </View>
        <Text style={styles.zero}>0</Text>
      </View>

      <View style={styles.stage}>
        <Ellipse width={200} height={20} color={colors.border} style={styles.floor} />
        <Animated.View style={[{ marginBottom: 8 }, sobStyle]}>
          <Rugi mood="triste" width={184} accessibilityLabel="Rugi triste, com uma lágrima" />
        </Animated.View>
      </View>

      <Text style={styles.title}>Poxa… sua sequência zerou</Text>
      {/* Quebras do design (text-wrap: pretty). */}
      <Text style={styles.copy}>{'O Rugi sentiu sua falta. Uma missão\nde 3 minutos já acende o fogo\nde novo.'}</Text>

      <View style={styles.record}>
        <FireIcon size={20} core={false} />
        <Text style={styles.recordText}>Seu recorde: {mockUser.recordeStreak} dias</Text>
      </View>

      <View style={{ flex: 1 }} />
      <View style={styles.actions}>
        <FeraButton label="Recomeçar agora" onPress={() => router.replace(`/missao/${mockProva.missaoAtual}`)} />
        <Pressable accessibilityRole="link" onPress={goHome} style={styles.link}>
          <Text style={styles.linkText}>Agora não</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** smoke: sobe 34px crescendo de .8 a 1.3 e some (opacidade .7 → 0). */
function Smoke({ t, left, top, size }: { t: SharedValue<number>; left: number; top: number; size: number }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - t.value),
    transform: [{ translateY: -34 * t.value }, { scale: 0.8 + 0.5 * t.value }],
  }));
  return <Animated.View style={[styles.smoke, { left, top, width: size, height: size, borderRadius: size / 2 }, style]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offWhite, paddingHorizontal: space.gutter, alignItems: 'center' },
  top: { alignSelf: 'stretch', height: sizes.touch, flexDirection: 'row', justifyContent: 'flex-end' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  // No design essas pílulas não têm box-sizing: border-box, então a borda soma à altura.
  counter: {
    marginTop: 10,
    height: 64 + 2 * sizes.borderWidth,
    paddingLeft: 16,
    paddingRight: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flame: { width: 36, height: 40 },
  flameSvg: { position: 'absolute', left: 0, top: 2 },
  smoke: { position: 'absolute', backgroundColor: colors.axis },
  zero: { fontFamily: fonts.fredoka700, fontSize: 40, lineHeight: 40, color: colors.lockedIcon },
  stage: { marginTop: 18, width: 260, height: 244, alignItems: 'center', justifyContent: 'flex-end' },
  floor: { position: 'absolute', left: 30, bottom: 0 },
  title: { marginTop: 18, fontFamily: fonts.fredoka700, fontSize: 30, lineHeight: 34, textAlign: 'center', color: colors.text },
  copy: { marginTop: 10, maxWidth: 300, fontFamily: fonts.nunito600, fontSize: 17, lineHeight: 24.65, textAlign: 'center', color: colors.textMuted },
  record: {
    marginTop: 16,
    height: 44 + 2 * sizes.borderWidth,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
  actions: { alignSelf: 'stretch', gap: 6 - sizes.shadow },
  link: { height: sizes.touch, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.textMuted },
});
