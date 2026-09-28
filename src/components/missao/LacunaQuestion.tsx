// 06b · Lacuna (complete a frase) — canvas artboard Lacuna.dc.html
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { LacunaQuestion as Q } from '@/data/missao';
import { kf, pingPong, useLoop } from '@/lib/anim';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';
import type { Result } from './types';

type Props = {
  q: Q;
  /** Palavra (índice do banco) em cada lacuna, ou null. */
  value: (number | null)[];
  onChange: (value: (number | null)[]) => void;
  result: Result;
};

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Arraste uma palavra do banco até uma lacuna (ou toque nela para ir pra próxima lacuna vazia);
 * toque numa lacuna preenchida para devolver a palavra. O lugar da palavra no banco fica marcado
 * enquanto ela está na frase ou sendo arrastada.
 */
export function LacunaQuestion({ q, value, onChange, result }: Props) {
  const place = (word: number, slot = value.indexOf(null)) => {
    if (slot < 0) return;
    const next = [...value];
    next[slot] = word;
    onChange(next);
  };

  // Arrastar: posição da palavra "flutuando" relativa a este bloco, e retângulos das lacunas vazias.
  const rootRef = useRef<View>(null);
  const slotRefs = useRef<Record<number, View | null>>({});
  const origin = useRef({ x: 0, y: 0 });
  const slotRects = useRef<Record<number, Rect>>({});
  const gx = useSharedValue(0);
  const gy = useSharedValue(0);
  const [dragging, setDragging] = useState<number | null>(null);

  const drag = {
    start: (word: number, pageX: number, pageY: number, grabX: number, grabY: number) => {
      rootRef.current?.measureInWindow((x, y) => (origin.current = { x: x + grabX, y: y + grabY }));
      slotRects.current = {};
      value.forEach((w, slot) => {
        if (w == null) slotRefs.current[slot]?.measureInWindow((x, y, width, height) => (slotRects.current[slot] = { x, y, w: width, h: height }));
      });
      gx.set(pageX);
      gy.set(pageY);
      setDragging(word);
    },
    move: (pageX: number, pageY: number) => {
      gx.set(pageX);
      gy.set(pageY);
    },
    drop: (word: number, pageX: number, pageY: number) => {
      setDragging(null);
      // Folga de 16px em volta da lacuna pra ficar fácil de acertar com o dedo.
      const hit = Object.entries(slotRects.current).find(([, r]) => pageX > r.x - 16 && pageX < r.x + r.w + 16 && pageY > r.y - 16 && pageY < r.y + r.h + 16);
      if (hit) place(word, Number(hit[0]));
    },
    cancel: () => setDragging(null),
  };

  // hover 1.4s: a palavra arrastada balança (-6° ↔ -4°) como no design.
  const hover = useLoop(1400);
  const ghostStyle = useAnimatedStyle(() => {
    const w = pingPong(hover.value);
    return {
      transform: [
        { translateX: gx.value - origin.current.x + 2 * w },
        { translateY: gy.value - origin.current.y - 4 * w },
        { rotate: `${kf(w, [0, 1], [-6, -4])}deg` },
      ],
    };
  });
  const remove = (slot: number) => {
    const next = [...value];
    next[slot] = null;
    onChange(next);
  };

  return (
    <View ref={rootRef}>
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
              <EmptySlot key={i} blinking={!result} innerRef={(v) => (slotRefs.current[part.lacuna] = v)} />
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
            <BankWord
              key={i}
              text={w}
              lifted={dragging === i}
              disabled={!!result}
              onTap={() => place(i)}
              onDragStart={(x, y, gx0, gy0) => drag.start(i, x, y, gx0, gy0)}
              onDragMove={drag.move}
              onDrop={(x, y) => drag.drop(i, x, y)}
              onCancel={drag.cancel}
            />
          ),
        )}
      </View>

      {dragging != null && (
        <Animated.View pointerEvents="none" style={[styles.ghost, ghostStyle]}>
          <Text style={styles.wordText}>{q.banco[dragging]}</Text>
        </Animated.View>
      )}
    </View>
  );
}

type BankWordProps = {
  text: string;
  /** Sendo arrastada: o lugar fica marcado (mas o componente segue montado pra não perder o gesto). */
  lifted: boolean;
  disabled: boolean;
  onTap: () => void;
  onDragStart: (pageX: number, pageY: number, grabX: number, grabY: number) => void;
  onDragMove: (pageX: number, pageY: number) => void;
  onDrop: (pageX: number, pageY: number) => void;
  onCancel: () => void;
};

/** Palavra do banco: toque coloca na próxima lacuna; arrastar (mais de 6px) leva até a lacuna escolhida. */
function BankWord({ text, lifted, disabled, ...handlers }: BankWordProps) {
  const [pressed, setPressed] = useState(false);
  const h = useRef(handlers);
  useLayoutEffect(() => {
    h.current = handlers;
  });
  const state = useRef({ dragging: false, grabX: 0, grabY: 0 });

  // Os refs só são lidos dentro dos handlers do gesto (fora da renderização).
  const responder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          state.current = { dragging: false, grabX: e.nativeEvent.locationX, grabY: e.nativeEvent.locationY };
          setPressed(true);
        },
        onPanResponderMove: (e, g) => {
          const { pageX, pageY } = e.nativeEvent;
          if (!state.current.dragging && Math.hypot(g.dx, g.dy) > 6) {
            state.current.dragging = true;
            setPressed(false);
            h.current.onDragStart(pageX, pageY, state.current.grabX, state.current.grabY);
          }
          if (state.current.dragging) h.current.onDragMove(pageX, pageY);
        },
        onPanResponderRelease: (e) => {
          setPressed(false);
          if (state.current.dragging) h.current.onDrop(e.nativeEvent.pageX, e.nativeEvent.pageY);
          else h.current.onTap();
          state.current.dragging = false;
        },
        onPanResponderTerminate: () => {
          setPressed(false);
          if (state.current.dragging) h.current.onCancel();
          state.current.dragging = false;
        },
      }),
    [disabled],
  );

  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.word,
        lifted ? styles.wordUsed : { boxShadow: pressed ? 'none' : solidShadow(colors.border), transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}
    >
      <Text style={[styles.wordText, lifted && { opacity: 0 }]} selectable={false}>
        {text}
      </Text>
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
function EmptySlot({ blinking, innerRef }: { blinking: boolean; innerRef?: (v: View | null) => void }) {
  const t = useLoop(1200);
  const blinkStyle = useAnimatedStyle(() => ({
    borderColor: blinking ? interpolateColor(pingPong(t.value), [0, 1], [colors.red, colors.redBlush]) : colors.red,
  }));
  return <Animated.View ref={innerRef} accessibilityLabel="Lacuna vazia" style={[styles.slot, styles.slotEmpty, blinkStyle]} />;
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
  // Palavra arrastada: borda escura e sombra borrada, como o "b" do design.
  ghost: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    height: 50,
    minWidth: 60,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.text,
    boxShadow: `0px 10px 18px ${colors.dragShadow}`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
