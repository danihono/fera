// Monta o motor do modo qualidade a partir das chaves disponíveis. Falta uma chave? A tarefa cai no outro provedor.
import { motorDemo } from '../../src/ia/demo';
import type { ModeloImagem, Motor } from '../../src/ia/pipeline';
import { ROTAS } from '../../src/ia/rotas';
import { modeloClaude } from './provedores/claude';
import { modeloGemini } from './provedores/gemini';
import { modeloImagem } from './provedores/openai';

export type Chaves = { anthropic?: string; gemini?: string; openai?: string };

export function criarMotor(chaves: Chaves, salvarImagem: (png: Buffer, indice: number) => Promise<string>): Motor {
  // Emulador/testes: sem IA de verdade.
  if (process.env.FERA_IA_MOCK === '1') return { ...motorDemo(200), imagem: null };

  const claude = chaves.anthropic ? modeloClaude(chaves.anthropic) : null;
  const gemini = chaves.gemini ? modeloGemini(chaves.gemini) : null;
  if (!claude && !gemini) throw new Error('Nenhuma chave de IA configurada (ANTHROPIC_API_KEY ou GEMINI_API_KEY).');
  const imagem: ModeloImagem | null = chaves.openai ? modeloImagem(chaves.openai, salvarImagem) : null;

  return {
    modelo: (t) => (ROTAS[t] === 'claude' ? (claude ?? gemini)! : (gemini ?? claude)!),
    imagem,
    concorrencia: 3,
  };
}
