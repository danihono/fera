import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius, sizes } from '@/theme';

function Seta({ label }: { label?: string }) {
  return (
    <View style={styles.seta}>
      <Svg width={24} height={30} viewBox="0 0 24 30">
        <Path d="M12 2v22M5 17l7 8 7-8" stroke={colors.axis} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      {label && <Text style={styles.setaLabel}>{label}</Text>}
    </View>
  );
}

function Caixa({ texto, sub, tipo = 'passo' }: { texto: string; sub?: string; tipo?: 'inicio' | 'passo' | 'pergunta' | 'fim' | 'nao' }) {
  const look = {
    inicio: { bg: colors.red, fg: colors.white, border: colors.red },
    passo: { bg: colors.white, fg: colors.text, border: colors.border },
    pergunta: { bg: colors.errorBg, fg: colors.errorText, border: colors.error },
    fim: { bg: colors.successBg, fg: colors.successText, border: colors.success },
    nao: { bg: colors.offWhite, fg: colors.textMuted, border: colors.border },
  }[tipo];
  return (
    <View style={[styles.caixa, { backgroundColor: look.bg, borderColor: look.border }, tipo === 'pergunta' && styles.pergunta]}>
      <Text style={[styles.caixaText, { color: look.fg }]}>{texto}</Text>
      {sub && <Text style={[styles.caixaSub, { color: look.fg }]}>{sub}</Text>}
    </View>
  );
}

/** Caminho pra achar a raiz, de cima pra baixo. */
export function Fluxo() {
  return (
    <View style={styles.wrap}>
      <Caixa tipo="inicio" texto="f(x) = ax + b" sub="começa aqui" />
      <Seta />
      <Caixa texto="Troca f(x) por 0" sub="ax + b = 0" />
      <Seta />
      <Caixa tipo="pergunta" texto="O a é diferente de zero?" />
      <View style={styles.ramos}>
        <View style={styles.ramo}>
          <Seta label="sim" />
          <Caixa texto="Isola o x" sub="x = −b / a" />
          <Seta />
          <Caixa tipo="fim" texto="Achou a raiz!" sub="confere: f(x) = 0" />
        </View>
        <View style={styles.ramo}>
          <Seta label="não" />
          <Caixa tipo="nao" texto="Não é do 1º grau" sub="vira f(x) = b (reta deitada)" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
  caixa: { alignSelf: 'stretch', minHeight: 64, borderRadius: radius.button, borderWidth: sizes.borderWidth, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pergunta: { borderStyle: 'dashed', borderRadius: radius.pill },
  caixaText: { fontFamily: fonts.nunito900, fontSize: 16, textAlign: 'center' },
  caixaSub: { fontFamily: fonts.fredoka600, fontSize: 15, textAlign: 'center', opacity: 0.85 },
  seta: { height: 34, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  setaLabel: { fontFamily: fonts.nunito900, fontSize: 12, color: colors.textMuted },
  ramos: { alignSelf: 'stretch', flexDirection: 'row', gap: 12 },
  ramo: { flex: 1, alignItems: 'center' },
});
