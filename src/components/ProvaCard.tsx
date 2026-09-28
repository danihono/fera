// Card vermelho da prova (Início · Home.dc.html), também usado na aba Provas.
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius, solidShadow } from '@/theme';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** "hoje", "amanhã", "em 3 dias". */
export const quando = (dias: number) => (dias <= 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`);

type Props = {
  materia: string;
  topico: string;
  data: Date;
  dias: number;
  feitas: number;
  total: number;
  style?: StyleProp<ViewStyle>;
};

export function ProvaCard({ materia, topico, data, dias, feitas, total, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Svg width={140} height={146} viewBox="0 0 140 146" style={styles.stripes}>
        <Path d="M140 10 C 110 12 92 26 84 44 C 104 34 122 32 140 36 Z" fill={colors.redStripe} />
        <Path d="M140 62 C 116 62 100 74 94 90 C 110 82 126 80 140 84 Z" fill={colors.redStripe} />
        <Path d="M140 112 C 120 112 108 122 104 134 C 116 128 128 127 140 130 Z" fill={colors.redStripe} />
      </Svg>
      <View style={styles.top}>
        <View style={styles.texts}>
          <Text style={styles.kicker}>Prova de {materia}</Text>
          <Text style={styles.days}>{quando(dias)}</Text>
          <Text style={styles.topic}>{topico}</Text>
        </View>
        <View style={styles.dateBox}>
          <Text style={styles.weekday}>{WEEKDAYS[data.getDay()]}</Text>
          <Text style={styles.day}>{data.getDate()}</Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: feitas }}>
          <View style={[styles.fill, { width: `${(feitas / total) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {feitas} de {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 146,
    borderRadius: radius.card,
    backgroundColor: colors.red,
    boxShadow: solidShadow(colors.redDeep),
    padding: 18,
    overflow: 'hidden',
    gap: 14,
  },
  stripes: { position: 'absolute', right: 0, top: 0 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { gap: 2 },
  kicker: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.white },
  days: { fontFamily: fonts.fredoka700, fontSize: 36, lineHeight: 38, color: colors.white },
  topic: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.white },
  dateBox: { width: 70, height: 76, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  weekday: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
  day: { fontFamily: fonts.fredoka700, fontSize: 30, lineHeight: 30, color: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: colors.redDeep, overflow: 'hidden' },
  fill: { height: 12, borderRadius: radius.pill, backgroundColor: colors.white, boxShadow: `inset 0px -3px 0px ${colors.progressShade}` },
  progressLabel: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.white },
});
