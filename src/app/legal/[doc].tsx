// Termos de uso e Política de privacidade (fora do design — prévia no estilo do design system).
// Textos em src/data/legal.ts (versão preliminar: revisar com advogado antes de publicar).
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aviso } from '@/components/conta/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LEGAL } from '@/data/legal';
import { colors, fonts, sizes, space, type } from '@/theme';

export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const insets = useSafeAreaInsets();
  const d = LEGAL[doc === 'privacidade' ? 'privacidade' : 'termos'];

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.miolo, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={d.titulo} />
      <Text style={styles.titulo} accessibilityRole="header">
        {d.titulo}
      </Text>
      <Text style={styles.data}>Atualizado em {d.atualizado}</Text>
      <View style={{ marginTop: 14 }}>
        <Aviso>Versão preliminar, pra mostrar como o app fica. O texto oficial entra antes do lançamento.</Aviso>
      </View>
      <Text style={styles.intro}>{d.intro}</Text>
      {d.secoes.map((s) => (
        <View key={s.titulo} style={styles.secao}>
          <Text style={styles.secaoTitulo} accessibilityRole="header">
            {s.titulo}
          </Text>
          {s.paragrafos.map((p) => (
            <Text key={p.slice(0, 40)} style={styles.paragrafo}>
              {p}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter },
  titulo: { ...type.screenTitle, lineHeight: 34, color: colors.text, marginTop: 18 },
  data: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  intro: { marginTop: 16, fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 24, color: colors.text },
  secao: { marginTop: 22, gap: 8 },
  secaoTitulo: { fontFamily: fonts.nunito900, fontSize: 17, color: colors.text },
  paragrafo: { fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 23, color: colors.textMuted },
});
