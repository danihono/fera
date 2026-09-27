// 06b · Lacuna (complete a frase) — canvas artboard Lacuna.dc.html
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import type { LacunaQuestion as Q } from '@/data/missao';
import { pingPong, useLoop } from '@/lib/anim';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';
import type { Result } from './types';

type Props = {
  q: Q;
  /** Palavra (índice do banco) em cada lacuna, ou null. */
  value: (number | null)[];
  onChange: (value: (number | null)[]) => void;
  result: Result;
};

/**
 * Toque numa palavra do banco para colocá-la na próxima lacuna vazia; toque numa lacuna preenchida
 * para devolver a palavra. O lugar da palavra no banco fica marcado enquanto ela está na frase.
 */
export function LacunaQuestion({ q, value, onChange, result }: Props) {
  const place = (word: number) => {
    const slot = value.indexOf(null);
    if (slot < 0) return;
    const next = [...value];
    next[slot] = word;
    onChange(next);
  };
  const remove = (slot: number) => {
    const next = [...value];
    next[slot] = null;
    onChange(next);
  };

  return (
    <View>
      <Text style={styles.instruction}>{q.instrucao}</Text>

      <View style={styles.card}>
        <Text style={styles.sentence}>
          {q.frase.map((part, i) => {
            if (typeof part === 'string') return part;
            if ('formula' in part)
              return (
                <Text key={i} style={styles.formula}>
                  {part.formula}
                </Text>
              );
            const word = value[part.lacuna];
            const state = !result ? 'filled' : q.banco[word ?? -1] === q.respostas[part.lacuna] ? 'correct' : 'wrong';
            return word == null ? (
              <EmptySlot key={i} blinking={!result} />
            ) : (
              <FilledSlot key={i} text={q.banco[word]} state={state} disabled={!!result} onPress={() => remove(part.lacuna)} />
            );
          })}
        </Text>
      </View>

      <View style={styles.bank} accessibilityRole="none" accessibilityLabel="Banco de palavras">
        {q.banco.map((w, i) =>
          value.includes(i) ? (
            <View key={i} style={[styles.word, styles.wordUsed]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={[styles.wordText, { opacity: 0 }]}>{w}</Text>
            </View>
          ) : (
            <Pressable
              key={i}
              accessibilityRole="button"
              disabled={!!result}
              onPress={() => place(i)}
              style={({ pressed }) => [
                styles.word,
                { boxShadow: pressed ? 'none' : solidShadow(colors.border), transform: [{ translateY: pressed ? 3 : 0 }] },
              ]}
            >
              <Text style={styles.wordText}>{w}</Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const slotLook = {
  filled: { border: colors.red, bg: colors.white, text: colors.redText },
  correct: { border: colors.success, bg: colors.successBg, text: colors.successText },
  wrong: { border: colors.error, bg: colors.errorBg, text: colors.errorText },
};

function FilledSlot({ text, state, disabled, onPress }: { text: string; state: keyof typeof slotLook; disabled: boolean; onPress: () => void }) {
  const l = slotLook[state];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tirar ${text} da frase`}
      disabled={disabled}
      onPress={onPress}
      style={[styles.slot, styles.slotFilled, { borderColor: l.border, backgroundColor: l.bg, boxShadow: solidShadow(l.border, 3) }]}
    >
      <Text style={[styles.slotText, { color: l.text }]}>{text}</Text>
    </Pressable>
  );
}

/** Lacuna vazia: borda tracejada piscando entre red e redBlush (blink 1.2s). */
function EmptySlot({ blinking }: { blinking: boolean }) {
  const t = useLoop(1200);
  const blinkStyle = useAnimatedStyle(() => ({
    borderColor: blinking ? interpolateColor(pingPong(t.value), [0, 1], [colors.red, colors.redBlush]) : colors.red,
  }));
  return <Animated.View accessibilityLabel="Lacuna vazia" style={[styles.slot, styles.slotEmpty, blinkStyle]} />;
}

const styles = StyleSheet.create({
  instruction: { marginTop: 14, fontFamily: fonts.nunito800, fontSize: 20, lineHeight: 25, color: colors.text },
  card: {
    marginTop: 20,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  sentence: { fontFamily: fonts.nunito700, fontSize: 21, lineHeight: 48, color: colors.text },
  formula: { fontFamily: fonts.fredoka600, color: colors.red },
  slot: { height: 42, borderRadius: 14, borderWidth: sizes.borderWidth, alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' },
  slotFilled: { minWidth: 58, paddingHorizontal: 14 },
  slotEmpty: { minWidth: 72, backgroundColor: colors.redSoft, borderStyle: 'dashed' },
  slotText: { fontFamily: fonts.fredoka600, fontSize: 22, lineHeight: 22 },
  bank: { marginTop: 30, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  word: {
    height: 52,
    minWidth: 60,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordUsed: { borderColor: colors.border, backgroundColor: colors.border },
  wordText: { fontFamily: fonts.fredoka600, fontSize: 22, color: colors.text },
});
