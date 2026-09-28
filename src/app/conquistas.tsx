// Todas as conquistas (fora do design — prévia). Aberta por "Ver todas" no Perfil.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InfoSheet } from '@/components/InfoSheet';
import { MedalGrid } from '@/components/Medal';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { CONQUISTAS, type Conquista } from '@/data/conquistas';
import { colors, fonts, sizes, space } from '@/theme';

export default function Conquistas() {
  const insets = useSafeAreaInsets();
  const [medalha, setMedalha] = useState<Conquista | null>(null);
  const feitas = CONQUISTAS.filter((c) => !c.bloqueada);
  const bloqueadas = CONQUISTAS.filter((c) => c.bloqueada);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Conquistas" />

      <View style={styles.summary}>
        <Text style={styles.count}>
          {feitas.length}
          <Text style={styles.countTotal}> de {CONQUISTAS.length}</Text>
        </Text>
        <Text style={styles.countLabel}>conquistas desbloqueadas</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <ProgressBar height={14} shine={3} progress={feitas.length / CONQUISTAS.length} accessibilityLabel="Conquistas desbloqueadas" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Desbloqueadas</Text>
      <MedalGrid items={feitas} onPress={setMedalha} />

      <Text style={styles.sectionTitle}>Pra conquistar</Text>
      <MedalGrid items={bloqueadas} onPress={setMedalha} />

      {medalha && (
        <InfoSheet
          mood={medalha.bloqueada ? 'pensativo' : 'trofeu'}
          title={medalha.nomeLongo ?? medalha.nome}
          text={medalha.bloqueada ? `Bloqueada. ${medalha.descricao}` : medalha.descricao}
          button={medalha.bloqueada ? 'Bora conseguir' : 'Show!'}
          onClose={() => setMedalha(null)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  summary: { marginTop: 20, padding: 18, borderRadius: 24, backgroundColor: colors.offWhite },
  count: { fontFamily: fonts.fredoka700, fontSize: 40, lineHeight: 44, color: colors.red },
  countTotal: { fontSize: 22, color: colors.text },
  countLabel: { fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
  sectionTitle: { marginTop: 24, marginBottom: 12, fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
});
