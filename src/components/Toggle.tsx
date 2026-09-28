import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/theme';

const ease = Easing.out(Easing.ease);

/** Interruptor no estilo Fera: trilho `border` → vermelho, bolinha branca com sombra sólida. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.set(withTiming(value ? 1 : 0, { duration: 160, easing: ease }));
  }, [value, t]);
  const trackStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], [colors.border, colors.red]) }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: 20 * t.value }] }));

  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} hitSlop={8}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 32, borderRadius: radius.pill, padding: 4 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, boxShadow: `0px 2px 0px ${colors.locked}` },
});

