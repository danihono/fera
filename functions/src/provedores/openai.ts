// GPT Image (OpenAI): as ilustrações. Sem texto dentro da imagem (a legenda fica no app, em português certinho).
import OpenAI from 'openai';
import type { ModeloImagem } from '../../../src/ia/pipeline';

export const MODELO_IMAGEM = process.env.FERA_MODELO_IMAGEM || 'gpt-image-2';
const QUALIDADE = (process.env.FERA_QUALIDADE_IMAGEM || 'medium') as 'low' | 'medium' | 'high';

/** salvar: recebe o PNG e devolve a URL pública (Cloud Storage). */
export function modeloImagem(apiKey: string, salvar: (png: Buffer, indice: number) => Promise<string>, modelo = MODELO_IMAGEM): ModeloImagem {
  const client = new OpenAI({ apiKey });
  return {
    id: modelo,
    async gerar(prompt, { indice }) {
      const r = await client.images.generate({ model: modelo, prompt, size: '1024x1024', quality: QUALIDADE, n: 1 });
      const b64 = r.data?.[0]?.b64_json;
      if (!b64) throw new Error('imagem vazia');
      return salvar(Buffer.from(b64, 'base64'), indice);
    },
  };
}
