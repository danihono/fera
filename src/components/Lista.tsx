// Listas agrupadas (Configurações, Minha conta, Ajuda…): título em caixa alta e cartão com linhas.
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRightIcon } from '@/components/icons';
import { colors, fonts, radius, sizes } from '@/theme';

export function Secao({ titulo, children }: { titulo?: string; children: ReactNode }) {
  const itens = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <View style={styles.secao}>
      {titulo && <Text style={styles.titulo}>{titulo}</Text>}
      <View style={styles.cartao}>
        {itens.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divisor} />}
            {c}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type LinhaProps = {
  icone?: ReactNode;
  rotulo: string;
  sub?: string;
  valor?: string;
  direita?: ReactNode;
  perigo?: boolean;
  onPress?: () => void;
};

export function Linha({ icone, rotulo, sub, valor, direita, perigo, onPress }: LinhaProps) {
  const conteudo = (
    <>
      {icone && <View style={[styles.icone, perigo && { backgroundColor: colors.errorBg }]}>{icone}</View>}
      <View style={{ flex: 1 }}>
        <Text style={[styles.rotulo, perigo && { color: colors.errorText }]}>{rotulo}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
      {valor && (
        <Text style={styles.valor} numberOfLines={1}>
          {valor}
        </Text>
      )}
      {direita ?? (onPress && <ChevronRightIcon size={18} strokeWidth={2.8} color={colors.iconMuted} />)}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linha, pressed && { backgroundColor: colors.offWhite }]}>
      {conteudo}
    </Pressable>
  ) : (
    <View style={styles.linha}>{conteudo}</View>
  );
}

const styles = StyleSheet.create({
  secao: { marginTop: 22, gap: 8 },
  titulo: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.textMuted, paddingHorizontal: 4 },
  cartao: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 4, overflow: 'hidden' },
  divisor: { height: sizes.borderWidth, backgroundColor: colors.border, marginHorizontal: 16 },
  linha: { minHeight: 64, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 14 },
  icone: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  rotulo: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  sub: { fontFamily: fonts.nunito600, fontSize: 13, color: colors.textMuted },
  valor: { maxWidth: 150, fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
});
