// Fera+. Com as Cloud Functions no ar (EXPO_PUBLIC_IA_QUALIDADE=1), quem manda é o servidor: assinaturas/{uid},
// que o app só lê (quem escreve é a compra de teste ou, nas lojas, o webhook do RevenueCat). Assim ninguém vira
// Fera+ mexendo no próprio aparelho e gasta a conta das IAs. Sem Functions (prévia), a compra é simulada no aparelho.
import { doc, getDoc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { entrar, firebase } from '@/lib/firebase';
import { app } from './store';

export type Plano = 'mensal' | 'anual';

const FUNCTIONS_NO_AR = process.env.EXPO_PUBLIC_IA_QUALIDADE === '1';
/** O Fera+ vem do servidor (e não do aparelho)? */
export const assinaturaNoServidor = () => FUNCTIONS_NO_AR && !!firebase();

export class ErroCompra extends Error {}

const ativa = (snap: DocumentSnapshot) => {
  if (!snap.exists() || snap.get('ativo') !== true) return false;
  const expira = snap.get('expiraEm') as { toMillis(): number } | undefined;
  return !expira || expira.toMillis() > Date.now();
};

const aplicar = (premium: boolean) => {
  if (app.get().premium !== premium) app.setPremium(premium);
};

/** Acompanha a assinatura do usuário (chamado pela sincronia da nuvem a cada login). */
export function ouvirAssinatura(uid: string): () => void {
  const s = firebase();
  if (!s || !assinaturaNoServidor()) return () => {};
  return onSnapshot(
    doc(s.db, 'assinaturas', uid),
    (snap) => aplicar(ativa(snap)),
    () => {},
  );
}

function mensagemDe(e: unknown, padrao: string) {
  const f = e as { details?: { mensagem?: string }; message?: string };
  if (f?.details?.mensagem) return f.details.mensagem;
  if (/network|offline|failed to fetch|unavailable/i.test(f?.message ?? '')) return 'Sem internet agora. Confere a conexão e tenta de novo.';
  return padrao;
}

async function chamar(nome: string, dados: object, padrao: string) {
  const s = firebase()!;
  await entrar();
  try {
    await httpsCallable(s.functions, nome, { timeout: 30_000 })(dados);
  } catch (e) {
    throw new ErroCompra(mensagemDe(e, padrao));
  }
}

export async function assinar(plano: Plano) {
  if (assinaturaNoServidor()) await chamar('assinarTeste', { plano }, 'Não deu pra assinar agora. Tenta de novo daqui a pouco.');
  // O servidor confirma pelo onSnapshot; já mostra na hora.
  aplicar(true);
}

export async function cancelarAssinatura() {
  if (assinaturaNoServidor()) await chamar('cancelarAssinaturaTeste', {}, 'Não deu pra cancelar agora. Tenta de novo daqui a pouco.');
  aplicar(false);
}

/** "Restaurar compra": confere no servidor. true se tem Fera+. */
export async function restaurarCompra(): Promise<boolean> {
  const s = firebase();
  if (!s || !assinaturaNoServidor()) return app.get().premium;
  const user = await entrar();
  if (!user) return false;
  try {
    const ok = ativa(await getDoc(doc(s.db, 'assinaturas', user.uid)));
    aplicar(ok);
    return ok;
  } catch (e) {
    throw new ErroCompra(mensagemDe(e, 'Não deu pra conferir agora. Tenta de novo daqui a pouco.'));
  }
}
