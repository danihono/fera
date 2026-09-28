// Conquistas: as 8 primeiras são as do design (Perfil); as outras aparecem em "Ver todas".
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

export type Conquista = { id: string; nome: string; nomeLongo?: string; descricao: string; icone: ReactNode; bloqueada?: boolean };

const on = colors.white;
const off = colors.lockedFill;

export const CONQUISTAS: Conquista[] = [
  { id: 'primeira', nome: '1ª missão', descricao: 'Completou a primeira missão.', icone: <StarIcon size={28} color={on} /> },
  { id: 'sete', nome: '7 dias', descricao: 'Estudou 7 dias seguidos.', icone: <FireIcon size={28} core={false} fill={on} /> },
  { id: 'zero', nome: 'Zero erros', descricao: 'Fechou uma missão sem errar nada.', icone: <TargetIcon size={28} color={on} /> },
  { id: 'top3', nome: 'Top 3', descricao: 'Ficou entre os 3 primeiros da turma.', icone: <PodiumFilledIcon size={28} color={on} /> },
  { id: 'madrugador', nome: 'Madrugador', descricao: 'Fez uma missão antes das 7h.', icone: <SunIcon size={28} color={on} /> },
  { id: 'trinta', nome: '30 dias', descricao: 'Estude 30 dias seguidos.', icone: <FireIcon size={28} core={false} fill={off} />, bloqueada: true },
  {
    id: 'simulado',
    nome: 'Simulado',
    nomeLongo: 'Simulado ENEM',
    descricao: 'Termine um simulado do ENEM (Fera+).',
    icone: <ClipboardCheckIcon size={28} color={colors.lockedIcon} />,
    bloqueada: true,
  },
  { id: 'lenda', nome: 'Lenda', descricao: 'Chegue ao nível 20.', icone: <CrownIcon width={30} height={30} color={off} base={null} />, bloqueada: true },
  { id: 'relampago', nome: 'Relâmpago', descricao: 'Faça 3 missões em um dia.', icone: <BoltIcon size={28} color={off} outline={false} />, bloqueada: true },
  { id: 'maratona', nome: 'Maratona', descricao: 'Estude 60 minutos numa semana.', icone: <TimerIcon size={28} color={colors.lockedIcon} />, bloqueada: true },
  { id: 'convite', nome: 'Chamou a turma', descricao: 'Convide 3 colegas pro Fera.', icone: <ShareIcon size={28} color={colors.lockedIcon} />, bloqueada: true },
  { id: 'fera', nome: 'Fera total', descricao: 'Tire nota máxima numa prova marcada no app.', icone: <StarIcon size={28} color={off} />, bloqueada: true },
];
