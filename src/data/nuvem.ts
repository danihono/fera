// Ponte com o Firestore. O aparelho é a fonte da verdade no dia a dia (funciona offline);
// a nuvem guarda uma cópia pra trocar de celular/reinstalar e é onde ficam turmas e a geração no servidor.
//
// usuarios/{uid}                    estado do app (perfil, provas, XP, sequência)
// usuarios/{uid}/conteudos/{prova}  o que a IA gerou pra cada prova
// usuarios/{uid}/geracoes/{prova}   progresso da geração no servidor (modo qualidade; só as Functions escrevem)
// turmas/{codigo}                   nome da turma
// turmas/{codigo}/membros/{uid}     nome e XP de cada um (ranking)
import { deleteUser, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';
import type { Progresso, ProvaGerada } from '@/ia/tipos';
import { entrar, firebase, usuarioAtual } from '@/lib/firebase';
import { app, lerEstado, nomeDe, type AppState, type TurmaRef } from './store';

const semDatas = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let pararSync: (() => void) | null = null;

/** Login anônimo + traz o estado da nuvem se for mais novo + passa a espelhar as mudanças. */
export async function iniciarNuvem() {
  const s = firebase();
  if (!s || pararSync) return;
  const user = await entrar();
  if (!user) return;
  const ref = doc(s.db, 'usuarios', user.uid);
  try {
    const snap = await getDoc(ref);
    const nuvem = snap.exists() ? (snap.data().estado as Partial<AppState> | undefined) : undefined;
    if (nuvem && (nuvem.atualizadoEm ?? 0) > app.get().atualizadoEm) app.substituir(lerEstado(nuvem));
  } catch {
    // Sem rede: segue com o que tem no aparelho.
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  let ultimoXp = -1;
  const enviar = () => {
    const estado = app.get();
    setDoc(ref, { estado: semDatas(estado), atualizadoEm: serverTimestamp() }).catch(() => {});
    if (estado.turma && estado.xp !== ultimoXp) {
      ultimoXp = estado.xp;
      setDoc(doc(s.db, 'turmas', estado.turma.codigo, 'membros', user.uid), membro(estado)).catch(() => {});
    }
  };
  enviar();
  pararSync = app.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(enviar, 1500);
  });
}

const membro = (s: AppState) => ({ nome: nomeDe(s), inicial: nomeDe(s).charAt(0).toUpperCase(), xp: s.xp, atualizadoEm: serverTimestamp() });

export async function salvarConteudoNuvem(provaId: string, prova: ProvaGerada) {
  const s = firebase();
  const user = usuarioAtual();
  if (!s || !user) return;
  await setDoc(doc(s.db, 'usuarios', user.uid, 'conteudos', provaId), semDatas(prova));
}

export async function lerConteudoNuvem(provaId: string): Promise<ProvaGerada | null> {
  const s = firebase();
  const user = s ? await entrar() : null;
  if (!s || !user) return null;
  const snap = await getDoc(doc(s.db, 'usuarios', user.uid, 'conteudos', provaId));
  return snap.exists() ? (snap.data() as ProvaGerada) : null;
}

export type Geracao = { status: 'gerando' | 'pronta' | 'erro'; progresso?: Progresso; erro?: { codigo: string; mensagem: string } };

/** Acompanha a geração que roda nas Cloud Functions. */
export function ouvirGeracao(provaId: string, cb: (g: Geracao) => void): Unsubscribe {
  const s = firebase();
  const user = usuarioAtual();
  if (!s || !user) return () => {};
  return onSnapshot(
    doc(s.db, 'usuarios', user.uid, 'geracoes', provaId),
    (snap) => snap.exists() && cb(snap.data() as Geracao),
    () => {},
  );
}

// ——— Turmas ———

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const novoCodigo = () => `FERA-${Array.from({ length: 3 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('')}`;

/** Cria uma turma com código novo e entra nela. */
export async function criarTurma(nome: string): Promise<TurmaRef> {
  const s = firebase();
  const user = s ? await entrar() : null;
  if (!s || !user) throw new Error('sem nuvem');
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = novoCodigo();
    const ref = doc(s.db, 'turmas', codigo);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, { nome, criadaPor: user.uid, criadaEm: serverTimestamp() });
    await setDoc(doc(ref, 'membros', user.uid), membro(app.get()));
    return { codigo, nome };
  }
  throw new Error('não achei código livre');
}

/** Entra numa turma pelo código. null se o código não existe. */
export async function entrarNaTurmaNuvem(codigo: string): Promise<TurmaRef | null> {
  const s = firebase();
  const user = s ? await entrar() : null;
  if (!s || !user) return null;
  const ref = doc(s.db, 'turmas', codigo);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  await setDoc(doc(ref, 'membros', user.uid), membro(app.get()));
  return { codigo, nome: String(snap.data().nome ?? codigo) };
}

export type Membro = { uid: string; nome: string; inicial: string; xp: number };

/** Ranking da turma ao vivo. */
export function ouvirRanking(codigo: string, cb: (m: Membro[]) => void): Unsubscribe {
  const s = firebase();
  if (!s) return () => {};
  return onSnapshot(
    collection(s.db, 'turmas', codigo, 'membros'),
    (snap) => cb(snap.docs.map((d) => ({ uid: d.id, nome: String(d.data().nome ?? ''), inicial: String(d.data().inicial ?? '?'), xp: Number(d.data().xp ?? 0) })).sort((a, b) => b.xp - a.xp)),
    () => {},
  );
}

/** Sair da conta: apaga os dados na nuvem e o usuário anônimo. */
export async function apagarConta() {
  const s = firebase();
  const user = usuarioAtual();
  pararSync?.();
  pararSync = null;
  if (!s || !user) return;
  const estado = app.get();
  try {
    const conteudos = await getDocs(collection(s.db, 'usuarios', user.uid, 'conteudos'));
    await Promise.all(conteudos.docs.map((d) => deleteDoc(d.ref)));
    await Promise.all(estado.turmas.map((t) => deleteDoc(doc(s.db, 'turmas', t.codigo, 'membros', user.uid)).catch(() => {})));
    await deleteDoc(doc(s.db, 'usuarios', user.uid));
    await deleteUser(user);
  } catch {
    await signOut(s.auth).catch(() => {});
  }
}
