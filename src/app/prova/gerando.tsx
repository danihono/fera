// 05 · Gerando trilha — canvas artboard Gerando.dc.html
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { CheckIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Rugi } from '@/components/Rugi';
import { DESCRICAO_MODO, iniciarGeracao, limparGeracao, useGeracao } from '@/data/geracao';
import { kf, pingPong, useLoop } from '@/lib/anim';
import { goHome } from '@/lib/nav';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const PHRASES = ['Lendo sua letra (tá bonita, hein)', 'Separando o que mais cai…', 'Afiando as garras…'];
const CYCLE_MS = 7500;
const shineEasing = Easing.inOut(Easing.ease);
const growEasing = Easing.out(Easing.ease);

export default function Gerando() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Celular baixo: a arte encolhe pra caber o card (no design, 844 de altura, fica em 1).
  const escala = Math.min(1, Math.max(0.6, (height - 490) / 354));
  const g = useGeracao();
  const [fechando, setFechando] = useState(false);
  const tentar = useRef(false);
  const trocar = g?.erro?.codigo === 'fora-do-tema' || g?.erro?.codigo === 'sem-conteudo';

  // Começa a gerar ao abrir (se já estiver gerando, só acompanha).
  useEffect(() => {
    iniciarGeracao();
  }, []);

  // Pronta: mostra os 100% um instante e abre a Início com os materiais por cima.
  const pronta = !!g?.pronta;
  useEffect(() => {
    if (!pronta) return;
    const timer = setTimeout(() => {
      goHome();
      router.push('/prova/materiais');
      limparGeracao();
    }, 900);
    return () => clearTimeout(timer);
  }, [pronta]);

  const pct = g?.progresso.pct ?? 2;
  const feitos = (g?.progresso.feitos ?? []).slice(-2);

  // float 2.6s · think 3s · drift 3s (atrasos 0/1/2s) · cycle 7.5s · shine 1.8s · spin 1s
  const float = useLoop(2600);
  const think = useLoop(3000);
  const drift = [useLoop(3000), useLoop(3000, { delay: 1000 }), useLoop(3000, { delay: 2000 })];
  const cycle = useLoop(CYCLE_MS);
  const shine = useLoop(1800, { easing: shineEasing });
  const spin = useLoop(1000);
  // A barra anda até o progresso real (no design: 52% → 68% em 3s, ease-out).
  const grow = useSharedValue(0);
  useEffect(() => {
    grow.set(withTiming(pct, { duration: 1200, easing: growEasing }));
  }, [grow, pct]);

  const bookStyle = useAnimatedStyle(() => {
    const w = pingPong(float.value);
    return { transform: [{ translateY: -10 * w }, { rotate: `${-6 + 4 * w}deg` }] };
  });
  const thinkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${2 * pingPong(think.value)}deg` }],
    transformOrigin: '50% 100%',
  }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${grow.value}%` }));
  const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -80 + 400 * shine.value }, { skewX: '-20deg' }] }));
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${360 * spin.value}deg` }] }));

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra },
      ]}
    >
      <View style={{ width: 330, height: 320 * escala, marginTop: 40 * escala }}>
        <View style={[styles.art, escala < 1 && { transform: [{ scale: escala }], transformOrigin: '50% 0%' }]}>
          <View style={styles.halo} />
          <Drift t={drift[0]} text="x" style={[styles.symbol, { left: 70, top: 70, color: colors.red }]} />
          <Drift t={drift[1]} text="=" style={[styles.symbol, { left: 250, top: 50, color: colors.fireTop }]} />
          <Drift t={drift[2]} text="?" style={[styles.symbol, { left: 230, top: 110, fontSize: 22, color: colors.red }]} />
          <Animated.View style={[styles.rugi, thinkStyle]}>
            <Rugi mood="pensativo" width={190} accessibilityLabel="Rugi estudando o seu caderno" />
          </Animated.View>
          <Animated.View style={[styles.book, bookStyle]}>
            <Svg width={130} height={96} viewBox="0 0 130 96">
              <Path d="M65 18 C 48 8 24 6 6 10 V 84 C 24 80 48 82 65 92 Z" fill={colors.white} stroke={colors.bookInk} strokeWidth={3} strokeLinejoin="round" />
              <Path d="M65 18 C 82 8 106 6 124 10 V 84 C 106 80 82 82 65 92 Z" fill={colors.white} stroke={colors.bookInk} strokeWidth={3} strokeLinejoin="round" />
              <Path d="M16 26 C 30 23 44 24 56 30 M16 40 C 30 37 44 38 56 44 M16 54 C 28 51 38 52 48 56" stroke={colors.bookLine} strokeWidth={3} strokeLinecap="round" fill="none" />
              <Path d="M74 30 C 86 24 100 23 114 26 M74 44 C 86 38 100 37 114 40" stroke={colors.bookLine} strokeWidth={3} strokeLinecap="round" fill="none" />
              <SvgText x={86} y={68} fontFamily={fonts.fredoka700} fontSize={16} fill={colors.red}>
                f(x)
              </SvgText>
              <Path d="M60 90 L65 92 L70 90 L70 96 L65 94 L60 96 Z" fill={colors.red} />
            </Svg>
          </Animated.View>
        </View>
      </View>

      <Text style={styles.title}>Montando sua trilha…</Text>
      <View style={styles.phrases} accessibilityLiveRegion="polite">
        {PHRASES.map((p, i) => (
          <Phrase key={p} t={cycle} offset={i / PHRASES.length} text={p} />
        ))}
      </View>

      <View style={styles.progressRow}>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Progresso da trilha" accessibilityValue={{ min: 0, max: 100, now: pct }}>
          <Animated.View style={[styles.fill, fillStyle]}>
            <View style={styles.highlight} />
            <Animated.View style={[styles.shine, shineStyle]} />
          </Animated.View>
        </View>
        <Text style={styles.percent}>{pct}%</Text>
      </View>

      {/* Até 2 etapas prontas e a etapa atual girando, como no design. */}
      <View style={styles.card} accessibilityLiveRegion="polite">
        {feitos.map((f) => (
          <View key={f} style={[styles.row, styles.rowDivider]}>
            <View style={styles.okDot}>
              <CheckIcon size={16} color={colors.successText} />
            </View>
            <Text style={styles.rowText} numberOfLines={1}>
              {f}
            </Text>
          </View>
        ))}
        <View style={styles.row}>
          {pronta ? (
            <View style={styles.okDot}>
              <CheckIcon size={16} color={colors.successText} />
            </View>
          ) : (
            <Animated.View style={spinStyle}>
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Circle cx={14} cy={14} r={11} fill="none" stroke={colors.redSoft} strokeWidth={4} />
                <Path d="M14 3a11 11 0 0 1 11 11" fill="none" stroke={colors.red} strokeWidth={4} strokeLinecap="round" />
              </Svg>
            </Animated.View>
          )}
          <Text style={[styles.rowText, { fontFamily: fonts.nunito800, flexShrink: 1 }]} numberOfLines={1}>
            {g?.progresso.texto ?? 'Abrindo o caderno…'}
          </Text>
        </View>
      </View>

      {g && <Text style={styles.modo}>IA: {DESCRICAO_MODO[g.modo].nome}</Text>}

      {g?.erro && !fechando && (
        <InfoSheet
          mood="pensativo"
          title="Não rolou dessa vez"
          text={g.erro.mensagem}
          button={trocar ? 'Trocar o conteúdo' : 'Tentar de novo'}
          onConfirm={() => (tentar.current = !trocar)}
          onClose={() => {
            // Depois do botão (ou de fechar a sheet): tenta de novo ou volta pra trocar o conteúdo/formatos.
            if (tentar.current) {
              tentar.current = false;
              iniciarGeracao();
              return;
            }
            setFechando(true);
            limparGeracao();
            router.back();
          }}
        />
      )}
    </View>
  );
}

/** drift: sobe 60px em 3s (ease-out), aparece até 20% e some até o fim. */
function Drift({ t, text, style }: { t: SharedValue<number>; text: string; style: (TextStyle | ViewStyle)[] }) {
  const animated = useAnimatedStyle(() => {
    const p = Easing.out(Easing.ease)(t.value);
    return { opacity: kf(t.value, [0, 0.2, 1], [0, 1, 0]), transform: [{ translateY: -60 * p }] };
  });
  return <Animated.Text style={[...(style as TextStyle[]), animated]}>{text}</Animated.Text>;
}

/** cycle 7.5s: entra de baixo (3–8%), fica (até 30%), sai pra cima (35%). Cada frase começa 2.5s depois da anterior. */
function Phrase({ t, offset, text }: { t: SharedValue<number>; offset: number; text: string }) {
  const animated = useAnimatedStyle(() => {
    const p = (t.value - offset + 1) % 1;
    return {
      opacity: kf(p, [0.03, 0.08, 0.3, 0.35], [0, 1, 1, 0]),
      transform: [{ translateY: kf(p, [0.03, 0.08, 0.3, 0.35], [8, 0, 0, -8]) }],
    };
  });
  return <Animated.Text style={[styles.phrase, animated]}>{text}</Animated.Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offWhite, paddingHorizontal: space.gutter, alignItems: 'center' },
  art: { width: 330, height: 320 },
  halo: { position: 'absolute', left: 45, top: 30, width: 240, height: 240, borderRadius: 120, backgroundColor: colors.redSoft },
  symbol: { position: 'absolute', fontFamily: fonts.fredoka700, fontSize: 26 },
  rugi: { position: 'absolute', left: 108, top: 22 },
  book: { position: 'absolute', left: 14, top: 196 },
  title: { ...type.screenTitle, marginTop: 18, lineHeight: 31, textAlign: 'center', color: colors.text },
  phrases: { alignSelf: 'stretch', height: 26, marginTop: 10 },
  phrase: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    textAlign: 'center',
    fontFamily: fonts.nunito700,
    fontSize: 16,
    color: colors.textMuted,
  },
  progressRow: { alignSelf: 'stretch', marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flex: 1, height: 16, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 16, borderRadius: radius.pill, backgroundColor: colors.red, overflow: 'hidden' },
  highlight: { position: 'absolute', left: 8, right: 8, top: 3, height: 4, borderRadius: radius.pill, backgroundColor: colors.redHighlight },
  shine: { position: 'absolute', top: 0, left: 0, width: 40, height: 16, backgroundColor: colors.redShine, opacity: 0.45 },
  percent: { minWidth: 44, textAlign: 'right', fontFamily: fonts.fredoka600, fontSize: 18, color: colors.red },
  card: {
    alignSelf: 'stretch',
    marginTop: 28,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  // No design a linha tem 52 + a borda de baixo.
  rowDivider: { height: 52 + sizes.borderWidth, borderBottomWidth: sizes.borderWidth, borderColor: colors.border },
  okDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
  rowText: { flexShrink: 1, fontFamily: fonts.nunito700, fontSize: 16, color: colors.text },
  modo: { marginTop: 14, fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
});
