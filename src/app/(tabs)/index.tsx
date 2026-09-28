// 03 · Início (trilha) — canvas artboard Home.dc.html
import { router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useEffect, type ReactNode } from 'react';
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
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, LockIcon, StarIcon, TrophyIcon } from '@/components/icons';
import { ProvaCard } from '@/components/ProvaCard';
import { Rugi } from '@/components/Rugi';
import { StatPill } from '@/components/StatPill';
import { useConteudo } from '@/data/conteudo';
import { app, diaDe, diasAte, hoje, provaAtualDe, proximaMissao, sequenciaQuebrada, streakAtual, useApp, VIDAS } from '@/data/store';
import { colors, fonts, radius, sizes, solidShadow, space } from '@/theme';


// A trilha é desenhada em coordenadas absolutas da tela base (390 de largura).
// TRAIL_TOP é onde o card da prova termina (112 + 146); tudo abaixo é posicionado a partir daí.
const BASE_WIDTH = 390;
const TRAIL_TOP = 258;
const TRAIL_HEIGHT = 474; // até o fim do bloco "Dia da prova" (660 + 72 − 258)
const at = (left: number, top: number): ViewStyle => ({ position: 'absolute', left, top: top - TRAIL_TOP });

// Centro de cada bolha (5 missões) e as curvas do design entre elas; a última curva vai até o Dia D.
const SLOTS = [
  { x: 150, y: 316 },
  { x: 222, y: 388 },
  { x: 150, y: 470 },
  { x: 232, y: 574 },
  { x: 152, y: 650 },
];
const CURVAS = ['C150 352 222 352 222 388', 'C222 429 150 429 150 470', 'C150 522 232 522 232 574', 'C232 612 152 612 152 650'];
const DIA_D = { x: 272, y: 696 };
const ateDiaD = (p: { x: number; y: number }) => `C${p.x} ${p.y + 23} ${DIA_D.x} ${DIA_D.y - 23} ${DIA_D.x} ${DIA_D.y}`;

/** Caminho contínuo passando pelos pontos de i até j (j = total significa o Dia D). */
function caminho(total: number, de: number, ate: number) {
  const partes = [`M${(SLOTS[de] ?? DIA_D).x} ${(SLOTS[de] ?? DIA_D).y}`];
  for (let i = de; i < ate; i++) partes.push(i + 1 < total ? CURVAS[i] : ateDiaD(SLOTS[i]));
  return partes.join(' ');
}

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Telas mais estreitas que 390 encolhem a trilha inteira em vez de cortar as bordas.
  const scale = Math.min(1, width / BASE_WIDTH);

  const estado = useApp();
  const { prova: rascunho, xp, premium } = estado;
  const prova = provaAtualDe(estado);
  const { conteudo } = useConteudo(prova?.id ?? null);

  // Sequência zerada: a tela 09 aparece uma vez.
  useFocusEffect(
    useCallback(() => {
      if (sequenciaQuebrada(app.get())) router.push('/streak');
    }, []),
  );

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

  const card = prova ?? rascunho;
  const total = Math.min(SLOTS.length, prova?.totalMissoes ?? 0);
  const atual = prova ? proximaMissao({ feitas: prova.feitas, totalMissoes: total }) : null; // 1, 2, … ou null
  const k = atual != null ? atual - 1 : total; // índice da bolha atual (total = Dia D)
  const hojeDia = diaDe(hoje());
  const feitasHoje = prova ? prova.feitas.filter((n) => prova.feitasEm[n] === hojeDia && n <= total) : [];
  const idxHoje = feitasHoje.length ? Math.min(...feitasHoje) - 1 : atual != null ? k : null;
  const idxAmanha = atual != null && k + 1 < total && diasAte(card.data) >= 2 ? k + 1 : null;
  const questoes = atual != null ? (conteudo?.missoes[atual - 1]?.questoes.length ?? 5) : 0;
  const minutos = Math.max(2, Math.round(questoes * 0.8));
  // Rugi e balão ficam à direita da missão atual (no design: +86/−50 e +112/−86 do centro), sem sair da tela
  // nem subir no card da prova (missão 1: desce e afasta um pouco pra não cobrir a bolha 2).
  const cur = SLOTS[k];
  const desce = cur ? Math.max(0, TRAIL_TOP + 8 - (cur.y - 86)) : 0;
  const rugiPos = cur && at(Math.min(cur.x + 86 + (desce ? 20 : 0), BASE_WIDTH - 108), cur.y - 50 + desce);
  const balaoPos = cur && at(Math.min(cur.x + 112, 262), cur.y - 86 + desce);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stats}>
        <StatPill kind="streak" value={streakAtual(estado)} />
        <StatPill kind="xp" value={xp} />
        <StatPill kind="lives" value={premium ? '∞' : VIDAS} />
      </View>

      {/* Tocar no card abre os materiais da prova (prévia fora do design). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={prova ? 'Abrir materiais da prova' : 'Mandar o conteúdo da prova'}
        onPress={() => router.push(prova ? '/prova/materiais' : '/prova/nova')}
        style={styles.card}
      >
        <ProvaCard materia={card.materia} topico={card.topico} data={card.data} dias={diasAte(card.data)} feitas={prova?.feitas.length ?? 0} total={prova?.totalMissoes ?? 5} />
      </Pressable>

      {!prova ? (
        <View style={styles.empty}>
          <View style={styles.emptyRow}>
            <Rugi mood="acenando" width={104} accessibilityLabel="Rugi acenando" />
            <View style={styles.emptyBubble}>
              <Text style={styles.emptyText}>Manda a matéria da prova que eu monto a sua trilha.</Text>
            </View>
          </View>
          <FeraButton label="Mandar o conteúdo" onPress={() => router.push('/prova/nova')} />
        </View>
      ) : (
        <View style={{ height: TRAIL_HEIGHT * scale, alignItems: 'center' }}>
          <View style={[styles.trail, { transform: [{ scale }] }]}>
            <Svg width={BASE_WIDTH} height={TRAIL_HEIGHT} viewBox={`0 ${TRAIL_TOP} ${BASE_WIDTH} ${TRAIL_HEIGHT}`} style={StyleSheet.absoluteFill}>
              {k > 0 && <Path d={caminho(total, 0, k)} fill="none" stroke={colors.trailDone} strokeWidth={12} strokeLinecap="round" />}
              {k < total && (
                <Path d={caminho(total, k, total)} fill="none" stroke={colors.border} strokeWidth={12} strokeLinecap="round" strokeDasharray="1 20" />
              )}
            </Svg>

            {idxHoje != null && <Tag label="Hoje" style={at(SLOTS[idxHoje].x < 190 ? 20 : 88, SLOTS[idxHoje].y - 14)} bg={colors.redSoft} color={colors.redText} />}
            {idxAmanha != null && <Tag label="Amanhã" style={at(SLOTS[idxAmanha].x < 190 ? 20 : 88, SLOTS[idxAmanha].y - 14)} bg={colors.offWhite} color={colors.textMuted} />}

            {SLOTS.slice(0, total).map((p, i) => {
              const n = i + 1;
              if (prova.feitas.includes(n))
                return (
                  <Node key={n} size={64} shadow={5} style={at(p.x - 32, p.y - 32)} label={`Missão ${n}, concluída`} onPress={() => router.push(`/missao/${n}`)}>
                    <CheckIcon size={30} strokeWidth={3.2} color={colors.white} />
                  </Node>
                );
              if (n === atual)
                return (
                  <Fragment key={n}>
                    <Ring t={ring1} style={at(p.x - 44, p.y - 44)} />
                    <Ring t={ring2} style={at(p.x - 44, p.y - 44)} />
                    <Node size={80} shadow={6} style={at(p.x - 40, p.y - 40)} label={`Missão ${n}, começar agora`} onPress={() => router.push(`/missao/${n}`)}>
                      <StarIcon size={38} color={colors.white} />
                    </Node>
                  </Fragment>
                );
              return <LockedNode key={n} style={at(p.x - 32, p.y - 32)} label={`Missão ${n}, bloqueada`} />;
            })}

            {cur && rugiPos && balaoPos && (
              <>
                <View style={[styles.bubble, balaoPos]}>
                  <Text style={styles.bubbleText}>Bora! {minutos} min.</Text>
                </View>
                <Animated.View style={[rugiPos, bobStyle]}>
                  <Rugi mood="acenando" width={104} accessibilityLabel="Rugi acenando ao lado da missão atual" />
                </Animated.View>
              </>
            )}
            {!cur && (
              <View style={[styles.bubble, at(206, 616)]}>
                <Text style={styles.bubbleText}>Trilha feita! Revisa no Dia D.</Text>
              </View>
            )}

            <Pressable style={[styles.examDay, at(236, 660)]} accessibilityRole="button" accessibilityLabel="Dia da prova" onPress={() => router.push(`/vespera/${prova.id}`)}>
              <TrophyIcon size={36} color={colors.red} />
            </Pressable>
            <View style={[styles.dDay, at(316, 682)]}>
              <Text style={styles.dDayText}>Dia D</Text>
            </View>
          </View>
        </View>
      )}
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
  card: { marginTop: 14 },
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
  empty: { marginTop: 28, gap: 16 },
  emptyRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  emptyBubble: {
    flex: 1,
    marginBottom: 34,
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  emptyText: { fontFamily: fonts.nunito800, fontSize: 16, lineHeight: 22, color: colors.text },
});
