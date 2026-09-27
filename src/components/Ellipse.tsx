import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Ellipse as SvgEllipse } from 'react-native-svg';

/** Elipse de verdade (borderRadius no RN só faz pílula) — sombras do Rugi no chão. */
export function Ellipse({ width, height, color, style }: { width: number; height: number; color: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={width} height={height} style={style}>
      <SvgEllipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={color} />
    </Svg>
  );
}
