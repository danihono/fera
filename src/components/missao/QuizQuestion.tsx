// 06a · Quiz — canvas artboards Quiz.dc.html / Acerto.dc.html / Erro.dc.html
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CheckIcon, XMarkIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import type { QuizQuestion as Q } from '@/data/missao';
import { kf } from '@/lib/anim';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';
import type { Result } from './types';

const LETTERS = ['A', 'B', 'C', 'D'];

type Props = { q: Q; value: number | null; onChange: (i: number) => void; result: Result };

/** Alternativa que não cabe no quadrado de 96px com fonte 28 vira lista. */
const LIMITE_GRADE = 9;

export function QuizQuestion({ q, value, onChange, result }: Props) {
  const lista = q.alternativas.some((a) => a.length > LIMITE_GRADE);
  return (
    <View>
      <View style={styles.askRow}>
        {/* Some durante o feedback, mas guarda o espaço (visibility: hidden no design). */}
        <Rugi mood="pensativo" width={64} style={{ opacity: result ? 0 : 1 }} accessibilityLabel="Rugi pensando" />
        <View style={styles.bubble}>
          <Text style={styles.question}>{q.pergunta}</Text>
        </View>
      </View>

      {/* Sem fórmula (questões de texto), o quadro some. */}
      {!!q.formula && (
        <View style={styles.formula}>
          <Text style={[styles.formulaText, q.formula.length > 16 && styles.formulaLonga]} numberOfLines={2} adjustsFontSizeToFit>
            {q.formula}
          </Text>
        </View>
      )}

      {/* Respostas curtas (contas) ficam na grade 2 × 2 do design; frases viram lista. */}
      {lista ? (
        <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Alternativas">
          {q.alternativas.map((alt, i) => (
            <Option key={i} wide letter={LETTERS[i]} text={alt} state={optionState(i, value, q.resposta, result)} onPress={() => onChange(i)} disabled={!!result} />
          ))}
        </View>
      ) : (
        <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Alternativas">
          {[0, 2].map((row) => (
            <View key={row} style={styles.gridRow}>
              {[row, row + 1].map((i) => (
                <Option
                  key={i}
                  letter={LETTERS[i]}
                  text={q.alternativas[i]}
                  state={optionState(i, value, q.resposta, result)}
                  onPress={() => onChange(i)}
                  disabled={!!result}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'reveal' | 'dim';

function optionState(i: number, value: number | null, answer: number, result: Result): OptionState {
  if (!result) return i === value ? 'selected' : 'idle';
  if (i === value) return result === 'correct' ? 'correct' : 'wrong';
  if (result === 'wrong' && i === answer) return 'reveal';
  return 'dim';
}

const look: Record<OptionState, { border: string; bg: string; shadow?: string; text: string; dashed?: boolean; opacity?: number }> = {
  idle: { border: colors.border, bg: colors.white, shadow: colors.border, text: colors.text },
  selected: { border: colors.red, bg: colors.redSoft, shadow: colors.red, text: colors.redText },
  correct: { border: colors.success, bg: colors.successBg, shadow: colors.success, text: colors.successText },
  wrong: { border: colors.error, bg: colors.errorBg, shadow: colors.error, text: colors.errorText },
  reveal: { border: colors.success, bg: colors.white, text: colors.successText, dashed: true },
  dim: { border: colors.border, bg: colors.white, text: colors.text, opacity: 0.45 },
};

function Option({ letter, text, state, onPress, disabled, wide }: { letter: string; text: string; state: OptionState; onPress: () => void; disabled: boolean; wide?: boolean }) {
  const l = look[state];

  // shake .5s ease-in-out, só quando a resposta escolhida está errada.
  const shake = useSharedValue(0);
  useEffect(() => {
    if (state === 'wrong') shake.set(withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }));
  }, [state, shake]);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: kf(shake.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], [0, -8, 7, -5, 4, -2, 0]) }],
  }));

  return (
    <Animated.View style={[wide ? undefined : styles.optionWrap, shakeStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: state === 'selected' || state === 'correct' || state === 'wrong', disabled }}
        accessibilityLabel={`${letter}: ${text}`}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.option,
          wide && styles.optionWide,
          {
            borderColor: l.border,
            borderStyle: l.dashed ? 'dashed' : 'solid',
            backgroundColor: l.bg,
            opacity: l.opacity ?? 1,
            boxShadow: l.shadow && !pressed ? solidShadow(l.shadow) : 'none',
            transform: [{ translateY: pressed ? sizes.shadow : 0 }],
          },
        ]}
      >
        <Badge letter={letter} state={state} wide={wide} />
        <Text style={[styles.optionText, wide && styles.optionTextWide, { color: l.text }]}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

function Badge({ letter, state, wide }: { letter: string; state: OptionState; wide?: boolean }) {
  const pos = wide ? styles.badgeWide : undefined;
  switch (state) {
    case 'dim':
      return null;
    case 'selected':
      return (
        <View style={[styles.badge, pos, { backgroundColor: colors.red }]}>
          <Text style={[styles.badgeText, { color: colors.white }]}>{letter}</Text>
        </View>
      );
    case 'correct':
      return (
        <View style={[styles.badge, pos, { backgroundColor: colors.success }]}>
          <CheckIcon size={16} strokeWidth={3.8} color={colors.white} />
        </View>
      );
    case 'wrong':
      return (
        <View style={[styles.badge, pos, { backgroundColor: colors.error }]}>
          <XMarkIcon size={14} strokeWidth={4} color={colors.white} />
        </View>
      );
    case 'reveal':
      return (
        <View style={[styles.badge, pos, { backgroundColor: colors.successBg }]}>
          <CheckIcon size={16} strokeWidth={3.8} color={colors.successText} />
        </View>
      );
    default:
      return (
        <View style={[styles.badge, pos, styles.badgeIdle]}>
          <Text style={styles.badgeText}>{letter}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  askRow: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bubble: {
    flex: 1,
    marginBottom: 18,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  question: { fontFamily: fonts.nunito800, fontSize: 20, lineHeight: 25, color: colors.text },
  formula: { marginTop: 16, height: 84, borderRadius: radius.card, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  formulaText: { fontFamily: fonts.fredoka600, fontSize: 36, letterSpacing: 0.5, color: colors.text },
  formulaLonga: { fontSize: 24, textAlign: 'center', paddingHorizontal: 16 },
  grid: { marginTop: 20, gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  optionWrap: { flex: 1 },
  option: {
    height: 96,
    borderRadius: radius.option,
    borderWidth: sizes.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { fontFamily: fonts.fredoka600, fontSize: 28 },
  // Lista (alternativas em frase): altura pelo texto, letra à esquerda.
  optionWide: { height: 'auto', minHeight: 64, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'flex-start', gap: 12 },
  optionTextWide: { flexShrink: 1, fontFamily: fonts.nunito800, fontSize: 17, lineHeight: 22 },
  badgeWide: { position: 'relative', top: 0, left: 0 },
  badge: {
    position: 'absolute',
    top: 10,
    left: 12,
    width: 26,
    height: 26,
    borderRadius: radius.tag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIdle: { borderWidth: sizes.borderWidth, borderColor: colors.border },
  badgeText: { fontFamily: fonts.nunito900, fontSize: 13, color: colors.textMuted },
});
