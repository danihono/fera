import { StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from '@/components/icons';
import type { Resumo as R } from '@/ia/tipos';
import { colors, fonts, radius, sizes } from '@/theme';

export function Resumo({ d }: { d: R }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.p}>{d.intro}</Text>

      {d.destaque && (
        <View style={styles.formula}>
          <Text style={[styles.formulaText, d.destaque.length > 16 && { fontSize: 26 }]} adjustsFontSizeToFit numberOfLines={2}>
            {d.destaque}
          </Text>
        </View>
      )}

      {d.blocos.map((b) => (
        <View key={b.titulo} style={styles.item}>
          {b.rotulo ? (
            <View style={styles.termo}>
              <Text style={[styles.termoText, b.rotulo.length > 2 && { fontSize: 16 }]} numberOfLines={1} adjustsFontSizeToFit>
                {b.rotulo}
              </Text>
            </View>
          ) : (
            <View style={[styles.termo, { backgroundColor: colors.redSoft }]}>
              <CheckIcon size={20} strokeWidth={3.5} color={colors.red} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.h}>{b.titulo}</Text>
            <Text style={styles.p}>{b.texto}</Text>
          </View>
        </View>
      ))}

      {d.comparacao.length > 0 && (
        <View style={styles.pares}>
          {Array.from({ length: Math.ceil(d.comparacao.length / 2) }, (_, r) => (
            <View key={r} style={styles.row}>
              {d.comparacao.slice(r * 2, r * 2 + 2).map((s) => (
                <View key={s.quando} style={styles.sinal}>
                  <Text style={styles.sinalQuando}>{s.quando}</Text>
                  <Text style={styles.sinalDiz}>{s.diz}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {d.pegadinhas.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.errorBg, borderColor: colors.errorBg }]}>
          <Text style={[styles.h, { color: colors.errorText }]}>Cuidado na prova</Text>
          {d.pegadinhas.map((l) => (
            <Text key={l} style={styles.p}>
              • {l}
            </Text>
          ))}
        </View>
      )}

      {d.lembrar.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.successBg, borderColor: colors.successBg }]}>
          <Text style={[styles.h, { color: colors.successText }]}>Pra não esquecer</Text>
          {d.lembrar.map((l) => (
            <View key={l} style={styles.check}>
              <CheckIcon size={16} strokeWidth={3.5} color={colors.successText} />
              <Text style={[styles.p, { flex: 1 }]}>{l}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  p: { fontFamily: fonts.nunito600, fontSize: 16, lineHeight: 23, color: colors.text },
  h: { fontFamily: fonts.nunito900, fontSize: 16, color: colors.text },
  formula: { minHeight: 84, borderRadius: radius.card, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  formulaText: { fontFamily: fonts.fredoka600, fontSize: 36, textAlign: 'center', color: colors.text },
  item: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  termo: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  termoText: { fontFamily: fonts.fredoka700, fontSize: 24, color: colors.white },
  card: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, padding: 16, gap: 6 },
  pares: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  sinal: { flex: 1, borderRadius: radius.option, backgroundColor: colors.redSoft, padding: 14, gap: 2 },
  sinalQuando: { fontFamily: fonts.fredoka700, fontSize: 20, color: colors.redText },
  sinalDiz: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
