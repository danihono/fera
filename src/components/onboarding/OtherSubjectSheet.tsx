import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { FeraButton } from '@/components/FeraButton';
import { colors, fonts, radius, sizes, space } from '@/theme';

// Mesma entrada das sheets do design (Acerto/Erro): `up .35s cubic-bezier(.2,.9,.3,1)`.
const SHEET_MS = 350;
const sheetEasing = Easing.bezier(0.2, 0.9, 0.3, 1);

type Props = {
  /** Chamado com o nome digitado (sem espaços nas pontas) depois que a sheet desce. */
  onSubmit: (name: string) => void;
  /** Chamado quando a sheet termina de fechar, com ou sem matéria. */
  onClose: () => void;
};

/** "Outra matéria" (02b): campo de texto + CONTINUAR. Monte só enquanto estiver aberta. */
export function OtherSubjectSheet({ onSubmit, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [height, setHeight] = useState(0);
  const open = useSharedValue(0);

  useEffect(() => {
    open.set(withTiming(1, { duration: SHEET_MS, easing: sheetEasing }));
  }, [open]);

  const dismiss = (submitted?: string) => {
    open.set(
      withTiming(0, { duration: SHEET_MS, easing: sheetEasing }, (done) => {
        if (!done) return;
        if (submitted) scheduleOnRN(onSubmit, submitted);
        scheduleOnRN(onClose);
      }),
    );
  };

  const trimmed = name.trim();
  const scrimStyle = useAnimatedStyle(() => ({ opacity: open.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    // translateY(100%) → 0; até medir a altura, fica fora da tela.
    transform: [{ translateY: height ? (1 - open.value) * height : 1000 }],
  }));

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => dismiss()}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable style={styles.fill} accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => dismiss()} />
        </Animated.View>
        <Animated.View
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow },
            sheetStyle,
          ]}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Qual matéria?"
            placeholderTextColor={colors.textMuted}
            autoFocus
            autoCapitalize="sentences"
            returnKeyType="done"
            maxLength={40}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => trimmed && dismiss(trimmed)}
            style={[styles.input, focused && { borderColor: colors.red }]}
          />
          <FeraButton label="Continuar" disabled={!trimmed} onPress={() => dismiss(trimmed)} />
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
  input: {
    height: sizes.button,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: space.l,
    fontFamily: fonts.nunito800,
    fontSize: 16,
    color: colors.text,
    outlineWidth: 0, // web: sem o contorno do navegador; o foco é a borda vermelha
  },
});
