import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { radius } from '@/theme';

type Props = {
  foto?: string | null;
  inicial: string;
  /** O círculo (tamanho, fundo, borda) é de quem usa: cada tela do design tem o seu. */
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
};

/** Foto de perfil se tiver; senão, a inicial do nome. A foto fica dentro da borda do círculo. */
export function Avatar({ foto, inicial, style, textStyle }: Props) {
  return (
    <View style={style}>
      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Text style={textStyle}>{inicial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  foto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill },
});
