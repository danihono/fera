import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Fluxo as F } from '@/ia/tipos';
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

/** O caminho de cima pra baixo; numa pergunta, o "sim" segue e o "não" sai pro lado. */
export function Fluxo({ d }: { d: F }) {
  return (
    <View style={styles.wrap}>
      {d.titulo ? <Text style={styles.lead}>{d.titulo}</Text> : null}
      {d.etapas.map((e, i) => {
        const ultima = i === d.etapas.length - 1;
        return (
          <Fragment key={i}>
            <Caixa tipo={e.tipo} texto={e.texto} sub={e.sub ?? undefined} />
            {e.tipo === 'pergunta' && e.seNao ? (
              <View style={styles.ramos}>
                <View style={styles.ramo}>{!ultima && <Seta label="sim" />}</View>
                <View style={styles.ramo}>
                  <Seta label="não" />
                  <Caixa tipo="nao" texto={e.seNao.texto} sub={e.seNao.sub ?? undefined} />
                </View>
              </View>
            ) : (
              !ultima && <Seta />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
  lead: { alignSelf: 'stretch', marginBottom: 12, fontFamily: fonts.nunito800, fontSize: 16, color: colors.textMuted },
  caixa: { alignSelf: 'stretch', minHeight: 64, borderRadius: radius.button, borderWidth: sizes.borderWidth, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pergunta: { borderStyle: 'dashed', borderRadius: radius.pill },
  caixaText: { fontFamily: fonts.nunito900, fontSize: 16, textAlign: 'center' },
  caixaSub: { fontFamily: fonts.fredoka600, fontSize: 15, textAlign: 'center', opacity: 0.85 },
  seta: { height: 34, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  setaLabel: { fontFamily: fonts.nunito900, fontSize: 12, color: colors.textMuted },
  ramos: { alignSelf: 'stretch', flexDirection: 'row', gap: 12 },
  ramo: { flex: 1, alignItems: 'center' },
});
