import { StyleSheet, Text, View } from 'react-native';
import { TapScale } from '@/components/TapScale';
import type { Conquista } from '@/data/conquistas';
import { colors, fonts, solidShadow } from '@/theme';

/** Grade de conquistas (4 por linha), como no Perfil. */
export function MedalGrid({ items, onPress }: { items: Conquista[]; onPress: (c: Conquista) => void }) {
  const rows = Array.from({ length: Math.ceil(items.length / 4) }, (_, r) => items.slice(r * 4, r * 4 + 4));
  return (
    <View style={styles.grid}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((c) => (
            <TapScale
              key={c.id}
              scale={0.92}
              accessibilityRole="button"
              accessibilityLabel={c.bloqueada ? `${c.nomeLongo ?? c.nome}, bloqueada` : c.nome}
              onPress={() => onPress(c)}
              style={styles.medal}
            >
              <View style={[styles.circle, c.bloqueada && styles.locked]}>{c.icone}</View>
              <Text style={[styles.label, c.bloqueada && { color: colors.textMuted }]}>{c.nome}</Text>
            </TapScale>
          ))}
          {/* Linha incompleta: completa com espaços pra manter as colunas. */}
          {Array.from({ length: 4 - row.length }, (_, i) => (
            <View key={`vazio-${i}`} style={styles.medal} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  medal: { flex: 1, alignItems: 'center', gap: 6 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.red,
    borderWidth: 4,
    borderColor: colors.redSoft,
    boxShadow: solidShadow(colors.redDeep),
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: { backgroundColor: colors.border, borderWidth: 0, boxShadow: solidShadow(colors.locked) },
  label: { fontFamily: fonts.nunito800, fontSize: 12, lineHeight: 14.4, textAlign: 'center', color: colors.text },
});
