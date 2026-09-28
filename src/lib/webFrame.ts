// Web dentro da moldura de celular do site (iframe): simula as áreas seguras do iPhone do design
// (47 em cima, 34 embaixo). O react-native-safe-area-context lê essas áreas de um elemento com
// padding env(safe-area-inset-*); aqui a regra CSS sobrescreve esse padding. Só roda na web, dentro de iframe.
import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.top !== window.self) {
  const style = document.createElement('style');
  style.textContent = 'div[style*="safe-area-inset"]{padding-top:47px!important;padding-bottom:34px!important}';
  document.head.appendChild(style);
}
