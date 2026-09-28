// Material de estudo gerado pela IA (prévia — sem design no canvas; conteúdo de exemplo).
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Explicacao } from '@/components/materiais/Explicacao';
import { Fluxo } from '@/components/materiais/Fluxo';
import { Grafico } from '@/components/materiais/Grafico';
import { Imagens } from '@/components/materiais/Imagens';
import { Mapa } from '@/components/materiais/Mapa';
import { Resumo } from '@/components/materiais/Resumo';
import { Slides } from '@/components/materiais/Slides';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formato } from '@/data/formatos';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const VIEWERS: Record<string, () => React.JSX.Element> = {
  resumo: Resumo,
  explicacao: Explicacao,
  mapa: Mapa,
  slides: Slides,
  grafico: Grafico,
  fluxo: Fluxo,
  imagens: Imagens,
};

export default function Material() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const insets = useSafeAreaInsets();
  const f = formato(tipo ?? '');
  const Viewer = VIEWERS[tipo ?? ''];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={f?.nome ?? 'Material'} />
      <View style={styles.tag}>
        <Text style={styles.tagText}>GERADO PELA IA · EXEMPLO</Text>
      </View>
      <Text style={styles.title}>Funções do 1º grau</Text>
      <View style={{ marginTop: 16 }}>{Viewer ? <Viewer /> : <Text style={styles.missing}>Esse formato ainda não tem prévia.</Text>}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  tag: { alignSelf: 'flex-start', marginTop: 20, height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  tagText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
  title: { ...type.screenTitle, marginTop: 10, lineHeight: 31, color: colors.text },
  missing: { fontFamily: fonts.nunito700, fontSize: 16, color: colors.textMuted },
});
