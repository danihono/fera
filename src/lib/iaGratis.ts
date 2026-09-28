// Modo grátis: o próprio app chama o Gemini pelo Firebase AI Logic (plano Spark, sem cartão).
// A chave da IA fica no Firebase, não no app; em produção, ligue o App Check pra ninguém usar sua cota.
import { getAI, getGenerativeModel, GoogleAIBackend, ThinkingLevel, type Part } from 'firebase/ai';
import type { ModeloIA, Motor } from '@/ia/pipeline';
import { firebase } from './firebase';

/** Modelo do modo grátis (dá pra trocar sem mexer no código: EXPO_PUBLIC_GEMINI_MODELO). */
export const MODELO_GRATIS = process.env.EXPO_PUBLIC_GEMINI_MODELO || 'gemini-3.5-flash';

function modeloGemini(): ModeloIA {
  const s = firebase();
  if (!s) throw new Error('Firebase desligado');
  const ai = getAI(s.app, { backend: new GoogleAIBackend() });
  return {
    id: MODELO_GRATIS,
    async gerar(p) {
      const model = getGenerativeModel(
        ai,
        {
          model: MODELO_GRATIS,
          systemInstruction: p.sistema,
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: p.esquema,
            // O raciocínio conta dentro do limite de saída: folga generosa.
            maxOutputTokens: Math.min(65536, p.maxTokens * 2 + 8000),
            thinkingConfig: { thinkingLevel: p.esforco === 'alto' ? ThinkingLevel.HIGH : ThinkingLevel.MEDIUM },
          },
        },
        { timeout: 240_000 },
      );
      const partes: Part[] = p.partes.map((x) => ('texto' in x ? { text: x.texto } : { inlineData: { mimeType: x.arquivo.mime, data: x.arquivo.base64 } }));
      const r = await model.generateContent(partes);
      return JSON.parse(r.response.text());
    },
  };
}

/** Tudo no Gemini Flash, 2 chamadas por vez (o nível grátis tem limite por minuto). */
export function motorGratis(): Motor {
  const m = modeloGemini();
  return { modelo: () => m, imagem: null, concorrencia: 2 };
}
