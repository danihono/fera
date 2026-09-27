// 08 · Fim de missão — canvas artboard Fim.dc.html
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ConfettiPiece, FALL_FIM, type ConfettiSpec } from '@/components/Confetti';
import { FeraButton } from '@/components/FeraButton';
import { BoltIcon, FireIcon } from '@/components/icons';
import { ProgressBar } from '@/components/ProgressBar';
import { Rugi } from '@/components/Rugi';
import { mockMissao } from '@/data/missao';
import { mockUser } from '@/data/mock';
import { pingPong, useLoop } from '@/lib/anim';
import { goHome } from '@/lib/nav';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const CONFETTI: ConfettiSpec[] = [
  { left: 40, top: 70, width: 10, height: 14, shape: 3, color: colors.red, duration: 2400, delay: 0 },
  { left: 96, top: 50, width: 9, height: 9, shape: 'circle', color: colors.error, duration: 2800, delay: 600 },
  { left: 300, top: 60, width: 12, height: 8, shape: 3, color: colors.success, duration: 2200, delay: 1100 },
  { left: 340, top: 90, width: 10, height: 10, shape: 3, color: colors.red, duration: 2600, delay: 300 },
  { left: 70, top: 120, width: 8, height: 12, shape: 3, color: colors.redBlush, duration: 3000, delay: 1400 },
  { left: 260, top: 40, width: 9, height: 9, shape: 'circle', color: colors.red, duration: 2500, delay: 900 },
  { left: 180, top: 30, width: 10, height: 8, shape: 3, color: colors.error, duration: 2700, delay: 1800 },
];

const riseEasing = Easing.bezier(0.2, 0.9, 0.3, 1);
const rollEasing = Easing.bezier(0.2, 0.8, 0.3, 1);
const fillEasing = Easing.out(Easing.ease);
const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

export default function Fim() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; xp?: string; precisao?: string }>();
  // Sem params (missão já concluída, aberta pela trilha), mostra os números do design.
  const numero = Number(params.id ?? mockMissao.numero);
  const xp = Number(params.xp ?? 45);
  const precisao = Number(params.precisao ?? 92);
  const sequencia = mockUser.streak + 1;
  const nivel = { atual: mockUser.xpNivel, total: mockUser.xpProximoNivel };

  // rays 30s · rise .6s · roll 1.2s .4s · flick .8s · fill 1.2s .8s
  const rays = useLoop(30000);
  const flick = useLoop(800);
  const rise = useSharedValue(0);
  const roll = useSharedValue(0);
  const fill = useSharedValue(0);
  useEffect(() => {
    rise.set(withTiming(1, { duration: 600, easing: riseEasing }));
    roll.set(withDelay(400, withTiming(1, { duration: 1200, easing: rollEasing })));
    fill.set(withDelay(800, withTiming(1, { duration: 1200, easing: fillEasing })));
  }, [rise, roll, fill]);

  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${360 * rays.value}deg` }] }));
  const riseStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: 40 * (1 - rise.value) }, { scale: 0.85 + 0.15 * rise.value }],
  }));
  const rollStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -120 * roll.value }] }));
  const flickStyle = useAnimatedStyle(() => {
    const w = pingPong(flick.value);
    return { transform: [{ scaleX: 1 + 0.08 * w }, { scaleY: 1 + 0.12 * w }, { rotate: `${-2 + 4 * w}deg` }], transformOrigin: '50% 90%' };
  });
  // fill: a barra do nível sai de 62% e chega no valor atual.
  const from = 0.62;
  const to = nivel.atual / nivel.total;
  const fillStyle = useAnimatedStyle(() => ({ width: `${(from + (to - from) * fill.value) * 100}%` }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra }]}>
      <Animated.View pointerEvents="none" style={[styles.rays, { top: insets.top + sizes.topExtra + 2 }, raysStyle]}>
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <G fill={colors.rays}>
            {RAYS.map((deg) => (
              <Path key={deg} d="M150 150 L138 0 H162 Z" transform={`rotate(${deg} 150 150)`} />
            ))}
          </G>
          <Circle cx={150} cy={150} r={96} fill={colors.redSoft} />
        </Svg>
      </Animated.View>
      {CONFETTI.map((c, i) => (
        <ConfettiPiece key={i} spec={{ ...c, top: c.top + insets.top + sizes.topExtra - 58 }} fall={FALL_FIM} />
      ))}

      <Animated.View style={[{ marginTop: 22 }, riseStyle]}>
        <Rugi mood="trofeu" width={190} accessibilityLabel="Rugi segurando um troféu" />
      </Animated.View>
      <Text style={styles.title}>Missão completa!</Text>
      <Text style={styles.subtitle}>
        {mockMissao.topico} · Missão {numero}
      </Text>

      <View style={styles.stats}>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statLabel}>XP GANHO</Text>
          <View style={styles.xpRow}>
            <BoltIcon size={22} outline={false} />
            <View style={styles.rollWindow} accessible accessibilityLabel={`mais ${xp}`}>
              <Animated.View style={rollStyle}>
                {[0, 1, 2, 3].map((k) => (
                  <Text key={k} style={[styles.statValue, { color: colors.red }]}>
                    +{Math.round((xp * k) / 3)}
                  </Text>
                ))}
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={[styles.stat, { boxShadow: solidShadow(colors.redDeep) }]}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              {/* linear-gradient(160deg, fireTop, fireBottom) */}
              <LinearGradient id="streakCard" x1="0.33" y1="0.03" x2="0.67" y2="0.97">
                <Stop offset="0" stopColor={colors.fireTop} />
                <Stop offset="1" stopColor={colors.fireBottom} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={radius.option} fill="url(#streakCard)" />
          </Svg>
          <Text style={[styles.statLabel, { color: colors.white }]}>SEQUÊNCIA</Text>
          <View style={styles.streakRow}>
            <Animated.View style={flickStyle}>
              <FireIcon size={24} fill={colors.white} coreFill={colors.fireCoreWarm} />
            </Animated.View>
            <Text style={[styles.statValue, { color: colors.white }]}>{sequencia}</Text>
          </View>
          <Text style={styles.streakUnit}>dias</Text>
        </View>

        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statLabel}>PRECISÃO</Text>
          <Text style={[styles.statValue, { color: colors.successText }]}>{precisao}%</Text>
        </View>
      </View>

      <View style={styles.level}>
        <View style={styles.levelRow}>
          <Text style={styles.levelName}>Nível {mockUser.nivel}</Text>
          <Text style={styles.levelXp}>
            {nivel.atual.toLocaleString('pt-BR')} / {nivel.total.toLocaleString('pt-BR')} XP
          </Text>
        </View>
        <View style={styles.levelBar}>
          <ProgressBar height={14} shine={3} progress={to} fillStyle={fillStyle} accessibilityLabel={`Nível ${mockUser.nivel}`} />
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <View style={styles.actions}>
        <FeraButton label="Próxima missão" onPress={() => router.replace(`/missao/${numero + 1}`)} />
        <Pressable accessibilityRole="link" onPress={goHome} style={styles.link}>
          <Text style={styles.linkText}>Voltar pra trilha</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter, alignItems: 'center' },
  rays: { position: 'absolute', left: '50%', marginLeft: -150, width: 300, height: 300 },
  title: { ...type.h1, marginTop: 16, lineHeight: 35, textAlign: 'center', color: colors.text },
  subtitle: { marginTop: 6, fontFamily: fonts.nunito700, fontSize: 15, color: colors.textMuted },
  stats: { alignSelf: 'stretch', marginTop: 22, flexDirection: 'row', gap: 10 },
  stat: { flex: 1, height: 112, borderRadius: radius.option, alignItems: 'center', justifyContent: 'center', gap: 4 },
  statBorder: { borderWidth: sizes.borderWidth, borderColor: colors.border },
  statLabel: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 0.8, color: colors.textMuted },
  statValue: { fontFamily: fonts.fredoka700, fontSize: 32, lineHeight: 40 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rollWindow: { height: 40, overflow: 'hidden' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakUnit: { fontFamily: fonts.nunito800, fontSize: 12, color: colors.white },
  level: { alignSelf: 'stretch', marginTop: 18, gap: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  levelName: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  levelXp: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  levelBar: { flexDirection: 'row' },
  actions: { alignSelf: 'stretch', gap: 6 - sizes.shadow },
  link: { height: sizes.touch, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
});
