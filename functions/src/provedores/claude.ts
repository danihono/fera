// Claude (Anthropic): escreve os materiais e as questões. JSON garantido pelo esquema (output_config.format),
// raciocínio adaptativo e fallback do servidor ligado: se o modelo recusar, a própria API tenta o reserva.
import Anthropic from '@anthropic-ai/sdk';
import type { BetaContentBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ModeloIA, PedidoIA } from '../../../src/ia/pipeline';

export const MODELO_CLAUDE = process.env.FERA_MODELO_CLAUDE || 'claude-opus-5';

const IMAGENS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

/** Espaço pro raciocínio além da resposta visível. */
const FOLGA_RACIOCINIO = 32000;

export function modeloClaude(apiKey: string, modelo = MODELO_CLAUDE): ModeloIA {
  const client = new Anthropic({ apiKey });
  return {
    id: modelo,
    async gerar(p: PedidoIA) {
      const content: BetaContentBlockParam[] = p.partes.map((x): BetaContentBlockParam => {
        if ('texto' in x) return { type: 'text', text: x.texto, ...(x.cache ? { cache_control: { type: 'ephemeral' } } : {}) };
        if (x.arquivo.mime === 'application/pdf') return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: x.arquivo.base64 } };
        if ((IMAGENS as readonly string[]).includes(x.arquivo.mime))
          return { type: 'image', source: { type: 'base64', media_type: x.arquivo.mime as (typeof IMAGENS)[number], data: x.arquivo.base64 } };
        // Áudio, vídeo e HEIC ficam com o Gemini (é ele que lê o material); aqui só avisa.
        return { type: 'text', text: `[arquivo ${x.arquivo.mime} que este modelo não abre]` };
      });
      // Streaming: resposta longa sem estourar o tempo limite da requisição.
      const stream = client.beta.messages.stream({
        model: modelo,
        max_tokens: p.maxTokens + FOLGA_RACIOCINIO,
        // O prompt do sistema é fixo: fica em cache entre todas as provas.
        system: [{ type: 'text', text: p.sistema, cache_control: { type: 'ephemeral' } }],
        thinking: { type: 'adaptive' },
        output_config: { effort: p.esforco === 'alto' ? 'high' : 'medium', format: { type: 'json_schema', schema: p.esquema } },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [{ role: 'user', content }],
      });
      const msg = await stream.finalMessage();
      if (msg.stop_reason === 'refusal') throw new Error(`Claude recusou (${p.tarefa})`);
      if (msg.stop_reason === 'max_tokens') throw new Error(`Resposta cortada (${p.tarefa})`);
      const texto = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      return JSON.parse(texto);
    },
  };
}
