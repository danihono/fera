import { useState, type ReactNode } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Miolo de tela que só rola quando não cabe (celular baixo). No tamanho do design ele ocupa a sobra
 * como o espaçador flex: 1 que substitui, então nada muda de lugar; o botão de baixo fica fora dele.
 */
export function Rolavel({ children, style, contentStyle }: { children: ReactNode; style?: StyleProp<ViewStyle>; contentStyle?: StyleProp<ViewStyle> }) {
  const [caixa, setCaixa] = useState(0);
  const [conteudo, setConteudo] = useState(0);
  return (
    <ScrollView
      style={[{ flex: 1, alignSelf: 'stretch' }, style]}
      contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
      scrollEnabled={conteudo > caixa + 1}
      onLayout={(e) => setCaixa(e.nativeEvent.layout.height)}
      onContentSizeChange={(_, h) => setConteudo(h)}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
