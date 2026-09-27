import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { colors, radius } from '@/theme';

type Props = {
  /** 0 → 1. Ignorado se `fillStyle` (animado) definir a largura. */
  progress?: number;
  height?: number;
  /** Altura do brilho interno (4 na missão, 3 na barra de nível). */
  shine?: number;
  fillStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Barra vermelha com brilho interno (trilho `border`, cantos pill). */
export function ProgressBar({ progress = 0, height = 16, shine = 4, fillStyle, style, accessibilityLabel }: Props) {
  return (
    <View
      style={[styles.track, { height }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
    >
      <Animated.View style={[styles.fill, { height, width: `${progress * 100}%` }, fillStyle]}>
        <View style={[styles.shine, { height: shine }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { borderRadius: radius.pill, backgroundColor: colors.red },
  shine: { position: 'absolute', left: 8, right: 8, top: 3, borderRadius: radius.pill, backgroundColor: colors.redHighlight },
});
