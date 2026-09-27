// 02b · Onboarding — Matéria — canvas artboard Onb2.dc.html
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, PlusIcon, SubjectIcon, type SubjectId } from '@/components/icons';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { OtherSubjectSheet } from '@/components/onboarding/OtherSubjectSheet';
import { Rugi } from '@/components/Rugi';
import { TapScale } from '@/components/TapScale';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

type Subject = { id: string; label: string; icon: SubjectId };

const SUBJECTS: Subject[] = [
  { id: 'matematica', label: 'Matemática', icon: 'matematica' },
  { id: 'portugues', label: 'Português', icon: 'portugues' },
  { id: 'historia', label: 'História', icon: 'historia' },
  { id: 'geografia', label: 'Geografia', icon: 'geografia' },
  { id: 'biologia', label: 'Biologia', icon: 'biologia' },
  { id: 'quimica', label: 'Química', icon: 'quimica' },
  { id: 'fisica', label: 'Física', icon: 'fisica' },
  { id: 'ingles', label: 'Inglês', icon: 'ingles' },
];

const normalize = (s: string) => s.trim().toLocaleLowerCase('pt-BR');

export default function OnboardingMateria() {
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [selected, setSelected] = useState('matematica');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Grade de 2 colunas.
  const rows = Array.from({ length: Math.ceil(subjects.length / 2) }, (_, r) => subjects.slice(r * 2, r * 2 + 2));

  // Matéria digitada vira um chip novo (ícone de livro) e fica selecionada; se já existir, só seleciona.
  const addSubject = (name: string) => {
    const existing = subjects.find((s) => normalize(s.label) === normalize(name));
    if (existing) {
      setSelected(existing.id);
      return;
    }
    const id = `outra-${normalize(name)}`;
    setSubjects((list) => [...list, { id, label: name, icon: 'portugues' }]);
    setSelected(id);
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + sizes.topExtra,
          // O FeraButton já reserva os 4px da sombra embaixo dele.
          paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow,
        },
      ]}
    >
      <OnboardingHeader step={2} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{'Qual sua\npróxima prova?'}</Text>
            <Text style={styles.subtitle}>Dá pra adicionar outras depois.</Text>
          </View>
          <Rugi mood="pensativo" width={96} accessibilityLabel="Rugi pensando" />
        </View>

        <View style={styles.grid}>
          {rows.map((row, r) => (
            <View key={r} style={styles.gridRow}>
              {row.map(({ id, label, icon }) => {
                const on = id === selected;
                return (
                  <TapScale
                    key={id}
                    scale={0.96}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setSelected(id)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <View style={[styles.chipIcon, on && { backgroundColor: colors.red }]}>
                      <SubjectIcon subject={icon} size={22} color={on ? colors.white : colors.red} />
                    </View>
                    <Text style={styles.chipLabel} numberOfLines={1}>
                      {label}
                    </Text>
                    {on && (
                      <View style={styles.check}>
                        <CheckIcon size={14} color={colors.white} />
                      </View>
                    )}
                  </TapScale>
                );
              })}
              {/* Linha ímpar: o espaço vazio mantém o chip na largura de meia coluna. */}
              {row.length === 1 && <View style={styles.chipSpacer} />}
            </View>
          ))}
        </View>

        <TapScale scale={0.96} accessibilityRole="button" onPress={() => setSheetOpen(true)} style={styles.other}>
          <PlusIcon size={20} color={colors.textMuted} />
          <Text style={styles.otherLabel}>Outra matéria</Text>
        </TapScale>
      </ScrollView>

      <FeraButton label="Continuar" onPress={() => router.push('/onboarding/data')} />

      {sheetOpen && <OtherSubjectSheet onSubmit={addSubject} onClose={() => setSheetOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  // Rola só se a lista crescer com matérias digitadas; no layout do design cabe tudo.
  body: { flex: 1, marginHorizontal: -space.gutter },
  bodyContent: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  header: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  headerText: { flex: 1, gap: 6, paddingBottom: 10 },
  title: { ...type.screenTitle, lineHeight: 31, color: colors.text },
  subtitle: { fontFamily: fonts.nunito600, fontSize: 15, color: colors.textMuted },
  grid: { marginTop: 18, gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  chip: {
    flex: 1,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingLeft: 10,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipSpacer: { flex: 1 },
  chipOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  chipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { flexShrink: 1, fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  check: {
    position: 'absolute',
    top: -6,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
    borderWidth: sizes.borderWidth,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  other: {
    marginTop: 12,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderStyle: 'dashed',
    borderColor: colors.locked,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otherLabel: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.textMuted },
});
