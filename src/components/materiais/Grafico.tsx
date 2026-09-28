import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, fonts, radius, sizes } from '@/theme';

// Plano de x ∈ [−1, 6] e y ∈ [−7, 6]: f(x) = 2x − 6 (cresce) e g(x) = −x + 3 (decresce).
const W = 320;
const H = 300;
const X0 = -1, X1 = 6, Y0 = -7, Y1 = 6;
const px = (x: number) => ((x - X0) / (X1 - X0)) * W;
const py = (y: number) => H - ((y - Y0) / (Y1 - Y0)) * H;

const RETAS = [
  { nome: 'f(x) = 2x − 6', f: (x: number) => 2 * x - 6, raiz: 3, cor: colors.red, diz: 'a = 2 > 0 → cresce' },
  { nome: 'g(x) = −x + 3', f: (x: number) => -x + 3, raiz: 3, cor: colors.error, diz: 'a = −1 < 0 → decresce' },
];

export function Grafico() {
  const xs = Array.from({ length: X1 - X0 + 1 }, (_, i) => X0 + i);
  const ys = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.plot}>
        <Svg width={W} height={H}>
          {xs.map((x) => (
            <Line key={`x${x}`} x1={px(x)} y1={0} x2={px(x)} y2={H} stroke={colors.border} strokeWidth={1} />
          ))}
          {ys.map((y) => (
            <Line key={`y${y}`} x1={0} y1={py(y)} x2={W} y2={py(y)} stroke={colors.border} strokeWidth={1} />
          ))}
          <Line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke={colors.axis} strokeWidth={2.5} />
          <Line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke={colors.axis} strokeWidth={2.5} />
          {RETAS.map((r) => (
            <Path key={r.nome} d={`M${px(X0)} ${py(r.f(X0))} L${px(X1)} ${py(r.f(X1))}`} stroke={r.cor} strokeWidth={4} strokeLinecap="round" />
          ))}
          {/* As duas cortam o eixo x em 3 */}
          <Circle cx={px(3)} cy={py(0)} r={7} fill={colors.white} stroke={colors.text} strokeWidth={3} />
          <SvgText x={px(3) + 10} y={py(0) + 20} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.text}>
            raiz x = 3
          </SvgText>
          <Circle cx={px(0)} cy={py(-6)} r={6} fill={colors.red} />
          <SvgText x={px(0) + 10} y={py(-6) + 5} fontFamily={fonts.fredoka600} fontSize={13} fill={colors.redText}>
            b = −6
          </SvgText>
          <SvgText x={W - 14} y={py(0) - 8} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
            x
          </SvgText>
          <SvgText x={px(0) + 8} y={16} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
            y
          </SvgText>
        </Svg>
      </View>

      {RETAS.map((r) => (
        <View key={r.nome} style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: r.cor }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.legendTitle}>{r.nome}</Text>
            <Text style={styles.legendText}>{r.diz}</Text>
          </View>
        </View>
      ))}

      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <Text style={[styles.td, styles.thText]}>x</Text>
          <Text style={[styles.td, styles.thText]}>f(x) = 2x − 6</Text>
        </View>
        {[0, 1, 2, 3, 4].map((x) => (
          <View key={x} style={[styles.tr, x === 3 && { backgroundColor: colors.successBg }]}>
            <Text style={styles.td}>{x}</Text>
            <Text style={[styles.td, x === 3 && { color: colors.successText }]}>{2 * x - 6}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { alignItems: 'center', paddingVertical: 14, borderRadius: radius.card, backgroundColor: colors.offWhite },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 28, height: 8, borderRadius: 4 },
  legendTitle: { fontFamily: fonts.fredoka600, fontSize: 18, color: colors.text },
  legendText: { fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
  table: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.option, overflow: 'hidden' },
  tr: { flexDirection: 'row', height: 40, alignItems: 'center' },
  th: { backgroundColor: colors.offWhite },
  thText: { fontFamily: fonts.nunito900, color: colors.textMuted },
  td: { flex: 1, textAlign: 'center', fontFamily: fonts.fredoka600, fontSize: 16, color: colors.text },
});
