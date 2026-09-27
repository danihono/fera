import type { TextStyle } from 'react-native';

// No React Native cada peso é uma família própria (carregadas em src/app/_layout.tsx).
export const fonts = {
  fredoka500: 'Fredoka_500Medium',
  fredoka600: 'Fredoka_600SemiBold',
  fredoka700: 'Fredoka_700Bold',
  nunito400: 'Nunito_400Regular',
  nunito600: 'Nunito_600SemiBold',
  nunito700: 'Nunito_700Bold',
  nunito800: 'Nunito_800ExtraBold',
  nunito900: 'Nunito_900Black',
} as const;

// Escala do design system (Fera · Design system · Tipografia).
export const type = {
  display: { fontFamily: fonts.fredoka700, fontSize: 48 }, // +45 XP · 1.240
  h1: { fontFamily: fonts.fredoka700, fontSize: 32 }, // Missão completa!
  screenTitle: { fontFamily: fonts.fredoka600, fontSize: 28 }, // Qual sua próxima prova?
  cardTitle: { fontFamily: fonts.nunito800, fontSize: 20 }, // Tirar foto do caderno
  body: { fontFamily: fonts.nunito600, fontSize: 16 },
  caption: { fontFamily: fonts.nunito700, fontSize: 13 },
  button: {
    fontFamily: fonts.nunito800,
    fontSize: 18,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tag: {
    fontFamily: fonts.nunito900,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabLabel: { fontFamily: fonts.nunito700, fontSize: 12, lineHeight: 14 },
  tabLabelActive: { fontFamily: fonts.nunito800, fontSize: 12, lineHeight: 14 },
  stat: { fontFamily: fonts.fredoka600, fontSize: 18 },
} satisfies Record<string, TextStyle>;
