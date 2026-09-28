import { StyleSheet, Text, View } from 'react-native';
import { Rugi } from '@/components/Rugi';
import type { Explicacao as E } from '@/ia/tipos';
import { colors, fonts, radius, sizes } from '@/theme';

export function Explicacao({ d }: { d: E }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>{d.chamada}</Text>
      <View style={styles.formula}>
        <Text style={[styles.formulaText, d.exemplo.length > 18 && { fontSize: 22 }]} adjustsFontSizeToFit numberOfLines={2}>
          {d.exemplo}
        </Text>
      </View>

      {d.passos.map((p, i) => (
        <View key={p.titulo} style={styles.step}>
          <View style={styles.rail}>
            <View style={styles.num}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            {i < d.passos.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.card}>
            <Text style={styles.h}>{p.titulo}</Text>
            <Text style={styles.p}>{p.texto}</Text>
            {p.conta && (
              <View style={styles.conta}>
                <Text style={styles.contaText}>{p.conta}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      <View style={styles.tip}>
        <Rugi mood="pensativo" width={64} />
        <View style={styles.bubble}>
          <Text style={styles.h}>{d.dica}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  lead: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.textMuted },
  formula: { minHeight: 72, borderRadius: radius.card, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 10 },
  formulaText: { fontFamily: fonts.fredoka600, fontSize: 32, textAlign: 'center', color: colors.text },
  step: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 32 },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.fredoka700, fontSize: 16, color: colors.white },
  line: { flex: 1, width: 4, borderRadius: 2, backgroundColor: colors.trailDone, marginVertical: 4 },
  card: { flex: 1, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.option, padding: 14, gap: 6, marginBottom: 12 },
  h: { fontFamily: fonts.nunito900, fontSize: 16, color: colors.text },
  p: { fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 21, color: colors.text },
  conta: { alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.offWhite, justifyContent: 'center' },
  contaText: { fontFamily: fonts.fredoka600, fontSize: 17, color: colors.red },
  tip: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubble: {
    flex: 1,
    marginBottom: 24,
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
});
