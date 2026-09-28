// O conteúdo que o aluno está mandando pra próxima prova (fotos, PDFs, texto). Fica só na memória:
// é grande demais pra salvar e só serve até a IA ler (depois o que vale é a transcrição do plano).
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import type { Anexo } from '@/ia/tipos';

export type Item =
  | { id: string; tipo: 'foto'; uri: string; base64: string; mime: string; nome: string; bytes: number }
  | { id: string; tipo: 'pdf'; nome: string; base64: string; bytes: number }
  | { id: string; tipo: 'texto'; texto: string; bytes: number };

/** Os provedores aceitam ~20 MB por pedido; deixamos folga pro texto do prompt. */
export const LIMITE_BYTES = 14 * 1024 * 1024;
export const LIMITE_FOTOS = 10;
const LADO_MAX = 1600;

let itens: Item[] = [];
const listeners = new Set<() => void>();
const set = (novos: Item[]) => {
  itens = novos;
  listeners.forEach((l) => l());
};
const novoId = () => Math.random().toString(36).slice(2, 10);
/** Tamanho real dos bytes de um base64. */
const bytesDe = (b64: string) => Math.floor((b64.length * 3) / 4);

export const totalBytes = (lista = itens) => lista.reduce((n, i) => n + i.bytes, 0);

export class ErroCaptura extends Error {}

/** Foto reduzida (lado maior 1600px, JPEG 70%): lê bem e fica leve pra mandar. */
async function prepararFoto(asset: ImagePicker.ImagePickerAsset, i: number): Promise<Item> {
  const maior = Math.max(asset.width, asset.height);
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (maior > LADO_MAX) ctx.resize(asset.width >= asset.height ? { width: LADO_MAX } : { height: LADO_MAX });
  const img = await ctx.renderAsync();
  const salvo = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!salvo.base64) throw new ErroCaptura('Não consegui ler essa foto.');
  return { id: novoId(), tipo: 'foto', uri: salvo.uri, base64: salvo.base64, mime: 'image/jpeg', nome: asset.fileName ?? `foto-${i + 1}.jpg`, bytes: bytesDe(salvo.base64) };
}

function adicionar(novos: Item[]) {
  const fotos = [...itens, ...novos].filter((i) => i.tipo === 'foto').length;
  if (fotos > LIMITE_FOTOS) throw new ErroCaptura(`Dá pra mandar até ${LIMITE_FOTOS} fotos por prova.`);
  if (totalBytes([...itens, ...novos]) > LIMITE_BYTES) throw new ErroCaptura('Ficou pesado demais. Tira alguma foto ou manda um PDF menor.');
  set([...itens, ...novos]);
}

/** Câmera. false se a pessoa cancelou. */
export async function tirarFoto(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new ErroCaptura('Libera a câmera nos ajustes do celular pra tirar foto do caderno.');
  }
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (r.canceled) return false;
  adicionar(await Promise.all(r.assets.map(prepararFoto)));
  return true;
}

/** Galeria (várias de uma vez). */
export async function escolherFotos(): Promise<boolean> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: LIMITE_FOTOS, quality: 1 });
  if (r.canceled) return false;
  adicionar(await Promise.all(r.assets.map(prepararFoto)));
  return true;
}

export async function escolherPdf(): Promise<boolean> {
  const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, base64: true });
  if (r.canceled) return false;
  const novos: Item[] = [];
  for (const a of r.assets) {
    if (a.size && a.size > LIMITE_BYTES) throw new ErroCaptura('Esse PDF é grande demais. Manda só as páginas da matéria da prova.');
    // Na web o arquivo já vem como data URL; no celular lemos do cache.
    const base64 = Platform.OS === 'web' ? a.uri.slice(a.uri.indexOf(',') + 1) : await new File(a.uri).base64();
    novos.push({ id: novoId(), tipo: 'pdf', nome: a.name, base64, bytes: bytesDe(base64) });
  }
  adicionar(novos);
  return true;
}

export function adicionarTexto(texto: string) {
  const t = texto.trim();
  if (!t) return;
  adicionar([{ id: novoId(), tipo: 'texto', texto: t, bytes: t.length }]);
}

export const remover = (id: string) => set(itens.filter((i) => i.id !== id));
export const limpar = () => set([]);
export const itensDoRascunho = () => itens;

export const anexosDoRascunho = (): Anexo[] =>
  itens.map((i) =>
    i.tipo === 'foto'
      ? { tipo: 'foto', mime: i.mime, base64: i.base64, nome: i.nome }
      : i.tipo === 'pdf'
        ? { tipo: 'pdf', mime: 'application/pdf', base64: i.base64, nome: i.nome }
        : { tipo: 'texto', texto: i.texto },
  );

export function useRascunho() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => itens,
    () => itens,
  );
}
