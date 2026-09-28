import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import type { Mapa as M } from '@/ia/tipos';
import { colors, fonts, radius, sizes, space } from '@/theme';

const H = 420;
const NODE_W = 124;

/** Quadro de ideias: o tema no centro e os ramos em volta; embaixo, cada ramo explicado. */
export function Mapa({ d }: { d: M }) {
  const { width } = useWindowDimensions();
  const W = Math.min(350, width - 2 * space.gutter);
  const cx = W / 2;
  const cy = H / 2;
  const nodes = d.ramos.map((r, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / d.ramos.length;
    return { texto: r.titulo, x: cx + Math.cos(ang) * (W / 2 - NODE_W / 2 - 2), y: cy + Math.sin(ang) * 160 };
  });
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.board}>
        <View style={{ width: W, height: H }}>
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            {nodes.map((n) => (
              <Line key={n.texto} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={colors.trailDone} strokeWidth={4} strokeLinecap="round" />
            ))}
          </Svg>
          {nodes.map((n, i) => (
            <View key={n.texto} style={[styles.node, { left: n.x - NODE_W / 2, top: n.y - 24 }, i % 2 === 1 && { backgroundColor: colors.redSoft }]}>
              <Text style={styles.nodeText} numberOfLines={3}>
                {n.texto}
              </Text>
            </View>
          ))}
          <View style={[styles.center, { left: cx - 70, top: cy - 44 }]}>
            <Text style={styles.centerText} numberOfLines={3} adjustsFontSizeToFit>
              {d.centro}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {d.ramos.map((r, i) => (
          <View key={r.titulo} style={[styles.row, i > 0 && styles.rowDivider]}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{r.titulo}</Text>
              <Text style={styles.rowText}>{r.detalhe}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { alignItems: 'center', borderRadius: radius.card, backgroundColor: colors.offWhite, paddingVertical: 8, overflow: 'hidden' },
  node: {
    position: 'absolute',
    width: NODE_W,
    minHeight: 48,
    borderRadius: radius.button,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: { fontFamily: fonts.nunito800, fontSize: 14, textAlign: 'center', color: colors.text },
  center: { position: 'absolute', width: 140, height: 88, borderRadius: 44, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  centerText: { fontFamily: fonts.fredoka700, fontSize: 18, lineHeight: 21, textAlign: 'center', color: colors.white },
  list: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  rowDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 5, backgroundColor: colors.red },
  rowTitle: { fontFamily: fonts.nunito900, fontSize: 16, color: colors.text },
  rowText: { fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 21, color: colors.textMuted },
});
