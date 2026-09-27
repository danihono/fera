// 02b · Onboarding — Matéria — canvas artboard Onb2.dc.html
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, PlusIcon, SubjectIcon, type SubjectId } from '@/components/icons';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { Rugi } from '@/components/Rugi';
import { TapScale } from '@/components/TapScale';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const SUBJECTS: { id: SubjectId; label: string }[] = [
  { id: 'matematica', label: 'Matemática' },
  { id: 'portugues', label: 'Português' },
  { id: 'historia', label: 'História' },
  { id: 'geografia', label: 'Geografia' },
  { id: 'biologia', label: 'Biologia' },
  { id: 'quimica', label: 'Química' },
  { id: 'fisica', label: 'Física' },
  { id: 'ingles', label: 'Inglês' },
];
// Grade de 2 colunas.
const ROWS = [0, 2, 4, 6].map((i) => SUBJECTS.slice(i, i + 2));

export default function OnboardingMateria() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<SubjectId>('matematica');

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

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{'Qual sua\npróxima prova?'}</Text>
          <Text style={styles.subtitle}>Dá pra adicionar outras depois.</Text>
        </View>
        <Rugi mood="pensativo" width={96} accessibilityLabel="Rugi pensando" />
      </View>

      <View style={styles.grid}>
        {ROWS.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map(({ id, label }) => {
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
                    <SubjectIcon subject={id} size={22} color={on ? colors.white : colors.red} />
                  </View>
                  <Text style={styles.chipLabel}>{label}</Text>
                  {on && (
                    <View style={styles.check}>
                      <CheckIcon size={14} color={colors.white} />
                    </View>
                  )}
                </TapScale>
              );
            })}
          </View>
        ))}
      </View>

      <TapScale scale={0.96} accessibilityRole="button" style={styles.other}>
        <PlusIcon size={20} color={colors.textMuted} />
        <Text style={styles.otherLabel}>Outra matéria</Text>
      </TapScale>

      <View style={{ flex: 1 }} />

      <FeraButton label="Continuar" onPress={() => router.push('/onboarding/data')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
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
  chipOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  chipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
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
