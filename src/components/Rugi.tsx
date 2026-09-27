import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

const sources = {
  forca: require('../../assets/rugi/forca.png'), // splash, padrão
  acenando: require('../../assets/rugi/acenando.png'), // boas-vindas, trilha
  comemorando: require('../../assets/rugi/comemorando.png'), // acerto
  pensativo: require('../../assets/rugi/pensativo.png'), // pergunta, erro, IA
  triste: require('../../assets/rugi/triste.png'), // streak perdida
  dormindo: require('../../assets/rugi/dormindo.png'), // sumiu há dias
  impaciente: require('../../assets/rugi/impaciente.png'), // lembrete, push
  trofeu: require('../../assets/rugi/trofeu.png'), // fim de missão
  fogo: require('../../assets/rugi/fogo.png'), // streak, véspera
};

// Proporção largura/altura de cada PNG, pra usar só a largura como no design (height: auto).
const ratios: Record<RugiMood, number> = {
  forca: 499 / 600,
  acenando: 339 / 393,
  comemorando: 349 / 419,
  pensativo: 307 / 400,
  triste: 314 / 392,
  dormindo: 360 / 275,
  impaciente: 371 / 351,
  trofeu: 295 / 379,
  fogo: 368 / 446,
};

export type RugiMood = keyof typeof sources;

const labels: Record<RugiMood, string> = {
  forca: 'Rugi fazendo força',
  acenando: 'Rugi acenando',
  comemorando: 'Rugi comemorando',
  pensativo: 'Rugi pensativo',
  triste: 'Rugi triste',
  dormindo: 'Rugi dormindo',
  impaciente: 'Rugi impaciente apontando o relógio',
  trofeu: 'Rugi com troféu',
  fogo: 'Rugi pegando fogo',
};

type Props = {
  mood: RugiMood;
  width: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function Rugi({ mood, width, style, accessibilityLabel }: Props) {
  return (
    <Image
      source={sources[mood]}
      style={[{ width, height: width / ratios[mood] }, style]}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel ?? labels[mood]}
    />
  );
}
