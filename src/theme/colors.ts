// Tokens de cor do Fera — valores exatos do canvas "Fera — App de estudos" (Design system v1).
// Regra: nenhuma tela usa hex solto; tudo vem daqui.
export const colors = {
  // Marca
  red: '#E8322B', // CTAs, ativo, progresso, Rugi
  redDeep: '#B8201A', // sombra sólida dos botões
  redPressed: '#D42C25', // botão primário pressionado
  redSoft: '#FFE8E5', // chips, selecionado, pílula da aba ativa
  redText: '#C4261F', // texto vermelho sobre redSoft (AA)
  redHighlight: '#FF6F68', // brilho interno da barra de progresso
  redStripe: '#D72A23', // listras decorativas sobre o vermelho
  redShadow: '#8E1510', // sombra do Rugi no splash
  trailDone: '#FFD2CD', // trecho concluído da trilha (Início)
  progressShade: '#FFD6D1', // sombra interna do preenchimento branco da barra no card vermelho

  // Streak / fogo (gradiente de cima pra baixo)
  fireTop: '#FF6B1A',
  fireBottom: '#E8322B',
  fireCore: '#FFD9C2',

  // Acerto
  success: '#2BB673',
  successBg: '#E6F7EE',
  successText: '#17804F',
  successButton: '#19925A',
  successButtonShadow: '#0F6A40',
  successHighlight: '#6FD6A2',

  // Erro — nunca vermelho
  error: '#FF8A00',
  errorBg: '#FFF1E0',
  errorText: '#A65300',
  errorShadow: '#C96A00',

  // Neutros
  white: '#FFFFFF',
  offWhite: '#FFF8F6', // seções, cards, caixa da fórmula
  border: '#F0E6E4', // bordas 2px, trilho, divisórias
  locked: '#E3D6D3', // sombra de itens futuros
  lockedIcon: '#B5AAA8',
  text: '#2A1F1F', // nunca preto puro
  textMuted: '#756A69', // texto secundário (ajuste AA)
  iconMuted: '#8A7F7E', // ícones inativos, fechar
  canvas: '#F4EEEC', // fundo atrás do app no web
  scrim: 'rgba(42, 31, 31, 0.4)', // fundo escurecido atrás de bottom sheets (text a 40%)
} as const;

export type ColorToken = keyof typeof colors;
