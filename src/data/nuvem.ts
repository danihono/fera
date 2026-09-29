// Ponte com o Firestore. O aparelho é a fonte da verdade no dia a dia (funciona offline);
// a nuvem guarda uma cópia pra trocar de celular/reinstalar e é onde ficam turmas e a geração no servidor.
//
// usuarios/{uid}                    estado do app (perfil, provas, XP, sequência)
// usuarios/{uid}/conteudos/{prova}  o que a IA gerou pra cada prova
// usuarios/{uid}/geracoes/{prova}   progresso da geração no servidor (modo qualidade; só as Functions escrevem)
// turmas/{codigo}                   nome da turma
// turmas/{codigo}/membros/{uid}     nome e XP de cada um (ranking)
import { deleteUser, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Progresso, ProvaGerada } from '@/ia/tipos';
import { entrar, firebase, usuarioAtual } from '@/lib/firebase';
import { ouvirAssinatura } from './assinatura';
import { app, lerEstado, nomeDe, type AppState, type TurmaRef } from './store';

const semDatas = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let pararSync: (() => void) | null = null;
let uidSincronizado: string | null = null;

/**
 * Login (anônimo, se não tiver conta) + traz o estado da nuvem + passa a espelhar as mudanças.
 * trocouDeConta: entrou numa conta de e-mail — se ela já tem progresso na nuvem, ele manda;
 * se está vazia, herda o que está no aparelho. Diz de onde veio o estado que ficou.
 */
export async function iniciarNuvem(opts: { trocouDeConta?: boolean } = {}): Promise<'nuvem' | 'aparelho' | null> {
  const s = firebase();
  if (!s) return null;
  const user = await entrar();
  if (!user || (uidSincronizado === user.uid && !opts.trocouDeConta)) return null;
  pararSincronia();
  uidSincronizado = user.uid;
  const ref = doc(s.db, 'usuarios', user.uid);
  let origem: 'nuvem' | 'aparelho' = 'aparelho';
  try {
    const snap = await getDoc(ref);
    const nuvem = snap.exists() ? (snap.data().estado as Partial<AppState> | undefined) : undefined;
    if (nuvem && (opts.trocouDeConta || (nuvem.atualizadoEm ?? 0) > app.get().atualizadoEm)) {
      app.substituir(lerEstado(nuvem));
      origem = 'nuvem';
    }
  } catch (e) {
    // Sem rede: segue com o que tem no aparelho (mas ao trocar de conta não dá pra saber quem manda).
    if (opts.trocouDeConta) {
      uidSincronizado = null;
      throw e;
    }
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  let ultimoMembro = '';
  const enviar = () => {
    const estado = app.get();
    setDoc(ref, { estado: semDatas(estado), atualizadoEm: serverTimestamp() }).catch(() => {});
    // A linha do ranking só muda quando muda XP, nome ou foto.
    const assinatura = `${estado.turma?.codigo}|${estado.xp}|${nomeDe(estado)}|${estado.fotoMini?.length ?? 0}:${estado.fotoMini?.slice(-24) ?? ''}`;
    if (estado.turma && assinatura !== ultimoMembro) {
      ultimoMembro = assinatura;
      setDoc(doc(s.db, 'turmas', estado.turma.codigo, 'membros', user.uid), membro(estado)).catch(() => {});
    }
  };
  enviar();
  const parar = app.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(enviar, 1500);
  });
  const pararAssinatura = ouvirAssinatura(user.uid);
  pararSync = () => {
    parar();
    pararAssinatura();
    if (timer) clearTimeout(timer);
  };
  return origem;
}

/** Para de espelhar (antes de sair ou trocar de conta). */
export function pararSincronia() {
  pararSync?.();
  pararSync = null;
  uidSincronizado = null;
}

const membro = (s: AppState) => ({
  nome: nomeDe(s),
  inicial: nomeDe(s).charAt(0).toUpperCase(),
  xp: s.xp,
  ...(s.fotoMini ? { foto: s.fotoMini } : {}),
  atualizadoEm: serverTimestamp(),
});

export async function salvarConteudoNuvem(provaId: string, prova: ProvaGerada) {
  const s = firebase();
  const user = usuarioAtual();
  if (!s || !user) return;
  await setDoc(doc(s.db, 'usuarios', user.uid, 'conteudos', provaId), semDatas(prova));
}

export async function apagarConteudoNuvem(provaId: string) {
  const s = firebase();
  const user = usuarioAtual();
  if (!s || !user) return;
  await deleteDoc(doc(s.db, 'usuarios', user.uid, 'conteudos', provaId));
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

export type Membro = { uid: string; nome: string; inicial: string; xp: number; foto: string | null };

/** Ranking da turma ao vivo. */
export function ouvirRanking(codigo: string, cb: (m: Membro[]) => void): Unsubscribe {
  const s = firebase();
  if (!s) return () => {};
  return onSnapshot(
    collection(s.db, 'turmas', codigo, 'membros'),
    (snap) =>
      cb(
        snap.docs
          .map((d) => ({ uid: d.id, nome: String(d.data().nome ?? ''), inicial: String(d.data().inicial ?? '?'), xp: Number(d.data().xp ?? 0), foto: (d.data().foto as string) ?? null }))
          .sort((a, b) => b.xp - a.xp),
      ),
    () => {},
  );
}

// ——— Reporte de questão (a IA errou?) ———

export const MOTIVOS_REPORTE = ['A resposta certa tá errada', 'O enunciado tá confuso', 'Isso não era da matéria', 'Outro problema'] as const;

/** Guarda a questão reportada pra conferir e melhorar os prompts. Sem Firebase, não vai pra lugar nenhum. */
export async function reportarQuestao(provaId: string | null, questao: unknown, motivo: (typeof MOTIVOS_REPORTE)[number]) {
  const s = firebase();
  const user = s ? await entrar() : null;
  if (!s || !user) return;
  await addDoc(collection(s.db, 'reportes'), {
    uid: user.uid,
    provaId: provaId ?? '',
    questao: JSON.stringify(questao).slice(0, 6000),
    motivo,
    criadoEm: serverTimestamp(),
  });
}

// ——— Provas da turma: gera uma vez, a sala toda estuda (sem gastar outra geração) ———

export type ProvaDaTurma = {
  id: string;
  autor: string;
  autorNome: string;
  materia: string;
  icone: string;
  topico: string;
  /** AAAA-MM-DD */
  data: string;
  conteudo: ProvaGerada;
};

/** Publica a prova (e o que a IA gerou) na turma. Só quem é da turma publica; só o autor apaga. */
export async function compartilharProva(codigo: string, p: { id: string; materia: string; icone: string; topico: string; data: Date }, conteudo: ProvaGerada) {
  const s = firebase();
  const user = s ? await entrar() : null;
  if (!s || !user) throw new Error('sem nuvem');
  await setDoc(doc(s.db, 'turmas', codigo, 'provas', p.id), {
    autor: user.uid,
    autorNome: nomeDe(app.get()),
    materia: p.materia,
    icone: p.icone,
    topico: p.topico,
    data: p.data.toISOString().slice(0, 10),
    conteudo: semDatas(conteudo),
    criadaEm: serverTimestamp(),
  });
}

/** Provas compartilhadas na turma, ao vivo (as mais novas primeiro). */
export function ouvirProvasDaTurma(codigo: string, cb: (p: ProvaDaTurma[]) => void): Unsubscribe {
  const s = firebase();
  if (!s) return () => {};
  return onSnapshot(
    collection(s.db, 'turmas', codigo, 'provas'),
    (snap) =>
      cb(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ProvaDaTurma, 'id'>) }))
          .sort((a, b) => b.data.localeCompare(a.data)),
      ),
    () => {},
  );
}

export async function tirarProvaDaTurma(codigo: string, provaId: string) {
  const s = firebase();
  if (!s) return;
  await deleteDoc(doc(s.db, 'turmas', codigo, 'provas', provaId));
}

/** Apaga os dados da pessoa na nuvem e o usuário (conta de e-mail precisa ter reautenticado antes). */
export async function apagarConta() {
  const s = firebase();
  const user = usuarioAtual();
  pararSincronia();
  if (!s || !user) return;
  const estado = app.get();
  try {
    // No servidor (se as Functions estiverem no ar) sai também o que o app não pode apagar: gerações e imagens.
    await httpsCallable(s.functions, 'apagarMeusDados', { timeout: 20000 })().catch(() => {});
    const conteudos = await getDocs(collection(s.db, 'usuarios', user.uid, 'conteudos'));
    await Promise.all(conteudos.docs.map((d) => deleteDoc(d.ref)));
    await Promise.all(estado.turmas.map((t) => deleteDoc(doc(s.db, 'turmas', t.codigo, 'membros', user.uid)).catch(() => {})));
    // Provas que a pessoa compartilhou nas turmas saem junto.
    await Promise.all(
      estado.turmas.map(async (t) => {
        const minhas = await getDocs(query(collection(s.db, 'turmas', t.codigo, 'provas'), where('autor', '==', user.uid))).catch(() => null);
        await Promise.all(minhas?.docs.map((d) => deleteDoc(d.ref).catch(() => {})) ?? []);
      }),
    );
    await deleteDoc(doc(s.db, 'usuarios', user.uid));
    await deleteUser(user);
  } catch {
    await signOut(s.auth).catch(() => {});
  }
}
