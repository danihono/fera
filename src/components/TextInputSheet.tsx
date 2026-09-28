import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import { colors, fonts, radius, sizes, space } from '@/theme';

type Props = {
  placeholder: string;
  title?: string;
  button?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
  /** Chamado com o texto (sem espaços nas pontas) depois que a sheet desce. */
  onSubmit: (value: string) => void;
  onClose: () => void;
};

/** Sheet com um campo de texto e CONTINUAR (desativado enquanto vazio). */
export function TextInputSheet({ placeholder, title, button = 'Continuar', autoCapitalize = 'sentences', maxLength = 40, onSubmit, onClose }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const trimmed = value.trim();

  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          {title && <Text style={styles.title}>{title}</Text>}
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            autoFocus
            autoCapitalize={autoCapitalize}
            returnKeyType="done"
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => trimmed && close(() => onSubmit(trimmed))}
            style={[styles.input, focused && { borderColor: colors.red }]}
          />
          <FeraButton label={button} disabled={!trimmed} onPress={() => close(() => onSubmit(trimmed))} />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text },
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
