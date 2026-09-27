import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, type EasingFunction } from 'react-native-reanimated';
import { kf } from '@/lib/anim';

export type ConfettiSpec = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** 3 = retângulo arredondado; 'circle' = bolinha. */
  shape: 3 | 'circle';
  color: string;
  duration: number;
  delay: number;
};

type Fall = { from: number; to: number; rotate: number; fadeIn: number; easing: EasingFunction };

/** Keyframes "fall" do Acerto: −30 → 120px, gira 260°, aparece até 15%, ease-in. */
export const FALL_ACERTO: Fall = { from: -30, to: 120, rotate: 260, fadeIn: 0.15, easing: Easing.in(Easing.ease) };
/** Keyframes "fall" da Fim: −20 → 260px, gira 300°, aparece até 10%, linear. */
export const FALL_FIM: Fall = { from: -20, to: 260, rotate: 300, fadeIn: 0.1, easing: Easing.linear };

/** Confete caindo em loop (`animation: fall <duração> <atraso> infinite`). */
export function ConfettiPiece({ spec, fall }: { spec: ConfettiSpec; fall: Fall }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(spec.delay, withRepeat(withTiming(1, { duration: spec.duration, easing: fall.easing }), -1, false)));
  }, [t, spec.delay, spec.duration, fall.easing]);
  const style = useAnimatedStyle(() => ({
    opacity: kf(t.value, [0, fall.fadeIn, 1], [0, 1, 0]),
    transform: [{ translateY: fall.from + (fall.to - fall.from) * t.value }, { rotate: `${fall.rotate * t.value}deg` }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: spec.left,
          top: spec.top,
          width: spec.width,
          height: spec.height,
          borderRadius: spec.shape === 'circle' ? spec.width / 2 : spec.shape,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}
