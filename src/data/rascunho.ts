// O conteúdo que o aluno está mandando pra próxima prova: fotos, PDFs, documentos, slides, planilhas, páginas web,
// áudio/vídeo, zip… e texto digitado. Fica só na memória: é grande demais pra salvar e só serve até a IA ler
// (depois o que vale é a transcrição do plano). A leitura de cada tipo está em src/lib/arquivos.ts.
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import type { Anexo } from '@/ia/tipos';
import { lerArquivo, paraBase64, type ArquivoLido, type Categoria, type Ignorado } from '@/lib/arquivos';

type Base = { id: string; nome: string; bytes: number; origem?: string };
export type Item =
  | (Base & { tipo: 'foto'; uri: string; base64: string; mime: string })
  | (Base & { tipo: 'pdf'; base64: string })
  | (Base & { tipo: 'midia'; base64: string; mime: string; categoria: 'audio' | 'video' })
  | (Base & { tipo: 'texto'; texto: string; categoria: Categoria; digitado: boolean });

/** Os provedores aceitam ~20 MB por pedido (em base64); deixamos folga pro texto do prompt. */
export const LIMITE_BYTES = 14 * 1024 * 1024;
export const LIMITE_FOTOS = 30;
const LADO_MAX = 1600;

type Estado = { itens: Item[]; lendo: string | null; ignorados: Ignorado[] };
let estado: Estado = { itens: [], lendo: null, ignorados: [] };
const listeners = new Set<() => void>();
const set = (patch: Partial<Estado>) => {
  estado = { ...estado, ...patch };
  listeners.forEach((l) => l());
};
const novoId = () => Math.random().toString(36).slice(2, 10);
/** Tamanho real dos bytes de um base64. */
const bytesDe = (b64: string) => Math.floor((b64.length * 3) / 4);

export const totalBytes = (lista = estado.itens) => lista.reduce((n, i) => n + i.bytes, 0);
export const mb = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`);

export class ErroCaptura extends Error {}

/** Foto reduzida (lado maior 1600px, JPEG 70%): lê bem e fica leve pra mandar. */
async function reduzirFoto(uri: string, largura: number, altura: number) {
  const ctx = ImageManipulator.manipulate(uri);
  if (Math.max(largura, altura) > LADO_MAX) ctx.resize(largura >= altura ? { width: LADO_MAX } : { height: LADO_MAX });
  const img = await ctx.renderAsync();
  const salvo = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!salvo.base64) throw new ErroCaptura('Não consegui ler essa foto.');
  return { uri: salvo.uri, base64: salvo.base64 };
}

async function fotoDoPicker(asset: ImagePicker.ImagePickerAsset, i: number): Promise<Item> {
  const f = await reduzirFoto(asset.uri, asset.width, asset.height);
  return { id: novoId(), tipo: 'foto', ...f, mime: 'image/jpeg', nome: asset.fileName ?? `foto-${i + 1}.jpg`, bytes: bytesDe(f.base64) };
}

/** Imagem que veio de arquivo (ou de dentro de um zip): reduz; se o navegador não abrir (HEIC), vai como está. */
async function fotoDeArquivo(a: Extract<ArquivoLido, { tipo: 'imagem' }>): Promise<Item> {
  const b64 = paraBase64(a.bytes);
  const dataUri = `data:${a.mime};base64,${b64}`;
  try {
    const ref = await ImageManipulator.manipulate(dataUri).renderAsync();
    const f = await reduzirFoto(dataUri, ref.width, ref.height);
    return { id: novoId(), tipo: 'foto', ...f, mime: 'image/jpeg', nome: a.nome, bytes: bytesDe(f.base64), origem: a.origem };
  } catch {
    return { id: novoId(), tipo: 'foto', uri: dataUri, base64: b64, mime: a.mime, nome: a.nome, bytes: a.bytes.length, origem: a.origem };
  }
}

async function paraItem(a: ArquivoLido): Promise<Item> {
  switch (a.tipo) {
    case 'imagem':
      return fotoDeArquivo(a);
    case 'pdf':
      return { id: novoId(), tipo: 'pdf', nome: a.nome, base64: paraBase64(a.bytes), bytes: a.bytes.length, origem: a.origem };
    case 'midia':
      return { id: novoId(), tipo: 'midia', nome: a.nome, mime: a.mime, categoria: a.categoria, base64: paraBase64(a.bytes), bytes: a.bytes.length, origem: a.origem };
    case 'texto':
      return { id: novoId(), tipo: 'texto', nome: a.nome, texto: a.texto, categoria: a.categoria, bytes: a.texto.length, origem: a.origem, digitado: false };
  }
}

/** Junta ao rascunho respeitando os limites; o que não couber vira aviso em vez de derrubar tudo. */
function adicionar(novos: Item[], ignorados: Ignorado[] = []) {
  const aceitos: Item[] = [];
  let fotos = estado.itens.filter((i) => i.tipo === 'foto').length;
  let total = totalBytes();
  for (const n of novos) {
    if (n.tipo === 'foto' && fotos >= LIMITE_FOTOS) {
      ignorados.push({ nome: n.nome, motivo: `passou de ${LIMITE_FOTOS} fotos` });
      continue;
    }
    if (total + n.bytes > LIMITE_BYTES) {
      ignorados.push({ nome: n.nome, motivo: n.bytes > LIMITE_BYTES ? `grande demais (${mb(n.bytes)})` : 'não coube: o limite é 14 MB por prova' });
      continue;
    }
    if (n.tipo === 'foto') fotos++;
    total += n.bytes;
    aceitos.push(n);
  }
  set({ itens: [...estado.itens, ...aceitos], ignorados: [...estado.ignorados, ...ignorados] });
  if (!aceitos.length && ignorados.length) throw new ErroCaptura(ignorados.length === 1 ? `${ignorados[0].nome}: ${ignorados[0].motivo}.` : 'Nenhum arquivo deu pra usar. Veja os avisos na lista.');
}

export type Entrada = { nome: string; mime?: string; bytes: () => Promise<Uint8Array> };

/** Lê vários arquivos (do seletor ou arrastados na web), abrindo zips e extraindo texto dos documentos. */
export async function adicionarArquivos(entradas: Entrada[]) {
  if (!entradas.length) return;
  const itens: Item[] = [];
  const ignorados: Ignorado[] = [];
  try {
    for (const [i, e] of entradas.entries()) {
      set({ lendo: entradas.length > 1 ? `Lendo ${e.nome} (${i + 1} de ${entradas.length})…` : `Lendo ${e.nome}…` });
      // Deixa a tela desenhar o aviso antes de um arquivo grande travar o JS por um instante.
      await new Promise((r) => setTimeout(r, 16));
      let bytes: Uint8Array;
      try {
        bytes = await e.bytes();
      } catch {
        ignorados.push({ nome: e.nome, motivo: 'não consegui abrir' });
        continue;
      }
      const lido = lerArquivo(e.nome, bytes, e.mime ?? '');
      ignorados.push(...lido.ignorados);
      for (const a of lido.arquivos) itens.push(await paraItem(a));
    }
  } finally {
    set({ lendo: null });
  }
  adicionar(itens, ignorados);
}

/** Câmera. false se a pessoa cancelou. */
export async function tirarFoto(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new ErroCaptura('Libera a câmera nos ajustes do celular pra tirar foto do caderno.');
  }
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (r.canceled) return false;
  set({ lendo: 'Preparando a foto…' });
  try {
    adicionar(await Promise.all(r.assets.map(fotoDoPicker)));
  } finally {
    set({ lendo: null });
  }
  return true;
}

/** Galeria (várias de uma vez). */
export async function escolherFotos(): Promise<boolean> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: LIMITE_FOTOS, quality: 1 });
  if (r.canceled) return false;
  set({ lendo: r.assets.length > 1 ? `Preparando ${r.assets.length} fotos…` : 'Preparando a foto…' });
  try {
    adicionar(await Promise.all(r.assets.map(fotoDoPicker)));
  } finally {
    set({ lendo: null });
  }
  return true;
}

/** Qualquer arquivo, vários de uma vez: PDF, Word, slides, planilha, HTML, áudio, vídeo, zip… */
export async function escolherArquivos(): Promise<boolean> {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: true, copyToCacheDirectory: true, base64: false });
  if (r.canceled) return false;
  await adicionarArquivos(
    r.assets.map((a) => ({
      nome: a.name,
      mime: a.mimeType,
      // Na web vem o File do navegador; no celular, lemos do cache.
      bytes: async () => (a.file ? new Uint8Array(await a.file.arrayBuffer()) : Platform.OS === 'web' ? new Uint8Array(await (await fetch(a.uri)).arrayBuffer()) : new File(a.uri).bytes()),
    })),
  );
  return true;
}

export function adicionarTexto(texto: string) {
  const t = texto.trim();
  if (!t) return;
  adicionar([{ id: novoId(), tipo: 'texto', nome: 'Texto', texto: t, categoria: 'texto', bytes: t.length, digitado: true }]);
}

/** Troca o texto de um item (digitado ou extraído). Vazio = tira. */
export function editarTexto(id: string, texto: string) {
  const t = texto.trim();
  if (!t) return remover(id);
  set({ itens: estado.itens.map((i) => (i.id === id && i.tipo === 'texto' ? { ...i, texto: t, bytes: t.length } : i)) });
}

export const remover = (id: string) => set({ itens: estado.itens.filter((i) => i.id !== id) });
export const esquecerAvisos = () => set({ ignorados: [] });
export const limpar = () => set({ itens: [], ignorados: [], lendo: null });
export const itensDoRascunho = () => estado.itens;

export const anexosDoRascunho = (): Anexo[] =>
  estado.itens.map((i): Anexo => {
    const nome = i.origem ? `${i.nome} (de ${i.origem})` : i.nome;
    switch (i.tipo) {
      case 'foto':
        return { tipo: 'foto', mime: i.mime, base64: i.base64, nome };
      case 'pdf':
        return { tipo: 'pdf', mime: 'application/pdf', base64: i.base64, nome };
      case 'midia':
        return { tipo: 'midia', mime: i.mime, base64: i.base64, nome };
      case 'texto':
        return i.digitado ? { tipo: 'texto', texto: i.texto } : { tipo: 'texto', texto: i.texto, nome };
    }
  });

export function useRascunho() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => estado,
    () => estado,
  );
}
