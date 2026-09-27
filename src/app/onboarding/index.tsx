// 02a · Onboarding — Rugi — canvas artboard Onb1.dc.html
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ellipse } from '@/components/Ellipse';
import { FeraButton } from '@/components/FeraButton';
import { Rugi } from '@/components/Rugi';
import { colors, fonts, radius, sizes, space } from '@/theme';

export default function OnboardingRugi() {
  const insets = useSafeAreaInsets();

  // "wave": balança de -4° a 3° em 2,4s, pivô perto dos pés.
  const wave = useSharedValue(0);
  // "pop": o balão entra crescendo com um leve exagero.
  const pop = useSharedValue(0);
  useEffect(() => {
    const e = Easing.inOut(Easing.ease);
    wave.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 480, easing: e }),
        withTiming(3, { duration: 480, easing: e }),
        withTiming(-2, { duration: 480, easing: e }),
        withTiming(0, { duration: 960, easing: e }),
      ),
      -1,
    );
    pop.value = withSpring(1, { damping: 11, stiffness: 180 });
  }, [wave, pop]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wave.value}deg` }],
    transformOrigin: '50% 90%',
  }));
  const popStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ translateY: (1 - pop.value) * 10 }, { scale: 0.6 + 0.4 * pop.value }],
  }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, 6) + 6 }]}>
      <View style={styles.topRow}>
        <View style={styles.steps} accessibilityRole="progressbar" accessibilityLabel="Passo 1 de 3">
          <View style={[styles.step, { backgroundColor: colors.red }]} />
          <View style={styles.step} />
          <View style={styles.step} />
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/(tabs)')} style={styles.skip}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.bubble, popStyle]}>
          <Text style={styles.bubbleText}>
            E aí! Eu sou o Rugi. <Text style={{ color: colors.red }}>Bora virar fera?</Text>
          </Text>
          <View style={styles.tail} />
        </Animated.View>

        <View style={styles.stage}>
          <View style={styles.halo} />
          <Ellipse width={130} height={14} color={colors.border} style={styles.floorShadow} />
          <Animated.View style={[{ marginBottom: 10 }, waveStyle]}>
            <Rugi mood="acenando" width={250} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.copy}>Você manda o conteúdo da prova. Eu transformo em missões de 5 minutos.</Text>
        <FeraButton label="Bora!" onPress={() => router.push('/onboarding/materia')} />
        <Pressable accessibilityRole="link" onPress={() => router.replace('/(tabs)')} style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>Já tenho conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  topRow: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 16 },
  steps: { flex: 1, flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.border },
  skip: { minHeight: 44, justifyContent: 'center' },
  skipText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  bubble: {
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 22,
    maxWidth: 290,
  },
  bubbleText: {
    fontFamily: fonts.fredoka600,
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.text,
  },
  tail: {
    position: 'absolute',
    left: '50%',
    bottom: -10,
    width: 18,
    height: 18,
    marginLeft: -9,
    backgroundColor: colors.white,
    borderRightWidth: sizes.borderWidth,
    borderBottomWidth: sizes.borderWidth,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  stage: { width: 300, height: 330, alignItems: 'center', justifyContent: 'flex-end' },
  halo: { position: 'absolute', left: 20, bottom: 0, width: 260, height: 260, borderRadius: 130, backgroundColor: colors.offWhite },
  floorShadow: { position: 'absolute', left: 85, bottom: 6 },
  bottom: { gap: 16 },
  copy: {
    marginBottom: 8,
    fontFamily: fonts.nunito600,
    fontSize: 17,
    lineHeight: 25,
    color: colors.textMuted,
    textAlign: 'center',
  },
  secondaryLink: { height: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryLinkText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
});
