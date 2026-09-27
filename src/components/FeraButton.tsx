import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';

type Variant = 'primary' | 'secondary' | 'success' | 'error' | 'onRed';

// Valores exatos da seção "Botões" do design system.
const variants: Record<
  Variant,
  { bg: string; pressedBg: string; shadow: string; color: string; border?: string; font: string; size: number; tracking: number }
> = {
  primary: { bg: colors.red, pressedBg: colors.redPressed, shadow: colors.redDeep, color: colors.white, font: fonts.nunito800, size: 18, tracking: 0.6 },
  secondary: { bg: colors.white, pressedBg: colors.white, shadow: colors.border, color: colors.redText, border: colors.border, font: fonts.nunito900, size: 16, tracking: 0.4 },
  success: { bg: colors.successButton, pressedBg: colors.successButton, shadow: colors.successButtonShadow, color: colors.white, font: fonts.nunito800, size: 19, tracking: 0.6 },
  error: { bg: colors.error, pressedBg: colors.error, shadow: colors.errorShadow, color: colors.text, font: fonts.nunito900, size: 18, tracking: 0.6 },
  onRed: { bg: colors.white, pressedBg: colors.white, shadow: colors.redDeep, color: colors.redText, font: fonts.nunito900, size: 18, tracking: 0.6 },
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Botão "físico": sombra sólida de 4px embaixo; ao tocar, afunda 4px e a sombra some. */
export function FeraButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        disabled
          ? { backgroundColor: colors.border }
          : {
              backgroundColor: pressed ? v.pressedBg : v.bg,
              boxShadow: pressed ? 'none' : solidShadow(v.shadow),
              transform: [{ translateY: pressed ? sizes.shadow : 0 }],
            },
        !disabled && v.border ? { borderWidth: sizes.borderWidth, borderColor: v.border } : null,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          disabled
            ? { color: colors.textMuted, fontFamily: fonts.nunito800, fontSize: 18, letterSpacing: 0.6 }
            : { color: v.color, fontFamily: v.font, fontSize: v.size, letterSpacing: v.tracking },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.button,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sizes.shadow, // reserva o espaço da sombra
  },
  label: {
    textTransform: 'uppercase',
  },
});
