// 04 · Nova prova — próxima etapa: construir a partir de NovaProva.dc.html
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComingSoon } from '@/components/ComingSoon';
import { FeraButton } from '@/components/FeraButton';
import { colors, space } from '@/theme';

export default function NovaProva() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <ComingSoon title="Nova prova" mood="impaciente" />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <FeraButton label="Voltar" variant="secondary" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: space.gutter, backgroundColor: colors.white },
});
