import { useEffect } from 'react';
import { Easing, useSharedValue, withDelay, withRepeat, withTiming, type EasingFunction } from 'react-native-reanimated';

/**
 * Relógio 0 → 1 que se repete para sempre (um `animation: ... infinite` do CSS).
 * Use o valor dentro de useAnimatedStyle e monte os keyframes a partir dele.
 */
export function useLoop(duration: number, { delay = 0, easing = Easing.linear }: { delay?: number; easing?: EasingFunction } = {}) {
  const t = useSharedValue(0);
  useEffect(() => {
    const loop = withRepeat(withTiming(1, { duration, easing }), -1, false);
    t.set(delay ? withDelay(delay, loop) : loop);
  }, [t, duration, delay, easing]);
  return t;
}

/** Interpola linearmente um valor entre keyframes: `kf(p, [0, 0.5, 1], [0, -10, 0])`. */
export function kf(p: number, stops: number[], values: number[]) {
  'worklet';
  if (p <= stops[0]) return values[0];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i]) {
      const f = (p - stops[i - 1]) / (stops[i] - stops[i - 1] || 1);
      return values[i - 1] + f * (values[i] - values[i - 1]);
    }
  }
  return values[values.length - 1];
}

/** Curva "ease-in-out" de ida e volta: 0 → 1 → 0 em um ciclo. */
export function pingPong(p: number) {
  'worklet';
  return 0.5 - 0.5 * Math.cos(p * 2 * Math.PI);
}
