// Gemini (Google): lê fotos, PDFs e letra à mão (multimodal, contexto enorme e barato) e é o segundo professor
// que resolve as questões sem gabarito — outra família de modelo pega erros que o autor não vê.
import { GoogleGenAI, ThinkingLevel, type Part } from '@google/genai';
import type { ModeloIA, PedidoIA } from '../../../src/ia/pipeline';

export const MODELO_GEMINI = process.env.FERA_MODELO_GEMINI || 'gemini-3.5-flash';

export function modeloGemini(apiKey: string, modelo = MODELO_GEMINI): ModeloIA {
  const ai = new GoogleGenAI({ apiKey });
  return {
    id: modelo,
    async gerar(p: PedidoIA) {
      const parts: Part[] = p.partes.map((x) => ('texto' in x ? { text: x.texto } : { inlineData: { mimeType: x.arquivo.mime, data: x.arquivo.base64 } }));
      const r = await ai.models.generateContent({
        model: modelo,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: p.sistema,
          responseMimeType: 'application/json',
          responseJsonSchema: p.esquema,
          maxOutputTokens: Math.min(65536, p.maxTokens * 2 + 8000),
          thinkingConfig: { thinkingLevel: p.esforco === 'alto' ? ThinkingLevel.HIGH : ThinkingLevel.MEDIUM },
        },
      });
      if (!r.text) throw new Error(`Gemini sem resposta (${p.tarefa}): ${r.candidates?.[0]?.finishReason ?? '?'}`);
      return JSON.parse(r.text);
    },
  };
}
