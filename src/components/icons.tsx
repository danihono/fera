// Ícones copiados 1:1 dos SVGs do canvas (traço 2.5, pontas arredondadas).
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '@/theme';

type TabIconProps = { active: boolean; size?: number };

const tabColors = (active: boolean) => ({
  fill: active ? colors.red : 'none',
  stroke: active ? colors.red : colors.iconMuted,
  inner: active ? colors.redSoft : colors.iconMuted,
});

export function HomeIcon({ active, size = 26 }: TabIconProps) {
  const c = tabColors(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={c.fill} stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3.5 10.5 12 3.5l8.5 7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-5.5h-6v5.5H5A1.5 1.5 0 0 1 3.5 19z" />
    </Svg>
  );
}

export function ExamsIcon({ active, size = 26 }: TabIconProps) {
  const c = tabColors(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={c.fill} stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z" />
      <Path d="M9 3.5v17" stroke={c.inner} />
      <Path d="M12 9h4" stroke={c.inner} />
      <Path d="M12 12.5h4" stroke={c.inner} />
    </Svg>
  );
}

export function PodiumIcon({ active, size = 26 }: TabIconProps) {
  const c = tabColors(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={c.fill} stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9.5 20.5V9.5h5v11z" />
      <Path d="M3.5 20.5v-6h6v6z" />
      <Path d="M14.5 20.5v-8h6v8z" />
      <Path d="M12 3.5l.9 1.8 2 .3-1.5 1.4.4 2L12 8.1l-1.8.9.4-2-1.5-1.4 2-.3z" strokeWidth={1.6} />
    </Svg>
  );
}

export function ProfileIcon({ active, size = 26 }: TabIconProps) {
  const c = tabColors(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={c.fill} stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8.5} r={4} />
      <Path d="M4.5 20.5c.8-4 3.9-6.2 7.5-6.2s6.7 2.2 7.5 6.2z" />
    </Svg>
  );
}

/** Patinha com "+" do botão central da tab bar. */
export function PawPlusIcon({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5.6} cy={9.4} r={2.1} fill={colors.white} />
      <Circle cx={9.3} cy={5.6} r={2.2} fill={colors.white} />
      <Circle cx={14.7} cy={5.6} r={2.2} fill={colors.white} />
      <Circle cx={18.4} cy={9.4} r={2.1} fill={colors.white} />
      <Path d="M12 10.2c3.4 0 6.6 3.4 6.6 6.4 0 2.2-1.6 3.4-3.3 3.4-1.4 0-2.1-.7-3.3-.7s-1.9.7-3.3.7c-1.7 0-3.3-1.2-3.3-3.4 0-3 3.2-6.4 6.6-6.4z" fill={colors.white} />
      <Path d="M12 13v5.2M9.4 15.6h5.2" stroke={colors.red} strokeWidth={2.4} strokeLinecap="round" />
    </Svg>
  );
}

export function FireIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.fireTop} />
          <Stop offset="1" stopColor={colors.fireBottom} />
        </LinearGradient>
      </Defs>
      <Path d="M12 2.5c.8 3 3.8 4.8 5.2 8 1.6 3.8-.6 9-5.2 9s-6.8-4-5.6-7.6c.5-1.6 1.6-2.6 2.6-3.2 0 1.6.8 2.6 1.8 2.8C10.2 9.2 10.4 5.6 12 2.5z" fill="url(#fire)" />
      <Path d="M12 12.6c1.3 1.3 2.5 2.5 2.1 4.3-.3 1.3-1.2 2-2.1 2s-1.9-.7-2.1-2c-.2-1.6.9-2.9 2.1-4.3z" fill={colors.fireCore} />
    </Svg>
  );
}

export function BoltIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" fill={colors.red} stroke={colors.red} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

export function HeartIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20.5S3.5 15.5 3.5 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.3C20.5 15.5 12 20.5 12 20.5z" fill={colors.red} />
      <Path d="M7.5 9.2a2 2 0 0 1 2-1.9" stroke={colors.white} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7} />
    </Svg>
  );
}
