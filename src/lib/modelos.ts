// Nome amigável de cada modelo (aparece na etiqueta "GERADO PELA IA · …").
export function nomeDoModelo(id: string) {
  if (id === 'exemplo') return 'Exemplo';
  if (id.startsWith('claude')) return 'Claude';
  if (id.startsWith('gemini')) return 'Gemini';
  if (id.startsWith('gpt')) return 'GPT';
  return id;
}
