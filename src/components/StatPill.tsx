import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, sizes } from '@/theme';
import { BoltIcon, FireIcon, HeartIcon } from './icons';

type Props =
  | { kind: 'streak'; value: number }
  | { kind: 'xp'; value: number }
  | { kind: 'lives'; value: number | '∞' };

const fmt = (n: number | string) => (typeof n === 'number' ? n.toLocaleString('pt-BR') : n);

/** Chips do topo da Início: streak, XP e vidas (altura 40, borda 2px). */
export function StatPill(props: Props) {
  const label =
    props.kind === 'streak'
      ? `Sequência de ${props.value} dias`
      : props.kind === 'xp'
        ? `${fmt(props.value)} XP`
        : props.value === '∞'
          ? 'Vidas infinitas'
          : `${props.value} vidas`;

  return (
    <View style={styles.pill} accessible accessibilityLabel={label}>
      {props.kind === 'streak' && <FireIcon size={24} />}
      {props.kind === 'xp' && <BoltIcon size={22} />}
      {props.kind === 'lives' && <HeartIcon size={22} />}
      <Text style={[styles.value, props.kind === 'streak' && { color: colors.fireTop }]}>{fmt(props.value)}</Text>
      {props.kind === 'xp' && <Text style={styles.unit}>XP</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: { fontFamily: fonts.fredoka600, fontSize: 18, color: colors.text },
  unit: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.textMuted },
});
