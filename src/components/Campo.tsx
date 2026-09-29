import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { EyeIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, space } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  erro?: string | null;
  dica?: string;
  /** Campo de senha, com o olhinho pra mostrar. */
  senha?: boolean;
};

/** Campo de formulário no estilo do design system: rótulo, borda 2px (vermelha no foco), erro embaixo. */
export const Campo = forwardRef<TextInput, Props>(function Campo({ rotulo, erro, dica, senha, onFocus, onBlur, ...props }, ref) {
  const [foco, setFoco] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, foco && { borderColor: colors.red }, !!erro && { borderColor: colors.error }]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={senha && !mostrar}
          autoCapitalize={senha ? 'none' : props.autoCapitalize}
          autoCorrect={senha ? false : props.autoCorrect}
          accessibilityLabel={rotulo}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
          style={styles.input}
          {...props}
        />
        {senha && (
          <Pressable accessibilityRole="button" accessibilityLabel={mostrar ? 'Esconder senha' : 'Mostrar senha'} hitSlop={10} onPress={() => setMostrar((m) => !m)} style={styles.olho}>
            <EyeIcon off={mostrar} />
          </Pressable>
        )}
      </View>
      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : dica ? (
        <Text style={styles.dica}>{dica}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  rotulo: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text, paddingHorizontal: 4 },
  caixa: {
    height: sizes.button,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: space.l,
    fontFamily: fonts.nunito700,
    fontSize: 16,
    color: colors.text,
    outlineWidth: 0, // web: o foco é a borda vermelha
  },
  olho: { width: 48, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  erro: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.errorText, paddingHorizontal: 4 },
  dica: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted, paddingHorizontal: 4 },
});
