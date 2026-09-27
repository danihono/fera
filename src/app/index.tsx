// 01 · Splash — canvas "Fera — App de estudos", artboard Main.dc.html
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Ellipse } from '@/components/Ellipse';
import { Rugi } from '@/components/Rugi';
import { colors, fonts } from '@/theme';

const HOP_MS = 1300;
const ease = Easing.bezier(0.3, 0.6, 0.4, 1);

export default function Splash() {
  // Pulo do Rugi: amassa, sobe 38px, cai, amassa de novo (keyframes "hop" do design).
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: HOP_MS, easing: ease }), -1, false);
    const timer = setTimeout(() => router.replace('/onboarding'), 2600);
    return () => clearTimeout(timer);
  }, [t]);

  const hopStyle = useAnimatedStyle(() => {
    const p = t.value;
    const k = (a: number, b: number, v0: number, v1: number) => v0 + ((p - a) / (b - a)) * (v1 - v0);
    let y = 0,
      sx = 1,
      sy = 1;
    if (p < 0.1) [sx, sy] = [k(0, 0.1, 1, 1.06), k(0, 0.1, 1, 0.94)];
    else if (p < 0.4) [y, sx, sy] = [k(0.1, 0.4, 0, -38), k(0.1, 0.4, 1.06, 0.97), k(0.1, 0.4, 0.94, 1.04)];
    else if (p < 0.7) [y, sx, sy] = [k(0.4, 0.7, -38, 0), k(0.4, 0.7, 0.97, 1), k(0.4, 0.7, 1.04, 1)];
    else if (p < 0.78) [sx, sy] = [k(0.7, 0.78, 1, 1.05), k(0.7, 0.78, 1, 0.95)];
    else [sx, sy] = [k(0.78, 1, 1.05, 1), k(0.78, 1, 0.95, 1)];
    return { transform: [{ translateY: y }, { scaleX: sx }, { scaleY: sy }], transformOrigin: 'bottom' };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const p = t.value;
    const f = p < 0.4 ? p / 0.4 : p < 0.7 ? 1 - (p - 0.4) / 0.3 : 0;
    return { transform: [{ scaleX: 1 - 0.35 * f }], opacity: 0.28 - 0.14 * f };
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        <Path d="M-20 120 C 60 100 120 130 150 170 C 100 160 40 165 -20 190 Z" fill={colors.redStripe} />
        <Path d="M-20 250 C 40 230 80 250 105 280 C 60 275 20 285 -20 300 Z" fill={colors.redStripe} />
        <Path d="M410 560 C 330 540 270 570 240 610 C 290 600 350 605 410 630 Z" fill={colors.redStripe} />
        <Path d="M410 690 C 350 670 310 690 285 720 C 330 715 370 725 410 740 Z" fill={colors.redStripe} />
        <Path d="M410 90 C 350 80 320 100 300 125 C 340 120 380 125 410 140 Z" fill={colors.redStripe} />
        <Path d="M-20 700 C 30 690 70 705 90 730 C 50 728 15 735 -20 750 Z" fill={colors.redStripe} />
      </Svg>

      <View style={styles.hero}>
        <Animated.View style={hopStyle}>
          <Rugi mood="forca" width={210} accessibilityLabel="Rugi, o tigrinho do Fera, pulando" />
        </Animated.View>
        <Animated.View style={shadowStyle}>
          <Ellipse width={120} height={16} color={colors.redShadow} />
        </Animated.View>
      </View>
      <Text style={styles.logo}>Fera</Text>
      <Text style={styles.tagline}>Vira fera até o dia da prova.</Text>

      <View style={styles.dots} accessibilityLabel="Carregando">
        {[0, 200, 400].map((d) => (
          <Dot key={d} delay={d} />
        ))}
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })), -1));
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * v.value, transform: [{ scale: 0.8 + 0.2 * v.value }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hero: { alignItems: 'center', gap: 4, marginTop: -40 },
  logo: {
    marginTop: 28,
    fontFamily: fonts.fredoka700,
    fontSize: 76,
    lineHeight: 76,
    letterSpacing: -1,
    color: colors.white,
  },
  tagline: { marginTop: 10, fontFamily: fonts.nunito800, fontSize: 17, color: colors.white },
  dots: { position: 'absolute', bottom: 78, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.white },
});
