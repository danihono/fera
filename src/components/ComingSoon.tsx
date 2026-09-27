import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, sizes, space } from '@/theme';
import { Rugi, type RugiMood } from './Rugi';
import { StatPill } from './StatPill';

/** Placeholder das abas enquanto as telas reais não são construídas. */
export function ComingSoon({ title, mood = 'pensativo', showStats }: { title: string; mood?: RugiMood; showStats?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra }]}>
      {showStats && (
        <View style={styles.stats}>
          <StatPill kind="streak" value={12} />
          <StatPill kind="xp" value={1240} />
          <StatPill kind="lives" value={5} />
        </View>
      )}
      <View style={styles.center}>
        <Rugi mood={mood} width={140} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>Tela em construção. O Rugi tá montando.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontFamily: fonts.fredoka600, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.nunito600, fontSize: 16, color: colors.textMuted },
});
