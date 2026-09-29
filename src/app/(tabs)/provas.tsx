// Aba Provas — sem design no canvas; prévia montada com o design system (card da Início + listas).
// Tocar numa prova abre o detalhe (src/app/prova/[id].tsx).
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, SubjectIcon } from '@/components/icons';
import { ProvaCard, quando } from '@/components/ProvaCard';
import { diasAte, provaAtualDe, useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

export default function Provas() {
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const atual = provaAtualDe(estado);
  const outras = estado.provas.filter((p) => p.id !== atual?.id);
  const proximas = outras.filter((p) => diasAte(p.data) >= 0).sort((a, b) => a.data.getTime() - b.data.getTime());
  const feitas = outras.filter((p) => diasAte(p.data) < 0).sort((a, b) => b.data.getTime() - a.data.getTime());

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
      {atual ? (
        <Pressable accessibilityRole="link" accessibilityLabel={`Abrir a prova de ${atual.materia}`} onPress={() => router.push(`/prova/${atual.id}`)}>
          <ProvaCard materia={atual.materia} topico={atual.topico} data={atual.data} dias={diasAte(atual.data)} feitas={atual.feitas.length} total={atual.totalMissoes} />
        </Pressable>
      ) : (
        <Text style={styles.vazio}>Nenhuma prova ainda. Toca em + Nova e manda a foto do caderno, um PDF ou os slides.</Text>
      )}

      {proximas.length > 0 && (
        <>
          <Text style={styles.section}>Próximas</Text>
          <View style={styles.list}>
            {proximas.map((p, i) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => router.push(`/prova/${p.id}`)}
                style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.rowIcon}>
                  <SubjectIcon subject={p.icone} size={22} color={colors.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{p.materia}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {p.topico} · {shortDate(p.data).toLowerCase()}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{quando(diasAte(p.data))}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {feitas.length > 0 && (
        <>
          <Text style={styles.section}>Feitas</Text>
          <View style={styles.list}>
            {feitas.map((p, i) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => router.push(`/prova/${p.id}`)}
                style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.rowIcon, { backgroundColor: colors.offWhite }]}>
                  <SubjectIcon subject={p.icone} size={22} color={colors.iconMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{p.materia}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {p.topico} · {shortDate(p.data).toLowerCase()}
                  </Text>
                </View>
                <View style={[styles.chip, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.chipText, { color: colors.successText }]}>
                    {p.respondidas ? `${Math.round((p.acertos / p.respondidas) * 100)}% de acerto` : `${p.feitas.length} de ${p.totalMissoes}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {atual && (
        <Pressable accessibilityRole="button" onPress={() => router.push(`/vespera/${atual.id}`)} style={styles.vespera}>
          <Text style={styles.vesperaText}>Ver o modo véspera</Text>
          <ChevronRightIcon size={18} strokeWidth={2.8} color={colors.redText} />
        </Pressable>
      )}
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
  vazio: { fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  vespera: { marginTop: 18, height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  vesperaText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
});
