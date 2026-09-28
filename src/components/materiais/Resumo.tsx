import { StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from '@/components/icons';
import { resumo } from '@/data/materiais';
import { colors, fonts, radius, sizes } from '@/theme';

export function Resumo() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.p}>{resumo.intro}</Text>

      <View style={styles.formula}>
        <Text style={styles.formulaText}>{resumo.formula}</Text>
      </View>

      {resumo.partes.map((p) => (
        <View key={p.termo} style={styles.item}>
          <View style={styles.termo}>
            <Text style={styles.termoText}>{p.termo}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.h}>{p.nome}</Text>
            <Text style={styles.p}>{p.texto}</Text>
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.h}>{resumo.raiz.titulo}</Text>
        <Text style={[styles.formulaText, { fontSize: 28, color: colors.red }]}>{resumo.raiz.formula}</Text>
        <Text style={styles.p}>{resumo.raiz.texto}</Text>
      </View>

      <View style={styles.row}>
        {resumo.sinal.map((s) => (
          <View key={s.quando} style={styles.sinal}>
            <Text style={styles.sinalQuando}>{s.quando}</Text>
            <Text style={styles.sinalDiz}>{s.diz}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.successBg, borderColor: colors.successBg }]}>
        <Text style={[styles.h, { color: colors.successText }]}>Pra não esquecer</Text>
        {resumo.lembrar.map((l) => (
          <View key={l} style={styles.check}>
            <CheckIcon size={16} strokeWidth={3.5} color={colors.successText} />
            <Text style={styles.p}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  p: { fontFamily: fonts.nunito600, fontSize: 16, lineHeight: 23, color: colors.text },
  h: { fontFamily: fonts.nunito900, fontSize: 16, color: colors.text },
  formula: { height: 84, borderRadius: radius.card, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  formulaText: { fontFamily: fonts.fredoka600, fontSize: 36, color: colors.text },
  item: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  termo: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  termoText: { fontFamily: fonts.fredoka700, fontSize: 24, color: colors.white },
  card: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, padding: 16, gap: 6 },
  row: { flexDirection: 'row', gap: 10 },
  sinal: { flex: 1, borderRadius: radius.option, backgroundColor: colors.redSoft, padding: 14, gap: 2 },
  sinalQuando: { fontFamily: fonts.fredoka700, fontSize: 20, color: colors.redText },
  sinalDiz: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
