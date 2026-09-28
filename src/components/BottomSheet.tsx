import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { colors, radius, sizes, space } from '@/theme';

// Mesma entrada das sheets do design (Acerto/Erro): `up .35s cubic-bezier(.2,.9,.3,1)`.
const SHEET_MS = 350;
const sheetEasing = Easing.bezier(0.2, 0.9, 0.3, 1);

/** Fecha a sheet (anima pra baixo) e, depois, roda `after` se vier. */
export type CloseSheet = (after?: () => void) => void;

type Props = {
  /** Chamado quando a sheet termina de fechar. */
  onClose: () => void;
  children: (close: CloseSheet) => ReactNode;
};

/**
 * Bottom sheet branca (cantos 24, borda 2px) sobre fundo escurecido. Monte só enquanto estiver aberta:
 * ela sobe ao montar e desce ao chamar `close`. Toque fora ou voltar do Android fecham.
 */
export function BottomSheet({ onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const open = useSharedValue(0);

  useEffect(() => {
    open.set(withTiming(1, { duration: SHEET_MS, easing: sheetEasing }));
  }, [open]);

  const close: CloseSheet = (after) => {
    open.set(
      withTiming(0, { duration: SHEET_MS, easing: sheetEasing }, (done) => {
        if (!done) return;
        if (after) scheduleOnRN(after);
        scheduleOnRN(onClose);
      }),
    );
  };

  const scrimStyle = useAnimatedStyle(() => ({ opacity: open.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    // translateY(100%) → 0; até medir a altura, fica fora da tela.
    transform: [{ translateY: height ? (1 - open.value) * height : 1000 }],
  }));

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => close()}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable style={styles.fill} accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => close()} />
        </Animated.View>
        <Animated.View
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }, sheetStyle]}
        >
          {children(close)}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: colors.scrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: sizes.borderWidth,
    borderLeftWidth: sizes.borderWidth,
    borderRightWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: space.xl,
    paddingHorizontal: space.gutter,
    gap: space.l,
  },
});
