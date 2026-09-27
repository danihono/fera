// 03 · Início (trilha) — canvas artboard Home.dc.html
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CheckIcon, LockIcon, StarIcon, TrophyIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import { StatPill } from '@/components/StatPill';
import { mockProva, mockUser } from '@/data/mock';
import { colors, fonts, radius, sizes, solidShadow, space } from '@/theme';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// A trilha é desenhada em coordenadas absolutas da tela base (390 de largura).
// TRAIL_TOP é onde o card da prova termina (112 + 146); tudo abaixo é posicionado a partir daí.
const BASE_WIDTH = 390;
const TRAIL_TOP = 258;
const TRAIL_HEIGHT = 474; // até o fim do bloco "Dia da prova" (660 + 72 − 258)
const at = (left: number, top: number): ViewStyle => ({ position: 'absolute', left, top: top - TRAIL_TOP });

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Telas mais estreitas que 390 encolhem a trilha inteira em vez de cortar as bordas.
  const scale = Math.min(1, width / BASE_WIDTH);

  const p = mockProva;
  const progress = p.missoesFeitas / p.missoesTotal;

  // ring / ring2: 1.6s ease-out infinito, o segundo com 0.8s de atraso. bob: 2s ease-in-out.
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    const ring = () => withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
    ring1.set(ring());
    ring2.set(withDelay(800, ring()));
    const e = Easing.inOut(Easing.ease);
    bob.set(withRepeat(withSequence(withTiming(-6, { duration: 1000, easing: e }), withTiming(0, { duration: 1000, easing: e })), -1));
  }, [ring1, ring2, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stats}>
        <StatPill kind="streak" value={mockUser.streak} />
        <StatPill kind="xp" value={mockUser.xp} />
        <StatPill kind="lives" value={mockUser.lives} />
      </View>

      <View style={styles.card}>
        <Svg width={140} height={146} viewBox="0 0 140 146" style={styles.cardStripes}>
          <Path d="M140 10 C 110 12 92 26 84 44 C 104 34 122 32 140 36 Z" fill={colors.redStripe} />
          <Path d="M140 62 C 116 62 100 74 94 90 C 110 82 126 80 140 84 Z" fill={colors.redStripe} />
          <Path d="M140 112 C 120 112 108 122 104 134 C 116 128 128 127 140 130 Z" fill={colors.redStripe} />
        </Svg>
        <View style={styles.cardTop}>
          <View style={styles.cardTexts}>
            <Text style={styles.cardKicker}>Prova de {p.materia}</Text>
            <Text style={styles.cardDays}>em {p.diasFaltando} dias</Text>
            <Text style={styles.cardTopic}>{p.topico}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateWeekday}>{WEEKDAYS[p.data.getDay()]}</Text>
            <Text style={styles.dateDay}>{p.data.getDate()}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: p.missoesTotal, now: p.missoesFeitas }}
          >
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {p.missoesFeitas} de {p.missoesTotal}
          </Text>
        </View>
      </View>

      <View style={{ height: TRAIL_HEIGHT * scale, alignItems: 'center' }}>
        <View style={[styles.trail, { transform: [{ scale }] }]}>
          <Svg width={BASE_WIDTH} height={TRAIL_HEIGHT} viewBox={`0 ${TRAIL_TOP} ${BASE_WIDTH} ${TRAIL_HEIGHT}`} style={StyleSheet.absoluteFill}>
            <Path d="M150 316 C150 352 222 352 222 388 C222 429 150 429 150 470" fill="none" stroke={colors.trailDone} strokeWidth={12} strokeLinecap="round" />
            <Path
              d="M150 470 C150 522 232 522 232 574 C232 612 152 612 152 650 C152 673 272 673 272 696"
              fill="none"
              stroke={colors.border}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray="1 20"
            />
          </Svg>

          <Tag label="Hoje" style={at(20, 302)} bg={colors.redSoft} color={colors.redText} />

          <Node size={64} shadow={5} style={at(118, 284)} label="Missão 1, concluída" onPress={() => router.push({ pathname: '/missao/fim', params: { id: '1' } })}>
            <CheckIcon size={30} strokeWidth={3.2} color={colors.white} />
          </Node>
          <Node size={64} shadow={5} style={at(190, 356)} label="Missão 2, concluída" onPress={() => router.push({ pathname: '/missao/fim', params: { id: '2' } })}>
            <CheckIcon size={30} strokeWidth={3.2} color={colors.white} />
          </Node>

          <Ring t={ring1} style={at(106, 426)} />
          <Ring t={ring2} style={at(106, 426)} />
          <Node size={80} shadow={6} style={at(110, 430)} label="Missão 3, começar agora" onPress={() => router.push(`/missao/${p.missaoAtual}`)}>
            <StarIcon size={38} color={colors.white} />
          </Node>

          <View style={[styles.bubble, at(262, 384)]}>
            <Text style={styles.bubbleText}>Bora! {p.minutosMissao} min.</Text>
          </View>
          <Animated.View style={[at(236, 420), bobStyle]}>
            <Rugi mood="acenando" width={104} accessibilityLabel="Rugi acenando ao lado da missão atual" />
          </Animated.View>

          <Tag label="Amanhã" style={at(88, 560)} bg={colors.offWhite} color={colors.textMuted} />
          <LockedNode style={at(200, 542)} label="Missão 4, bloqueada" />
          <LockedNode style={at(120, 618)} label="Missão 5, bloqueada" />

          <View style={[styles.examDay, at(236, 660)]} accessible accessibilityLabel="Dia da prova">
            <TrophyIcon size={36} color={colors.red} />
          </View>
          <View style={[styles.dDay, at(316, 682)]}>
            <Text style={styles.dDayText}>Dia D</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Tag({ label, style, bg, color }: { label: string; style: ViewStyle; bg: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }, style]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

/** Bolha vermelha da trilha: sombra sólida de 5px (6px na atual); ao tocar, afunda 5px e a sombra some. */
function Node({
  size,
  shadow,
  style,
  label,
  onPress,
  children,
}: {
  size: number;
  shadow: number;
  style: ViewStyle;
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.node,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        {
          boxShadow: pressed ? 'none' : solidShadow(colors.redDeep, shadow),
          transform: [{ translateY: pressed ? 5 : 0 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

function LockedNode({ style, label }: { style: ViewStyle; label: string }) {
  return (
    <View style={[styles.node, styles.locked, style]} accessible accessibilityLabel={label}>
      <LockIcon size={26} color={colors.lockedIcon} />
    </View>
  );
}

/** Anel pulsando em volta da missão atual: escala .85 → 1.35, opacidade .7 → 0. */
function Ring({ t, style }: { t: SharedValue<number>; style: ViewStyle }) {
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - t.value),
    transform: [{ scale: 0.85 + 0.5 * t.value }],
  }));
  return <Animated.View style={[styles.ring, style, ringStyle]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: {
    marginTop: 14,
    height: 146,
    borderRadius: radius.card,
    backgroundColor: colors.red,
    boxShadow: solidShadow(colors.redDeep),
    padding: 18,
    overflow: 'hidden',
    gap: 14,
  },
  cardStripes: { position: 'absolute', right: 0, top: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTexts: { gap: 2 },
  cardKicker: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.white },
  cardDays: { fontFamily: fonts.fredoka700, fontSize: 36, lineHeight: 38, color: colors.white },
  cardTopic: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.white },
  dateBox: {
    width: 70,
    height: 76,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateWeekday: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
  dateDay: { fontFamily: fonts.fredoka700, fontSize: 30, lineHeight: 30, color: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: colors.redDeep, overflow: 'hidden' },
  fill: { height: 12, borderRadius: radius.pill, backgroundColor: colors.white, boxShadow: `inset 0px -3px 0px ${colors.progressShade}` },
  progressLabel: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.white },
  trail: { width: BASE_WIDTH, height: TRAIL_HEIGHT, transformOrigin: 'top' },
  tag: { height: 28, paddingHorizontal: 12, borderRadius: radius.pill, justifyContent: 'center' },
  tagText: { fontFamily: fonts.nunito800, fontSize: 13 },
  node: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  locked: { backgroundColor: colors.border, boxShadow: solidShadow(colors.locked, 5) },
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: colors.red },
  bubble: {
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bubbleText: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  examDay: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.offWhite,
    borderWidth: 3,
    borderColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dDay: { height: 28, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.red, justifyContent: 'center' },
  dDayText: { fontFamily: fonts.nunito900, fontSize: 13, color: colors.white },
});
