// Conquistas: as 8 primeiras são as do design (Perfil); as outras aparecem em "Ver todas".
// Cada uma é calculada a partir do progresso (store.ts); as que dependem de recursos que ainda não existem ficam bloqueadas.
import type { ReactNode } from 'react';
import {
  BoltIcon,
  ClipboardCheckIcon,
  CrownIcon,
  FireIcon,
  PodiumFilledIcon,
  ShareIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
  TimerIcon,
} from '@/components/icons';
import { colors } from '@/theme';
import { nivelDe, type AppState } from './store';

export type Conquista = { id: string; nome: string; nomeLongo?: string; descricao: string; icone: ReactNode; bloqueada?: boolean };

type Def = Omit<Conquista, 'icone' | 'bloqueada'> & { icone: (ok: boolean) => ReactNode; ok: (s: AppState) => boolean };

const on = colors.white;
const off = colors.lockedFill;
const marco = (id: string) => (s: AppState) => s.marcos.includes(id);

const DEFS: Def[] = [
  { id: 'primeira', nome: '1ª missão', descricao: 'Completou a primeira missão.', icone: (ok) => <StarIcon size={28} color={ok ? on : off} />, ok: (s) => s.provas.some((p) => p.feitas.length > 0) },
  { id: 'sete', nome: '7 dias', descricao: 'Estudou 7 dias seguidos.', icone: (ok) => <FireIcon size={28} core={false} fill={ok ? on : off} />, ok: (s) => s.recorde >= 7 },
  { id: 'zero', nome: 'Zero erros', descricao: 'Fechou uma missão sem errar nada.', icone: (ok) => <TargetIcon size={28} color={ok ? on : colors.lockedIcon} />, ok: marco('zero') },
  { id: 'top3', nome: 'Top 3', descricao: 'Ficou entre os 3 primeiros da turma.', icone: (ok) => <PodiumFilledIcon size={28} color={ok ? on : colors.lockedIcon} />, ok: marco('top3') },
  { id: 'madrugador', nome: 'Madrugador', descricao: 'Fez uma missão antes das 7h.', icone: (ok) => <SunIcon size={28} color={ok ? on : colors.lockedIcon} />, ok: marco('madrugador') },
  { id: 'trinta', nome: '30 dias', descricao: 'Estude 30 dias seguidos.', icone: (ok) => <FireIcon size={28} core={false} fill={ok ? on : off} />, ok: (s) => s.recorde >= 30 },
  {
    id: 'simulado',
    nome: 'Simulado',
    nomeLongo: 'Simulado ENEM',
    descricao: 'Termine um simulado (Fera+).',
    icone: (ok) => <ClipboardCheckIcon size={28} color={ok ? on : colors.lockedIcon} />,
    ok: marco('simulado'),
  },
  { id: 'lenda', nome: 'Lenda', descricao: 'Chegue ao nível 20.', icone: (ok) => <CrownIcon width={30} height={30} color={ok ? on : off} base={null} />, ok: (s) => nivelDe(s.xp).nivel >= 20 },
  { id: 'relampago', nome: 'Relâmpago', descricao: 'Faça 3 missões em um dia.', icone: (ok) => <BoltIcon size={28} color={ok ? on : off} outline={false} />, ok: marco('relampago') },
  { id: 'maratona', nome: 'Maratona', descricao: 'Estude 60 minutos numa semana.', icone: (ok) => <TimerIcon size={28} color={ok ? on : colors.lockedIcon} />, ok: marco('maratona') },
  { id: 'convite', nome: 'Chamou a turma', descricao: 'Convide 3 colegas pro Fera.', icone: (ok) => <ShareIcon size={28} color={ok ? on : colors.lockedIcon} />, ok: marco('convite') },
  { id: 'fera', nome: 'Fera total', descricao: 'Tire nota máxima numa prova marcada no app.', icone: (ok) => <StarIcon size={28} color={ok ? on : off} />, ok: marco('fera') },
];

export function conquistasDe(s: AppState): Conquista[] {
  return DEFS.map(({ icone, ok, ...c }) => {
    const feita = ok(s);
    return { ...c, icone: icone(feita), bloqueada: !feita };
  });
}
