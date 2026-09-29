// Peças das telas de conta (Entrar, Criar conta, Esqueci a senha, Minha conta…), no estilo do design system.
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon, InfoIcon } from '@/components/icons';
import { Rugi, type RugiMood } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

/** Tela com topo (voltar/fechar) e miolo que rola, sobe com o teclado e não fecha o teclado ao tocar num botão. */
export function TelaConta({ titulo, icone, onVoltar, children }: { titulo: string; icone?: 'back' | 'close'; onVoltar?: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topo, { paddingTop: insets.top + sizes.topExtra }]}>
        <ScreenHeader title={titulo} icon={icone} onBack={onVoltar} />
      </View>
      <ScrollView
        style={styles.tela}
        contentContainerStyle={[styles.miolo, { paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Rugi + título + texto, centralizados no alto do formulário. */
export function Apresentacao({ mood, titulo, texto }: { mood: RugiMood; titulo: string; texto?: ReactNode }) {
  return (
    <View style={styles.apresentacao}>
      <Rugi mood={mood} width={112} />
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {texto ? <Text style={styles.texto}>{texto}</Text> : null}
    </View>
  );
}

type TipoAviso = 'info' | 'erro' | 'ok';
const AVISO: Record<TipoAviso, { fundo: string; texto: string; icone: string }> = {
  info: { fundo: colors.offWhite, texto: colors.text, icone: colors.red },
  erro: { fundo: colors.errorBg, texto: colors.errorText, icone: colors.error },
  ok: { fundo: colors.successBg, texto: colors.successText, icone: colors.success },
};

/** Faixa de aviso (explicação, erro geral ou confirmação). */
export function Aviso({ tipo = 'info', children }: { tipo?: TipoAviso; children: ReactNode }) {
  const c = AVISO[tipo];
  return (
    <View style={[styles.aviso, { backgroundColor: c.fundo }]} accessibilityLiveRegion={tipo === 'erro' ? 'assertive' : 'polite'}>
      <InfoIcon size={20} color={c.icone} />
      <Text style={[styles.avisoTexto, { color: c.texto }]}>{children}</Text>
    </View>
  );
}

const FORCA = [
  { rotulo: '', cor: colors.border },
  { rotulo: 'Fraca', cor: colors.error },
  { rotulo: 'Dá pro gasto', cor: colors.error },
  { rotulo: 'Boa', cor: colors.success },
  { rotulo: 'Forte', cor: colors.success },
];

/** 4 tracinhos que enchem conforme a senha fica forte (0 a 4). */
export function ForcaSenha({ forca }: { forca: number }) {
  const f = FORCA[forca] ?? FORCA[0];
  return (
    <View style={styles.forca} accessibilityLabel={f.rotulo ? `Senha ${f.rotulo.toLowerCase()}` : undefined}>
      <View style={styles.forcaBarras}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.forcaBarra, { backgroundColor: i <= forca ? f.cor : colors.border }]} />
        ))}
      </View>
      <Text style={styles.forcaTexto}>{f.rotulo}</Text>
    </View>
  );
}

/** Caixinha de marcar com texto ao lado (o texto pode ter links). */
export function Marcar({ marcado, onChange, children }: { marcado: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: marcado }} onPress={() => onChange(!marcado)} style={styles.marcar} hitSlop={6}>
      <View style={[styles.caixa, marcado && styles.caixaOn]}>{marcado && <CheckIcon size={14} color={colors.white} />}</View>
      <Text style={styles.marcarTexto}>{children}</Text>
    </Pressable>
  );
}

/** Escolha única em pílulas (ex.: faixa de idade). */
export function Chips<T extends string>({ opcoes, valor, onChange, rotulo }: { opcoes: { id: T; label: string }[]; valor: T | null; onChange: (v: T) => void; rotulo: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.chipsRotulo}>{rotulo}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
        {opcoes.map((o) => {
          const on = o.id === valor;
          return (
            <Pressable key={o.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(o.id)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipTexto, on && { color: colors.redText }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Link de texto vermelho (48 de altura pra dar pra tocar). */
export function LinkTexto({ label, onPress, alinhar = 'center', antes }: { label: string; onPress: () => void; alinhar?: 'center' | 'flex-end' | 'flex-start'; antes?: string }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={[styles.link, { alignSelf: alinhar }]} hitSlop={4}>
      <Text style={styles.linkTexto}>
        {antes ? <Text style={styles.linkAntes}>{antes} </Text> : null}
        {label}
      </Text>
    </Pressable>
  );
}

export const estilosConta = StyleSheet.create({
  campos: { gap: space.l },
  botoes: { gap: space.s, marginTop: space.s },
});

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  topo: { paddingHorizontal: space.gutter, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter, paddingTop: space.s, gap: space.l },
  apresentacao: { alignItems: 'center', gap: 6, marginBottom: space.xs },
  titulo: { ...type.screenTitle, lineHeight: 34, color: colors.text, textAlign: 'center', marginTop: 6 },
  texto: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 22, color: colors.textMuted, textAlign: 'center' },
  aviso: { flexDirection: 'row', gap: 10, borderRadius: radius.button, padding: 14, alignItems: 'flex-start' },
  avisoTexto: { flex: 1, fontFamily: fonts.nunito700, fontSize: 14, lineHeight: 20 },
  forca: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -8, paddingHorizontal: 4 },
  forcaBarras: { flex: 1, flexDirection: 'row', gap: 6 },
  forcaBarra: { flex: 1, height: 6, borderRadius: radius.pill },
  forcaTexto: { minWidth: 84, textAlign: 'right', fontFamily: fonts.nunito800, fontSize: 13, color: colors.textMuted },
  marcar: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
  caixa: { width: 26, height: 26, borderRadius: 8, borderWidth: sizes.borderWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  caixaOn: { borderWidth: 0, backgroundColor: colors.red },
  marcarTexto: { flex: 1, fontFamily: fonts.nunito700, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  chipsRotulo: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: sizes.borderWidth, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
  chipOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  chipTexto: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  link: { minHeight: sizes.touch, justifyContent: 'center', paddingHorizontal: 4 },
  linkTexto: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.redText, textAlign: 'center' },
  linkAntes: { fontFamily: fonts.nunito700, color: colors.textMuted },
});
