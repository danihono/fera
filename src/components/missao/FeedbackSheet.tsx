// 07a–b · Acerto / Erro — sheets das artboards Acerto.dc.html e Erro.dc.html
import { Fragment, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfettiPiece, FALL_ACERTO, type ConfettiSpec } from '@/components/Confetti';
import { FeraButton } from '@/components/FeraButton';
import { ArrowRightIcon, BoltIcon, CheckIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import type { Feedback } from '@/data/missao';
import { kf } from '@/lib/anim';
import { colors, fonts, sizes, space } from '@/theme';

const sheetEasing = Easing.bezier(0.2, 0.9, 0.3, 1);
// Curvas criadas uma vez só: useOnce reinicia a animação se a curva mudar de identidade.
const backEasing = Easing.bezier(0.2, 0.9, 0.3, 1);

const CONFETTI: ConfettiSpec[] = [
  { left: 250, top: -70, width: 10, height: 14, shape: 3, color: colors.red, duration: 1800, delay: 100 },
  { left: 300, top: -90, width: 12, height: 8, shape: 3, color: colors.success, duration: 2000, delay: 400 },
  { left: 350, top: -60, width: 9, height: 9, shape: 'circle', color: colors.error, duration: 1700, delay: 700 },
  { left: 230, top: -40, width: 8, height: 12, shape: 3, color: colors.error, duration: 2100, delay: 200 },
  { left: 330, top: -100, width: 10, height: 10, shape: 3, color: colors.red, duration: 1900, delay: 900 },
  { left: 270, top: -110, width: 8, height: 8, shape: 'circle', color: colors.redBlush, duration: 2200, delay: 500 },
];

type Props = { correct: boolean; feedback: Feedback; xp: number; onContinue: () => void };

/** Sheet que sobe depois do VERIFICAR: verde no acerto, laranja no erro (nunca vermelho). */
export function FeedbackSheet({ correct, feedback, xp, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra;
  // Altura do design (218 / 300) menos os 40 de baixo, que viram safe area + 6.
  const height = (correct ? 178 : 260) + bottom;

  // up .35s cubic-bezier(.2,.9,.3,1)
  const up = useSharedValue(0);
  useEffect(() => {
    up.set(withTiming(1, { duration: 350, easing: sheetEasing }));
  }, [up]);
  const upStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - up.value) * height }] }));

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.sheet,
        { height, paddingBottom: bottom - sizes.shadow, backgroundColor: correct ? colors.successBg : colors.errorBg },
        upStyle,
      ]}
    >
      {correct ? <Acerto feedback={feedback} xp={xp} /> : <Erro feedback={feedback} />}
      <View style={{ flex: 1 }} />
      <FeraButton label={correct ? 'Continuar' : 'Entendi'} variant={correct ? 'success' : 'error'} onPress={onContinue} />
    </Animated.View>
  );
}

/** Anima de 0 a 1 uma vez, com atraso (animation: ... <atraso> both). */
function useOnce(duration: number, delay: number, easing: EasingFunction | EasingFunctionFactory = Easing.linear) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration, easing })));
  }, [t, duration, delay, easing]);
  return t;
}

function Acerto({ feedback, xp }: { feedback: Feedback; xp: number }) {
  // jump .6s .2s · xp .5s .5s
  const jump = useOnce(600, 200, backEasing);
  const pop = useOnce(500, 500, backEasing);
  const jumpStyle = useAnimatedStyle(() => ({
    opacity: kf(jump.value, [0, 0.6], [0, 1]),
    transform: [{ translateY: kf(jump.value, [0, 0.6, 1], [60, -8, 0]) }, { scale: kf(jump.value, [0, 0.6, 1], [0.8, 1.04, 1]) }],
  }));
  const popStyle = useAnimatedStyle(() => ({
    opacity: kf(pop.value, [0, 0.7], [0, 1]),
    transform: [{ scale: kf(pop.value, [0, 0.7, 1], [0.4, 1.15, 1]) }],
  }));

  return (
    <>
      {CONFETTI.map((c, i) => (
        <ConfettiPiece key={i} spec={c} fall={FALL_ACERTO} />
      ))}
      <Animated.View style={[styles.rugiAcerto, jumpStyle]}>
        <Rugi mood="comemorando" width={122} />
      </Animated.View>
      <View style={styles.titleRow}>
        <View style={styles.okDot}>
          <CheckIcon size={18} strokeWidth={3.8} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.successText }]}>Mandou bem!</Text>
      </View>
      <View style={styles.xpRow}>
        <Animated.View style={[styles.xpPill, popStyle]}>
          <BoltIcon size={14} outline={false} />
          <Text style={styles.xpText}>+{xp} XP</Text>
        </Animated.View>
        <Text style={styles.acertoText} numberOfLines={2}>
          {feedback.acerto}
        </Text>
      </View>
    </>
  );
}

function Erro({ feedback }: { feedback: Feedback }) {
  // peek .5s .25s · step .3s (.5s, .8s, 1.1s)
  const peek = useOnce(500, 250, backEasing);
  const peekStyle = useAnimatedStyle(() => ({ opacity: peek.value, transform: [{ translateY: 40 * (1 - peek.value) }] }));
  const passos = feedback.erro.passos;

  return (
    <>
      <Animated.View style={[styles.rugiErro, peekStyle]}>
        <Rugi mood="pensativo" width={100} />
      </Animated.View>
      <Text style={[styles.title, styles.erroTitle]}>Quase! Olha só:</Text>
      <Text style={styles.hint}>{feedback.erro.dica}</Text>
      {passos && (
        <View style={styles.steps} accessible accessibilityLabel={passos.join(', então ')}>
          {passos.map((p, i) => (
            <Fragment key={p}>
              {i > 0 && <ArrowRightIcon size={18} color={colors.error} />}
              <Step text={p} delay={500 + 300 * i} last={i === passos.length - 1} />
            </Fragment>
          ))}
        </View>
      )}
    </>
  );
}

function Step({ text, delay, last }: { text: string; delay: number; last: boolean }) {
  const t = useOnce(300, delay, Easing.ease);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateX: -6 * (1 - t.value) }] }));
  return (
    <Animated.View style={[styles.step, last && styles.stepLast, style]}>
      <Text style={[styles.stepText, last && styles.stepTextLast]} numberOfLines={1}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingHorizontal: space.gutter,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  rugiAcerto: { position: 'absolute', right: 14, top: -46 },
  rugiErro: { position: 'absolute', right: 18, top: -62 },
  titleRow: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
  okDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.fredoka700, fontSize: 28 },
  erroTitle: { lineHeight: 31, color: colors.errorText },
  xpRow: { marginTop: 8, maxWidth: 230, flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpPill: { height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpText: { fontFamily: fonts.fredoka600, fontSize: 15, color: colors.red },
  acertoText: { flexShrink: 1, fontFamily: fonts.nunito700, fontSize: 15, color: colors.successText },
  hint: { marginTop: 8, maxWidth: 250, fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 22, color: colors.text },
  steps: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { height: 44, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.white, justifyContent: 'center' },
  stepLast: { backgroundColor: colors.successBg, borderWidth: sizes.borderWidth, borderColor: colors.success },
  stepText: { fontFamily: fonts.fredoka600, fontSize: 17, color: colors.text },
  stepTextLast: { fontFamily: fonts.fredoka700, color: colors.successText },
});
