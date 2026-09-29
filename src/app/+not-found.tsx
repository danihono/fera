// Página não encontrada (link quebrado, endereço digitado errado na web).
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ellipse } from '@/components/Ellipse';
import { FeraButton } from '@/components/FeraButton';
import { Rugi } from '@/components/Rugi';
import { goHome } from '@/lib/nav';
import { colors, fonts, sizes, space, type } from '@/theme';

export default function NaoEncontrada() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tela, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}>
      <View style={styles.centro}>
        <View style={styles.palco}>
          <Ellipse width={120} height={14} color={colors.border} style={styles.sombra} />
          <Rugi mood="pensativo" width={190} />
        </View>
        <Text style={styles.codigo}>404</Text>
        <Text style={styles.titulo} accessibilityRole="header">
          Essa página sumiu
        </Text>
        <Text style={styles.texto}>O Rugi procurou em todo canto e não achou. Pode ter sido um link quebrado.</Text>
      </View>
      <FeraButton label="Voltar pro início" onPress={goHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  palco: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  sombra: { position: 'absolute', bottom: 0 },
  codigo: { marginTop: 10, fontFamily: fonts.fredoka700, fontSize: 48, lineHeight: 52, color: colors.red },
  titulo: { ...type.screenTitle, lineHeight: 34, color: colors.text, textAlign: 'center' },
  texto: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 23, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
});
