import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { mapa } from '@/data/materiais';
import { colors, fonts, radius, sizes } from '@/theme';

const W = 350;
const H = 420;
const NODE_W = 124;

/** Quadro de ideias: o tema no centro e os ramos em volta. */
export function Mapa() {
  const cx = W / 2;
  const cy = H / 2;
  const nodes = mapa.ramos.map((texto, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / mapa.ramos.length;
    return { texto, x: cx + Math.cos(ang) * 110, y: cy + Math.sin(ang) * 160 };
  });
  return (
    <View style={styles.board}>
      <View style={{ width: W, height: H }}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {nodes.map((n) => (
            <Line key={n.texto} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={colors.trailDone} strokeWidth={4} strokeLinecap="round" />
          ))}
        </Svg>
        {nodes.map((n, i) => (
          <View key={n.texto} style={[styles.node, { left: n.x - NODE_W / 2, top: n.y - 24 }, i % 2 === 1 && { backgroundColor: colors.redSoft }]}>
            <Text style={styles.nodeText}>{n.texto}</Text>
          </View>
        ))}
        <View style={[styles.center, { left: cx - 70, top: cy - 44 }]}>
          <Text style={styles.centerText}>{mapa.centro}</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: { fontFamily: fonts.nunito800, fontSize: 14, textAlign: 'center', color: colors.text },
  center: { position: 'absolute', width: 140, height: 88, borderRadius: 44, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  centerText: { fontFamily: fonts.fredoka700, fontSize: 18, lineHeight: 21, textAlign: 'center', color: colors.white },
});
