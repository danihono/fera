import { Fragment } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { avaliar } from '@/ia/expressao';
import type { Grafico as G, GraficoItem } from '@/ia/tipos';
import { colors, fonts, radius, sizes, space } from '@/theme';

// O app calcula e desenha: a IA só manda as expressões e os números.
const H = 300;
const CORES = [colors.red, colors.error, colors.success];

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })).replace('-', '−');

/** Passo "redondo" pra grade (1, 2, 5, 10…). */
function passo(range: number, alvo = 8) {
  const bruto = range / alvo;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  return [1, 2, 5, 10].map((m) => m * mag).find((p) => p >= bruto) ?? 10 * mag;
}

export function Grafico({ d }: { d: G }) {
  return (
    <View style={{ gap: 28 }}>
      {d.graficos.map((g, i) => (
        <View key={i} style={{ gap: 14 }}>
          <Text style={styles.titulo}>{g.titulo}</Text>
          {g.tipo === 'funcoes' ? <Funcoes g={g} /> : <Barras g={g} linha={g.tipo === 'linha'} />}
          <Text style={styles.explica}>{g.explicacao}</Text>
          {g.fonte && <Text style={styles.fonte}>Fonte: {g.fonte}</Text>}
        </View>
      ))}
    </View>
  );
}

function useLargura() {
  const { width } = useWindowDimensions();
  return Math.min(320, width - 2 * space.gutter - 28);
}

function Funcoes({ g }: { g: GraficoItem }) {
  const W = useLargura();
  const xMin = g.janela?.xMin ?? -5;
  const xMax = g.janela?.xMax ?? 5;
  // Sem janela: o y sai dos próprios valores.
  let yMin = g.janela?.yMin;
  let yMax = g.janela?.yMax;
  if (yMin == null || yMax == null) {
    const ys = g.funcoes.flatMap((f) => Array.from({ length: 41 }, (_, k) => avaliar(f.expressao, xMin + ((xMax - xMin) * k) / 40))).filter((y): y is number => y != null);
    const lo = Math.min(0, ...ys);
    const hi = Math.max(0, ...ys);
    const folga = (hi - lo || 2) * 0.1;
    yMin = lo - folga;
    yMax = hi + folga;
  }
  const [y0, y1] = [yMin, yMax];
  const px = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const py = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const sx = passo(xMax - xMin);
  const sy = passo(y1 - y0);
  const gradeX = Array.from({ length: Math.floor(xMax / sx) - Math.ceil(xMin / sx) + 1 }, (_, i) => (Math.ceil(xMin / sx) + i) * sx);
  const gradeY = Array.from({ length: Math.floor(y1 / sy) - Math.ceil(y0 / sy) + 1 }, (_, i) => (Math.ceil(y0 / sy) + i) * sy);

  // Curva amostrada; quebra onde a função não existe ou explode (ex.: 1/x).
  const curva = (expr: string) => {
    let d = '';
    let aberto = false;
    for (let k = 0; k <= 160; k++) {
      const x = xMin + ((xMax - xMin) * k) / 160;
      const y = avaliar(expr, x);
      if (y == null || y < y0 - (y1 - y0) * 2 || y > y1 + (y1 - y0) * 2) {
        aberto = false;
        continue;
      }
      d += `${aberto ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
      aberto = true;
    }
    return d;
  };

  const tabela = g.funcoes[0];
  const xsTabela = Array.from({ length: 6 }, (_, i) => Math.round(Math.max(xMin, 0) + i * Math.max(1, Math.round((xMax - Math.max(xMin, 0)) / 6))))
    .filter((x, i, a) => x <= xMax && a.indexOf(x) === i)
    .slice(0, 5);

  return (
    <>
      <View style={styles.plot}>
        <Svg width={W} height={H}>
          {gradeX.map((x) => (
            <Line key={`x${x}`} x1={px(x)} y1={0} x2={px(x)} y2={H} stroke={colors.border} strokeWidth={1} />
          ))}
          {gradeY.map((y) => (
            <Line key={`y${y}`} x1={0} y1={py(y)} x2={W} y2={py(y)} stroke={colors.border} strokeWidth={1} />
          ))}
          {y0 <= 0 && y1 >= 0 && <Line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke={colors.axis} strokeWidth={2.5} />}
          {xMin <= 0 && xMax >= 0 && <Line x1={px(0)} y1={0} x2={px(0)} y2={H} stroke={colors.axis} strokeWidth={2.5} />}
          {g.funcoes.map((f, i) => (
            <Path key={f.expressao} d={curva(f.expressao)} stroke={CORES[i % CORES.length]} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          {g.pontos.map((p) => (
            <Fragment key={`${p.x},${p.y}`}>
              <Circle cx={px(p.x)} cy={py(p.y)} r={7} fill={colors.white} stroke={colors.text} strokeWidth={3} />
              <SvgText
                x={Math.min(px(p.x) + 10, W - 6)}
                y={py(p.y) + (py(p.y) > H - 30 ? -12 : 20)}
                textAnchor={px(p.x) > W - 90 ? 'end' : 'start'}
                fontFamily={fonts.fredoka600}
                fontSize={13}
                fill={colors.text}
              >
                {p.rotulo}
              </SvgText>
            </Fragment>
          ))}
          <SvgText x={W - 6} y={(y0 <= 0 && y1 >= 0 ? py(0) : H) - 8} textAnchor="end" fontFamily={fonts.fredoka600} fontSize={13} fill={colors.textMuted}>
            {g.eixoX}
          </SvgText>
          <SvgText x={(xMin <= 0 && xMax >= 0 ? px(0) : 0) + 8} y={16} fontFamily={fonts.fredoka600} fontSize={13} fill={colors.textMuted}>
            {g.eixoY}
          </SvgText>
        </Svg>
      </View>

      {g.funcoes.map((f, i) => (
        <View key={f.expressao} style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: CORES[i % CORES.length] }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.legendTitle}>{f.rotulo}</Text>
            <Text style={styles.legendText}>{f.diz}</Text>
          </View>
        </View>
      ))}

      {tabela && xsTabela.length >= 3 && (
        <View style={styles.table}>
          <View style={[styles.tr, styles.th]}>
            <Text style={[styles.td, styles.thText]}>{g.eixoX || 'x'}</Text>
            <Text style={[styles.td, styles.thText]} numberOfLines={1}>
              {tabela.rotulo}
            </Text>
          </View>
          {xsTabela.map((x) => {
            const y = avaliar(tabela.expressao, x);
            const zero = y != null && Math.abs(y) < 1e-9;
            return (
              <View key={x} style={[styles.tr, zero && { backgroundColor: colors.successBg }]}>
                <Text style={styles.td}>{fmt(x)}</Text>
                <Text style={[styles.td, zero && { color: colors.successText }]}>{y == null ? '—' : fmt(Math.round(y * 100) / 100)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function Barras({ g, linha }: { g: GraficoItem; linha: boolean }) {
  const W = useLargura();
  const topo = 28;
  const base = H - 44;
  const valores = g.dados.map((d) => d.valor);
  const lo = Math.min(0, ...valores);
  const hi = Math.max(0, ...valores) || 1;
  const py = (v: number) => base - ((v - lo) / (hi - lo)) * (base - topo);
  const slot = W / g.dados.length;
  const cx = (i: number) => slot * i + slot / 2;
  const valor = (v: number) => (g.unidade === 'R$' ? `R$ ${fmt(v)}` : g.unidade === '%' ? `${fmt(v)}%` : `${fmt(v)}${g.unidade ? ` ${g.unidade}` : ''}`);

  return (
    <>
      <View style={styles.plot}>
        <Svg width={W} height={H}>
          <Line x1={0} y1={py(0)} x2={W} y2={py(0)} stroke={colors.axis} strokeWidth={2.5} />
          {linha ? (
            <>
              <Path d={g.dados.map((d, i) => `${i ? 'L' : 'M'}${cx(i)} ${py(d.valor)}`).join(' ')} stroke={colors.red} strokeWidth={4} fill="none" strokeLinejoin="round" />
              {g.dados.map((d, i) => (
                <Circle key={i} cx={cx(i)} cy={py(d.valor)} r={6} fill={colors.white} stroke={colors.red} strokeWidth={3} />
              ))}
            </>
          ) : (
            g.dados.map((d, i) => {
              const y = py(Math.max(0, d.valor));
              const h = Math.abs(py(d.valor) - py(0));
              return <Rect key={i} x={cx(i) - slot * 0.32} y={y} width={slot * 0.64} height={Math.max(2, h)} rx={8} fill={i % 2 ? colors.redBlush : colors.red} />;
            })
          )}
          {g.dados.map((d, i) => (
            <Fragment key={i}>
              <SvgText x={cx(i)} y={py(d.valor) - 10} textAnchor="middle" fontFamily={fonts.fredoka600} fontSize={12} fill={colors.text}>
                {valor(d.valor)}
              </SvgText>
              <SvgText x={cx(i)} y={H - 18} textAnchor="middle" fontFamily={fonts.nunito800} fontSize={12} fill={colors.textMuted}>
                {d.rotulo}
              </SvgText>
            </Fragment>
          ))}
        </Svg>
      </View>
      <Text style={styles.legendText}>
        {g.eixoX} × {g.eixoY}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  titulo: { fontFamily: fonts.nunito900, fontSize: 18, color: colors.text },
  explica: { fontFamily: fonts.nunito600, fontSize: 16, lineHeight: 23, color: colors.text },
  fonte: { fontFamily: fonts.nunito700, fontSize: 12, color: colors.textMuted },
  plot: { alignItems: 'center', paddingVertical: 14, borderRadius: radius.card, backgroundColor: colors.offWhite },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 28, height: 8, borderRadius: 4 },
  legendTitle: { fontFamily: fonts.fredoka600, fontSize: 18, color: colors.text },
  legendText: { fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
  table: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.option, overflow: 'hidden' },
  tr: { flexDirection: 'row', height: 40, alignItems: 'center' },
  th: { backgroundColor: colors.offWhite },
  thText: { fontFamily: fonts.nunito900, fontSize: 14, color: colors.textMuted },
  td: { flex: 1, textAlign: 'center', fontFamily: fonts.fredoka600, fontSize: 16, color: colors.text },
});
