// Ícones copiados 1:1 dos SVGs do canvas (traço 2.5, pontas arredondadas).
import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
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

const FLAME = 'M12 2.5c.8 3 3.8 4.8 5.2 8 1.6 3.8-.6 9-5.2 9s-6.8-4-5.6-7.6c.5-1.6 1.6-2.6 2.6-3.2 0 1.6.8 2.6 1.8 2.8C10.2 9.2 10.4 5.6 12 2.5z';
const FLAME_CORE = 'M12 12.6c1.3 1.3 2.5 2.5 2.1 4.3-.3 1.3-1.2 2-2.1 2s-1.9-.7-2.1-2c-.2-1.6.9-2.9 2.1-4.3z';

/**
 * Chama do streak. Padrão: gradiente laranja → vermelho com miolo claro.
 * `core={false}` tira o miolo (02c); `fill` troca o gradiente por uma cor lisa (branca no card da Fim, cinza apagada na Streak).
 */
export function FireIcon({ size = 24, core = true, fill, coreFill = colors.fireCore }: { size?: number; core?: boolean; fill?: string; coreFill?: string }) {
  // id único por ícone: com várias telas montadas, um id repetido faz o url(#id) apontar pra uma tela escondida.
  const uid = useId().replace(/:/g, '');
  const id = fill ? undefined : `fire-${uid}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {id && (
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.fireTop} />
            <Stop offset="1" stopColor={colors.fireBottom} />
          </LinearGradient>
        </Defs>
      )}
      <Path d={FLAME} fill={fill ?? `url(#${id})`} />
      {core && <Path d={FLAME_CORE} fill={coreFill} />}
    </Svg>
  );
}

/** `outline={false}` é o raio só com preenchimento (pílula de XP, Fim). */
export function BoltIcon({ size = 22, color = colors.red, outline = true }: { size?: number; color?: string; outline?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z"
        fill={color}
        {...(outline ? { stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round' as const } : {})}
      />
    </Svg>
  );
}

/** `shine={false}` é o coração liso do topo da missão. */
export function HeartIcon({ size = 22, shine = true }: { size?: number; shine?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20.5S3.5 15.5 3.5 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.3C20.5 15.5 12 20.5 12 20.5z" fill={colors.red} />
      {shine && <Path d="M7.5 9.2a2 2 0 0 1 2-1.9" stroke={colors.white} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.7} />}
    </Svg>
  );
}

type StrokeIconProps = { size?: number; color?: string };

export function ChevronLeftIcon({ size = 22, color = colors.text }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 22, color = colors.text, strokeWidth = 2.5 }: StrokeIconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color = colors.white, strokeWidth = 3.5 }: StrokeIconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = colors.textMuted }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

// Matérias (02b). Traço 2.5 (2.2 no átomo), cor vem de fora: vermelho no círculo claro, branco no selecionado.
export type SubjectId = 'matematica' | 'portugues' | 'historia' | 'geografia' | 'biologia' | 'quimica' | 'fisica' | 'ingles';

export function SubjectIcon({ subject, size = 22, color = colors.red }: StrokeIconProps & { subject: SubjectId }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (subject) {
    case 'matematica':
      return (
        <Svg {...common} strokeWidth={2.5} strokeLinejoin={undefined}>
          <Path d="M7 4v6M4 7h6M14 7h6M4.5 14.5l5 5M9.5 14.5l-5 5M14 15.5h6M14 18.5h6" />
        </Svg>
      );
    case 'portugues':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" />
        </Svg>
      );
    case 'historia':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 5 9 5 9 8.5s-9 3.5-9 8.5M16.5 3.5c0 5-9 5-9 8.5s9 3.5 9 8.5" />
        </Svg>
      );
    case 'geografia':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Circle cx={12} cy={12} r={8.5} />
          <Path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" />
        </Svg>
      );
    case 'biologia':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15zM5 19l7-7" />
        </Svg>
      );
    case 'quimica':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Path d="M9.5 3.5h5M10.5 3.5V9L5 18.5a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L13.5 9V3.5M7.5 14.5h9" />
        </Svg>
      );
    case 'fisica':
      return (
        <Svg {...common} strokeWidth={2.2} strokeLinejoin={undefined}>
          <Ellipse cx={12} cy={12} rx={9} ry={3.6} />
          <G rotation={60} origin="12, 12">
            <Ellipse cx={12} cy={12} rx={9} ry={3.6} />
          </G>
          <G rotation={-60} origin="12, 12">
            <Ellipse cx={12} cy={12} rx={9} ry={3.6} />
          </G>
          <Circle cx={12} cy={12} r={1.2} fill={color} />
        </Svg>
      );
    case 'ingles':
      return (
        <Svg {...common} strokeWidth={2.5}>
          <Path d="M4.5 4.5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-9L6 19.5V16H4.5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1zM8 9h8M8 12h5" />
        </Svg>
      );
  }
}

// Trilha da Início (03).
export function StarIcon({ size = 38, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.5l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function LockIcon({ size = 26, color = colors.lockedIcon }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={5.5} y={10.5} width={13} height={10} rx={2.5} />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Svg>
  );
}

export function TrophyIcon({ size = 36, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" fill={colors.redSoft} />
      <Path d="M7.5 5.5H5a2.5 2.5 0 0 0 2.8 3.4M16.5 5.5H19a2.5 2.5 0 0 1-2.8 3.4M12 13.5v3.5M8.5 20h7M9.5 20l.5-3h4l.5 3" />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = colors.text, strokeWidth = 2.8 }: StrokeIconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

// Nova prova (04).
export function CalendarIcon({ size = 18, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={5.5} width={16} height={15} rx={3} />
      <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </Svg>
  );
}

export function CameraIcon({ size = 28, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
      <Circle cx={12} cy={13} r={3.5} />
    </Svg>
  );
}

export function FileIcon({ size = 28, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 3.5h7l4.5 4.5V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5zM13.5 3.5v5h5M9 13h6M9 16.5h4" />
    </Svg>
  );
}

export function PencilIcon({ size = 28, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.5 18.5zM13.5 7.5l3 3M13 19.5h6.5" />
    </Svg>
  );
}

// Missão (06–07).
/** X de traço grosso das alternativas (Falso, erro). */
export function XMarkIcon({ size = 24, color = colors.text, strokeWidth = 3.2 }: StrokeIconProps & { strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 18, color = colors.error }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h13M13 6l6 6-6 6" />
    </Svg>
  );
}

// Turma (10).
export function ChevronDownIcon({ size = 16, color = colors.textMuted }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function CopyIcon({ size = 20, color = colors.redText }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={8.5} y={8.5} width={11} height={11} rx={2.5} />
      <Path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </Svg>
  );
}

export function ShareIcon({ size = 20, color = colors.redText }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 14.5V3.5M7.5 8 12 3.5 16.5 8M5.5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-6.5" />
    </Svg>
  );
}

/** Coroa do 1º lugar (26 × 20). Na conquista "Lenda" bloqueada: cinza, sem a base. */
export function CrownIcon({ width = 26, height = 20, color = colors.red, base = colors.redDeep }: { width?: number; height?: number; color?: string; base?: string | null }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 20">
      <Path d="M3 17 L1.5 5 L8 10 L13 2 L18 10 L24.5 5 L23 17 Z" fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {base && <Path d="M3 17h20" stroke={base} strokeWidth={2.5} strokeLinecap="round" />}
    </Svg>
  );
}

// Véspera (11).
export function TimerIcon({ size = 20, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={13} r={7.5} />
      <Path d="M12 9.5V13l2.5 1.5M9.5 3h5" />
    </Svg>
  );
}

// Perfil (12).
export function GearIcon({ size = 22, color = colors.text }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Svg>
  );
}

export function ExamsFilledIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={colors.redSoft} stroke={colors.red} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z" />
      <Path d="M9 3.5v17M12 9h4M12 12.5h4" fill="none" />
    </Svg>
  );
}

export function TargetIcon({ size = 28, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.5} />
      <Circle cx={12} cy={12} r={1} fill={color} />
    </Svg>
  );
}

export function PodiumFilledIcon({ size = 28, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round">
      <Path d="M9.5 20.5V9.5h5v11zM3.5 20.5v-6h6v6zM14.5 20.5v-8h6v8z" />
    </Svg>
  );
}

export function SunIcon({ size = 28, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </Svg>
  );
}

export function ClipboardCheckIcon({ size = 28, color = colors.lockedIcon }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 4.5h-2A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5h-2M8.5 3h7v3h-7zM8.5 12l2 2 4-4M8.5 17.5h7" />
    </Svg>
  );
}

// Premium (13).
export function BookWaveIcon({ size = 24, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5zM9 3.5v17" />
      <Path d="M11.5 12c.9-1.6 2-1.6 2.5 0s1.6 1.6 2.5 0c-.9 1.6-2 1.6-2.5 0s-1.6-1.6-2.5 0z" strokeWidth={2} />
    </Svg>
  );
}

export function HeartWaveIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20.5S3.5 15.5 3.5 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.3C20.5 15.5 12 20.5 12 20.5z" fill={colors.red} />
      <Path d="M8.2 12.2c1-1.6 2.3-1.6 3.8 0s2.8 1.6 3.8 0c-1 1.6-2.3 1.6-3.8 0s-2.8-1.6-3.8 0z" fill="none" stroke={colors.white} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BanIcon({ size = 24, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M6 6l12 12" />
    </Svg>
  );
}

export function SparkleIcon({ size = 18, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2c.8 4.5 2.7 6.9 8 10-5.3 3.1-7.2 5.5-8 10-.8-4.5-2.7-6.9-8-10 5.3-3.1 7.2-5.5 8-10z" fill={color} />
    </Svg>
  );
}

// Configurações (extra, fora do design).
export function BellIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function SoundIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </Svg>
  );
}

export function HelpIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M9.8 9.5a2.3 2.3 0 0 1 4.4 1c0 1.5-2.2 2-2.2 3.5M12 17h.01" />
    </Svg>
  );
}

export function LogoutIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10M16.5 8.5 20 12l-3.5 3.5" />
    </Svg>
  );
}

export function UserIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8.5} r={4} />
      <Path d="M4.5 20.5c.8-4 3.9-6.2 7.5-6.2s6.7 2.2 7.5 6.2" />
    </Svg>
  );
}

// Formatos de estudo (extra, fora do design).
export function StepsIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 6.5h2M4 12h2M4 17.5h2M9.5 6.5h10.5M9.5 12h10.5M9.5 17.5h7" />
    </Svg>
  );
}

export function MindMapIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Circle cx={4.5} cy={5.5} r={2} />
      <Circle cx={19.5} cy={5.5} r={2} />
      <Circle cx={4.5} cy={18.5} r={2} />
      <Circle cx={19.5} cy={18.5} r={2} />
      <Path d="M6 7l3.7 3M18 7l-3.7 3M6 17l3.7-3M18 17l-3.7-3" />
    </Svg>
  );
}

export function QuizIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.5 4.5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-9L6 19.5V16H4.5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" />
      <Path d="M10.2 8.5a1.9 1.9 0 0 1 3.6.8c0 1.2-1.8 1.5-1.8 2.7M12 14h.01" />
    </Svg>
  );
}

export function SlidesIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3.5} y={4.5} width={17} height={12} rx={2} />
      <Path d="M12 16.5v3M8.5 19.5h7M10.5 8.5v4l3.5-2z" />
    </Svg>
  );
}

export function ChartIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4v16h16M7.5 15.5l4-4.5 3 2.5 5-6" />
    </Svg>
  );
}

export function FlowIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={8} y={2.5} width={8} height={5} rx={1.5} />
      <Rect x={2.5} y={16.5} width={8} height={5} rx={1.5} />
      <Rect x={13.5} y={16.5} width={8} height={5} rx={1.5} />
      <Path d="M12 7.5v4.5M6.5 16.5V12h11v4.5" />
    </Svg>
  );
}

export function ImageIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3.5} y={4.5} width={17} height={15} rx={2.5} />
      <Circle cx={9} cy={9.5} r={1.8} />
      <Path d="M20.5 15.5 16 11l-8.5 8.5" />
    </Svg>
  );
}

// Arquivos, conta e telas de apoio (fora do canvas; mesmo traço 2.5 arredondado dos outros).
const stroke = (color: string, strokeWidth = 2.5) => ({ fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export function MicIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Rect x={9} y={3.5} width={6} height={11} rx={3} />
      <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
    </Svg>
  );
}

export function VideoIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Rect x={3} y={6} width={13} height={12} rx={2.5} />
      <Path d="M16 10.5l5-3v9l-5-3z" />
    </Svg>
  );
}

export function GlobeIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5s1.2-6.2 3.6-8.5z" />
    </Svg>
  );
}

export function TableIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Rect x={3.5} y={4.5} width={17} height={15} rx={2} />
      <Path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" />
    </Svg>
  );
}

export function FolderIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z" />
    </Svg>
  );
}

export function UploadIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 15v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </Svg>
  );
}

export function EyeIcon({ size = 22, color = colors.textMuted, off = false }: StrokeIconProps & { off?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <Circle cx={12} cy={12} r={3} />
      {off && <Path d="M4 4l16 16" />}
    </Svg>
  );
}

export function MailIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2} />
      <Path d="M4 7l8 6 8-6" />
    </Svg>
  );
}

export function KeyIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Circle cx={8} cy={15} r={4} />
      <Path d="M11 12l8.5-8.5M16 7l2.5 2.5M18.5 4.5l1.5 1.5" />
    </Svg>
  );
}

export function TrashIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13M10 10.5v5.5M14 10.5v5.5" />
    </Svg>
  );
}

export function ShieldIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M12 3.5l7.5 3v5.5c0 4.4-3.2 7.6-7.5 8.5-4.3-.9-7.5-4.1-7.5-8.5V6.5z" />
      <Path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
    </Svg>
  );
}

export function InfoIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5.5M12 7.8h.01" />
    </Svg>
  );
}

export function WifiOffIcon({ size = 18, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M3 3l18 18M8.5 16a5 5 0 0 1 6.3-.6M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-3.2-2M2 9a15 15 0 0 1 4.3-2.7M22 9a15 15 0 0 0-10-3.8M12 19.5h.01" />
    </Svg>
  );
}

export function CameraSmallIcon({ size = 18, color = colors.white }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Path d="M4.5 8h2.8l1.7-2.5h6l1.7 2.5h2.8A1.5 1.5 0 0 1 21 9.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9.5A1.5 1.5 0 0 1 4.5 8z" />
      <Circle cx={12} cy={13.5} r={3.5} />
    </Svg>
  );
}

export function CalendarEditIcon({ size = 22, color = colors.red }: StrokeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color)}>
      <Rect x={3.5} y={5} width={17} height={15} rx={2} />
      <Path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4" />
    </Svg>
  );
}
