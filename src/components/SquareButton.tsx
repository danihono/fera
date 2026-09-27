import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, sizes } from '@/theme';

/** Botão quadrado 48 × 48 com borda 2px (voltar, fechar) do topo das telas. */
export function SquareButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.button}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
