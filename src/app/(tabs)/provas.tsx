// Aba Provas — sem design no canvas; prévia montada com o design system (card da Início + listas).
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, SubjectIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { ProvaCard } from '@/components/ProvaCard';
import { mockProva, mockProvas } from '@/data/mock';
import { diasAte, useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

export default function Provas() {
  const insets = useSafeAreaInsets();
  const { prova } = useApp();
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Provas</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/prova/nova')}
          style={({ pressed }) => [styles.newButton, { boxShadow: pressed ? 'none' : solidShadow(colors.redDeep, 3), transform: [{ translateY: pressed ? 3 : 0 }] }]}
        >
          <Text style={styles.newButtonText}>+ Nova</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Agora</Text>
      <Pressable accessibilityRole="link" onPress={() => router.navigate('/(tabs)')}>
        <ProvaCard
          materia={prova.materia}
          topico={prova.topico}
          data={prova.data}
          dias={diasAte(prova.data)}
          feitas={mockProva.missoesFeitas}
          total={mockProva.missoesTotal}
        />
      </Pressable>

      <Text style={styles.section}>Próximas</Text>
      <View style={styles.list}>
        {mockProvas.proximas.map((p, i) => {
          const data = new Date(prova.data.getTime() + (p.emDias - diasAte(prova.data)) * 86400000);
          return (
            <Pressable
              key={p.materia}
              accessibilityRole="button"
              onPress={() =>
                setInfo({ title: `Prova de ${p.materia}`, text: `A trilha de ${p.topico} abre quando a prova de ${prova.materia} passar. Uma de cada vez!` })
              }
              style={[styles.row, i > 0 && styles.rowDivider]}
            >
              <View style={styles.rowIcon}>
                <SubjectIcon subject={p.icone} size={22} color={colors.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.materia}</Text>
                <Text style={styles.rowSub}>
                  {p.topico} · {shortDate(data).toLowerCase()}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>em {p.emDias} dias</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Feitas</Text>
      <View style={styles.list}>
        {mockProvas.feitas.map((p, i) => (
          <View key={p.materia} style={[styles.row, i > 0 && styles.rowDivider]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.offWhite }]}>
              <SubjectIcon subject={p.icone} size={22} color={colors.iconMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.materia}</Text>
              <Text style={styles.rowSub}>
                {p.topico} · {p.quando}
              </Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.chipText, { color: colors.successText }]}>nota {p.nota}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/vespera/1')} style={styles.vespera}>
        <Text style={styles.vesperaText}>Ver o modo véspera</Text>
        <ChevronRightIcon size={18} strokeWidth={2.8} color={colors.redText} />
      </Pressable>

      {info && <InfoSheet mood="pensativo" title={info.title} text={info.text} button="Entendi" onClose={() => setInfo(null)} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.screenTitle, color: colors.text },
  newButton: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.red, justifyContent: 'center' },
  newButtonText: { fontFamily: fonts.fredoka700, fontSize: 16, color: colors.white },
  section: { marginTop: 22, marginBottom: 10, fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
  list: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  rowIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  chip: { height: 26, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  chipText: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.redText },
  vespera: { marginTop: 18, height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  vesperaText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
});
