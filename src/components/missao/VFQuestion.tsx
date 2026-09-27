// 06c · Verdadeiro ou falso — canvas artboard VF.dc.html
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { CheckIcon, XMarkIcon } from '@/components/icons';
import type { VFQuestion as Q } from '@/data/missao';
import { kf } from '@/lib/anim';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';
import type { Result } from './types';

type Props = { q: Q; value: boolean | null; onChange: (v: boolean) => void; result: Result };

export function VFQuestion({ q, value, onChange, result }: Props) {
  return (
    <View>
      <View style={styles.card}>
        <View style={styles.graph}>
          <Svg width={220} height={116} viewBox="0 0 220 116">
            <Path d="M16 76h192" stroke={colors.axis} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M60 10v100" stroke={colors.axis} strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M30 110 L190 14" stroke={colors.red} strokeWidth={5} strokeLinecap="round" />
            <Circle cx={86} cy={76} r={8} fill={colors.white} stroke={colors.red} strokeWidth={4} />
            <SvgText x={94} y={100} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
              raiz
            </SvgText>
            <SvgText x={196} y={72} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
              x
            </SvgText>
            <SvgText x={66} y={20} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
              y
            </SvgText>
          </Svg>
        </View>
        <Text style={styles.statement}>{q.afirmacao}</Text>
      </View>

      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Resposta">
        {[true, false].map((v) => (
          <Option
            key={String(v)}
            truth={v}
            state={optionState(v, value, q.resposta, result)}
            onPress={() => onChange(v)}
            disabled={!!result}
          />
        ))}
      </View>
    </View>
  );
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'reveal' | 'dim';

function optionState(v: boolean, value: boolean | null, answer: boolean, result: Result): OptionState {
  if (!result) return v === value ? 'selected' : 'idle';
  if (v === value) return result === 'correct' ? 'correct' : 'wrong';
  if (result === 'wrong' && v === answer) return 'reveal';
  return 'dim';
}

const look: Record<OptionState, { border: string; bg: string; shadow?: string; dot: string; dotBorder?: boolean; icon: string; label: string; dashed?: boolean; opacity?: number }> = {
  idle: { border: colors.border, bg: colors.white, shadow: colors.border, dot: colors.offWhite, dotBorder: true, icon: colors.text, label: colors.text },
  selected: { border: colors.red, bg: colors.redSoft, shadow: colors.red, dot: colors.red, icon: colors.white, label: colors.redText },
  correct: { border: colors.success, bg: colors.successBg, shadow: colors.success, dot: colors.success, icon: colors.white, label: colors.successText },
  wrong: { border: colors.error, bg: colors.errorBg, shadow: colors.error, dot: colors.error, icon: colors.white, label: colors.errorText },
  reveal: { border: colors.success, bg: colors.white, dot: colors.successBg, icon: colors.successText, label: colors.successText, dashed: true },
  dim: { border: colors.border, bg: colors.white, dot: colors.offWhite, dotBorder: true, icon: colors.text, label: colors.text, opacity: 0.45 },
};

function Option({ truth, state, onPress, disabled }: { truth: boolean; state: OptionState; onPress: () => void; disabled: boolean }) {
  const l = look[state];
  const label = truth ? 'Verdadeiro' : 'Falso';

  const shake = useSharedValue(0);
  useEffect(() => {
    if (state === 'wrong') shake.set(withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }));
  }, [state, shake]);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: kf(shake.value, [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1], [0, -8, 7, -5, 4, -2, 0]) }],
  }));

  return (
    <Animated.View style={[styles.optionWrap, shakeStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityState={{ checked: state === 'selected' || state === 'correct' || state === 'wrong', disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.option,
          {
            borderColor: l.border,
            borderStyle: l.dashed ? 'dashed' : 'solid',
            backgroundColor: l.bg,
            opacity: l.opacity ?? 1,
            boxShadow: l.shadow && !pressed ? solidShadow(l.shadow, 5) : 'none',
            transform: [{ translateY: pressed ? 5 : 0 }],
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: l.dot }, l.dotBorder && styles.dotBorder]}>
          {truth ? <CheckIcon size={28} strokeWidth={3.2} color={l.icon} /> : <XMarkIcon size={24} strokeWidth={3.2} color={l.icon} />}
        </View>
        <Text style={[styles.label, { color: l.label }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, padding: 20, gap: 18 },
  graph: { height: 132, borderRadius: radius.button, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  statement: { fontFamily: fonts.nunito800, fontSize: 22, lineHeight: 29, color: colors.text },
  row: { marginTop: 20, flexDirection: 'row', gap: 12 },
  optionWrap: { flex: 1 },
  option: { height: 132, borderRadius: radius.card, borderWidth: sizes.borderWidth, alignItems: 'center', justifyContent: 'center', gap: 10 },
  dot: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  dotBorder: { borderWidth: sizes.borderWidth, borderColor: colors.border },
  label: { fontFamily: fonts.nunito900, fontSize: 18 },
});
