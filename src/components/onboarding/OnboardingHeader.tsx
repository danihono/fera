import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeftIcon } from '@/components/icons';
import { colors, radius, sizes } from '@/theme';

/** Topo dos passos 2 e 3 do onboarding: voltar + barra de 3 passos. */
export function OnboardingHeader({ step }: { step: 2 | 3 }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}>
        <ChevronLeftIcon size={22} color={colors.text} />
      </Pressable>
      <View
        style={styles.steps}
        accessibilityRole="progressbar"
        accessibilityLabel={`Passo ${step} de 3`}
        accessibilityValue={{ min: 1, max: 3, now: step }}
      >
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.step, i <= step && { backgroundColor: colors.red }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: sizes.touch, flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: { flex: 1, flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.border },
});
