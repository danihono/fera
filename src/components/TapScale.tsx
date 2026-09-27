import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  /** Escala ao tocar: `.chip:active` = 0.96, `.tap:active` = 0.95. */
  scale: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Chips e opções que encolhem ao tocar (`transition: transform .12s ease`). */
export function TapScale({ scale, style, children, onPressIn, onPressOut, ...rest }: Props) {
  const s = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const to = (v: number) => withTiming(v, { duration: 120, easing: Easing.ease });
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        s.set(to(scale));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.set(to(1));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
