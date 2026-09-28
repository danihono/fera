// Monta o motor do modo qualidade a partir das chaves disponíveis. Falta uma chave? A tarefa cai no outro provedor.
import { motorDemo } from '../../src/ia/demo';
import type { ModeloImagem, Motor } from '../../src/ia/pipeline';
import { ROTAS } from '../../src/ia/rotas';
import type { Tarefa } from '../../src/ia/tipos';
import { modeloClaude } from './provedores/claude';
import { modeloGemini } from './provedores/gemini';
import { modeloImagem } from './provedores/openai';

export type Chaves = { anthropic?: string; gemini?: string; openai?: string };

const QUESTOES = new Set<Tarefa>(['missoes', 'teste', 'simulado', 'correcao']);

export function criarMotor(chaves: Chaves, salvarImagem: (png: Buffer, indice: number) => Promise<string>): Motor {
  // Emulador/testes: sem IA de verdade.
  if (process.env.FERA_IA_MOCK === '1') return { ...motorDemo(200), imagem: null };

  // Questões (gabarito!) sempre no Claude principal; materiais podem ir pra um modelo mais barato
  // (FERA_MODELO_CLAUDE_MATERIAIS=claude-sonnet-5, por exemplo).
  const claude = chaves.anthropic ? modeloClaude(chaves.anthropic) : null;
  const materiais = process.env.FERA_MODELO_CLAUDE_MATERIAIS;
  const claudeMateriais = chaves.anthropic && materiais ? modeloClaude(chaves.anthropic, materiais) : claude;
  const gemini = chaves.gemini ? modeloGemini(chaves.gemini) : null;
  if (!claude && !gemini) throw new Error('Nenhuma chave de IA configurada (ANTHROPIC_API_KEY ou GEMINI_API_KEY).');
  const imagem: ModeloImagem | null = chaves.openai ? modeloImagem(chaves.openai, salvarImagem) : null;

  return {
    modelo: (t) => {
      if (ROTAS[t] === 'gemini') return (gemini ?? claude)!;
      return ((QUESTOES.has(t) ? claude : claudeMateriais) ?? gemini)!;
    },
    imagem,
    concorrencia: 3,
  };
}
