// Grid de 8, margem lateral 20, toque mínimo 48. Tela base 390 × 844.
export const space = {
  gutter: 20,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  button: 16,
  option: 20,
  card: 24,
  tag: 8,
  pill: 999,
} as const;

export const sizes = {
  button: 56,
  touch: 48,
  borderWidth: 2,
  // Sombra sólida sem blur ("botão físico"): 4px, 5px nas bolhas, 6px na bolha atual
  shadow: 4,
  // Distância do topo da tela até o conteúdo, além do safe area (58 no design = 47 + 11)
  topExtra: 11,
  // Distância do conteúdo até o fim da tela, além do safe area (40 no design = 34 da home indicator + 6)
  bottomExtra: 6,
} as const;

/** Sombra sólida, sem blur, como no design: `0 4px 0 <cor>`. */
export const solidShadow = (color: string, y: number = sizes.shadow) =>
  `0px ${y}px 0px ${color}`;
