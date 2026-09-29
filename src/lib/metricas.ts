// Métricas no celular: o SDK JS do Analytics não roda no React Native. No build das lojas, trocar por
// @react-native-firebase/analytics mantendo os mesmos nomes de evento (veja docs/COMO-LIGAR.md). Aqui não faz nada.
type Params = Record<string, string | number | boolean>;

export function evento(_nome: string, _params?: Params) {}
export function aplicarConsentimento(_ligado: boolean) {}
export function capturarErros() {}
