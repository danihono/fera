// Conteúdo gerado de cada prova (plano, materiais, missões): memória → aparelho → Firestore.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import type { ProvaGerada } from '@/ia/tipos';
import { lerConteudoNuvem, salvarConteudoNuvem } from './nuvem';

const chave = (id: string) => `fera:conteudo:${id}`;
const cache = new Map<string, ProvaGerada | null>();
const carregando = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export async function salvarConteudo(id: string, prova: ProvaGerada, opts: { nuvem?: boolean } = {}) {
  cache.set(id, prova);
  emit();
  await AsyncStorage.setItem(chave(id), JSON.stringify(prova)).catch(() => {});
  if (opts.nuvem !== false) await salvarConteudoNuvem(id, prova).catch(() => {});
}

export async function carregarConteudo(id: string): Promise<ProvaGerada | null> {
  if (cache.get(id)) return cache.get(id)!;
  try {
    const raw = await AsyncStorage.getItem(chave(id));
    if (raw) {
      const p = JSON.parse(raw) as ProvaGerada;
      cache.set(id, p);
      emit();
      return p;
    }
  } catch {
    // segue pra nuvem
  }
  const daNuvem = await lerConteudoNuvem(id).catch(() => null);
  cache.set(id, daNuvem);
  if (daNuvem) AsyncStorage.setItem(chave(id), JSON.stringify(daNuvem)).catch(() => {});
  emit();
  return daNuvem;
}

export const conteudoEmMemoria = (id: string | null) => (id ? (cache.get(id) ?? null) : null);

export async function apagarConteudos() {
  const ids = [...cache.keys()];
  cache.clear();
  emit();
  await AsyncStorage.multiRemove(ids.map(chave)).catch(() => {});
}

/** Conteúdo da prova (carrega do aparelho ou da nuvem na primeira vez). */
export function useConteudo(id: string | null) {
  const conteudo = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => (id ? cache.get(id) : null),
    () => (id ? cache.get(id) : null),
  );
  useEffect(() => {
    if (!id || cache.has(id) || carregando.has(id)) return;
    carregando.add(id);
    carregarConteudo(id).finally(() => carregando.delete(id));
  }, [id]);
  return { conteudo: conteudo ?? null, carregando: !!id && conteudo === undefined };
}
