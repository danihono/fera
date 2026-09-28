import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Rugi } from '@/components/Rugi';
import { colors, fonts, radius } from '@/theme';

function Card({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.art}>{children}</View>
      <Text style={styles.h}>{titulo}</Text>
      <Text style={styles.p}>{texto}</Text>
    </View>
  );
}

/** Ilustrações que explicam: a reta como uma rampa que o Rugi sobe. */
export function Imagens() {
  return (
    <View style={{ gap: 16 }}>
      <Card titulo="O a é a inclinação da rampa" texto="Rampa mais em pé = a maior. Se a rampa desce, o a é negativo.">
        <Svg width={300} height={170}>
          <Path d="M20 150 L280 30 L280 150 Z" fill={colors.redSoft} />
          <Line x1={20} y1={150} x2={280} y2={30} stroke={colors.red} strokeWidth={5} strokeLinecap="round" />
          <Path d="M200 150 A 40 40 0 0 0 196 118" stroke={colors.text} strokeWidth={2.5} fill="none" />
          <SvgText x={160} y={140} fontFamily={fonts.fredoka700} fontSize={20} fill={colors.redText}>
            a
          </SvgText>
        </Svg>
        <View style={styles.rugiRamp}>
          <Rugi mood="forca" width={62} />
        </View>
      </Card>

      <Card titulo="O b é onde a rampa começa" texto="Quando x = 0, a função vale b. É o ponto em que a reta encosta no eixo y.">
        <Svg width={300} height={170}>
          <Line x1={30} y1={10} x2={30} y2={160} stroke={colors.axis} strokeWidth={3} />
          <Line x1={10} y1={110} x2={290} y2={110} stroke={colors.axis} strokeWidth={3} />
          <Line x1={30} y1={150} x2={250} y2={30} stroke={colors.red} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={30} cy={150} r={9} fill={colors.red} />
          <SvgText x={46} y={158} fontFamily={fonts.fredoka700} fontSize={18} fill={colors.redText}>
            b
          </SvgText>
          <SvgText x={18} y={20} fontFamily={fonts.fredoka600} fontSize={14} fill={colors.textMuted}>
            y
          </SvgText>
        </Svg>
      </Card>

      <Card titulo="A raiz é onde a rampa cruza o chão" texto="O chão é o eixo x. No ponto em que a reta atravessa, f(x) = 0.">
        <Svg width={300} height={170}>
          <Path d="M0 110 H300 V170 H0 Z" fill={colors.successBg} />
          <Line x1={0} y1={110} x2={300} y2={110} stroke={colors.success} strokeWidth={3} />
          <Line x1={40} y1={160} x2={260} y2={30} stroke={colors.red} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={124} cy={110} r={10} fill={colors.white} stroke={colors.text} strokeWidth={3.5} />
          <SvgText x={140} y={140} fontFamily={fonts.fredoka700} fontSize={16} fill={colors.successText}>
            raiz: f(x) = 0
          </SvgText>
        </Svg>
        <View style={styles.rugiRoot}>
          <Rugi mood="comemorando" width={70} />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, backgroundColor: colors.offWhite, padding: 16, gap: 6 },
  art: { height: 180, alignItems: 'center', justifyContent: 'center', borderRadius: radius.option, backgroundColor: colors.white, marginBottom: 6, overflow: 'hidden' },
  rugiRamp: { position: 'absolute', left: 150, top: 26, transform: [{ rotate: '-20deg' }] },
  rugiRoot: { position: 'absolute', right: 18, bottom: 6 },
  h: { fontFamily: fonts.nunito900, fontSize: 17, color: colors.text },
  p: { fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 21, color: colors.textMuted },
});
