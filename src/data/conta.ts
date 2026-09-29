// Conta com e-mail e senha (opcional). Todo mundo começa com login anônimo; criar conta liga o e-mail ao mesmo
// usuário (linkWithCredential), então nada do que já foi feito se perde. Entrar numa conta que já existe troca
// de usuário: se ela tem progresso na nuvem, ele manda; se está vazia, herda o que está no aparelho.
import {
  EmailAuthProvider,
  linkWithCredential,
  onIdTokenChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { useSyncExternalStore } from 'react';
import { firebase, firebaseLigado } from '@/lib/firebase';
import { apagarConteudos, subirConteudos } from './conteudo';
import { apagarConta, iniciarNuvem, pararSincronia } from './nuvem';
import { limpar } from './rascunho';
import { app } from './store';
import { evento } from '@/lib/metricas';

export type Conta = { uid: string; anonimo: boolean; email: string | null; verificado: boolean; nome: string | null };

let conta: Conta | null = null;
let ouvindo = false;
const listeners = new Set<() => void>();
const set = (c: Conta | null) => {
  conta = c;
  listeners.forEach((l) => l());
};
const deUsuario = (u: User | null): Conta | null =>
  u ? { uid: u.uid, anonimo: u.isAnonymous, email: u.email, verificado: u.emailVerified, nome: u.displayName } : null;

function ouvir() {
  const s = firebase();
  if (ouvindo || !s) return;
  ouvindo = true;
  set(deUsuario(s.auth.currentUser));
  // onIdTokenChanged também avisa quando o anônimo vira conta (link) e quando o e-mail é verificado (reload).
  onIdTokenChanged(s.auth, (u) => set(deUsuario(u)));
}

/** A conta de agora (null enquanto o Firebase não respondeu, ou no modo demonstração). */
export function useConta() {
  ouvir();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => conta,
    () => conta,
  );
}

export const contasDisponiveis = firebaseLigado;

export class ErroConta extends Error {
  constructor(
    message: string,
    public campo: 'email' | 'senha' | 'nova' | 'nome' | null = null,
  ) {
    super(message);
  }
}

/** Erros do Firebase Auth em português (e em qual campo mostrar). */
export function traduzir(e: unknown): ErroConta {
  if (e instanceof ErroConta) return e;
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return new ErroConta('Esse e-mail não parece certo.', 'email');
    case 'auth/missing-email':
      return new ErroConta('Escreve seu e-mail.', 'email');
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return new ErroConta('Esse e-mail já tem conta. Toca em "Entrar".', 'email');
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return new ErroConta('E-mail ou senha não batem.', 'senha');
    case 'auth/missing-password':
      return new ErroConta('Escreve a senha.', 'senha');
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return new ErroConta('Senha fraca: usa pelo menos 8 caracteres, com letras e números.', 'senha');
    case 'auth/too-many-requests':
      return new ErroConta('Muitas tentativas. Espera uns minutos e tenta de novo.');
    case 'auth/network-request-failed':
      return new ErroConta('Sem internet agora. Confere a conexão.');
    case 'auth/requires-recent-login':
      return new ErroConta('Por segurança, entra de novo e tenta outra vez.', 'senha');
    case 'auth/user-disabled':
      return new ErroConta('Essa conta foi desativada. Fala com a gente em Ajuda.');
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return new ErroConta('Login por e-mail ainda não foi ligado no Firebase (Authentication → Método de login → E-mail/senha).');
    default:
      return new ErroConta('Algo deu errado. Tenta de novo daqui a pouco.');
  }
}

function servicos() {
  const s = firebase();
  if (!s) throw new ErroConta('Contas precisam do Firebase ligado (veja docs/COMO-LIGAR.md).');
  return s;
}

const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

/** 0 (vazia) a 4 (forte). */
export function forcaDaSenha(s: string) {
  if (!s) return 0;
  let f = s.length >= 8 ? 1 : 0;
  if (s.length >= 12) f++;
  if (/[a-z]/i.test(s) && /\d/.test(s)) f++;
  if (/[^a-z0-9]/i.test(s) || (/[a-z]/.test(s) && /[A-Z]/.test(s))) f++;
  return Math.max(1, f);
}

export function validarSenha(senha: string) {
  if (senha.length < 8) throw new ErroConta('A senha precisa de pelo menos 8 caracteres.', 'senha');
  if (!/[a-z]/i.test(senha) || !/\d/.test(senha)) throw new ErroConta('Mistura letras e números na senha.', 'senha');
}

/** Cria a conta ligando e-mail e senha ao usuário de agora: o progresso continua o mesmo. */
export async function criarConta(nome: string, email: string, senha: string) {
  const s = servicos();
  if (!nome.trim()) throw new ErroConta('Como a gente te chama?', 'nome');
  if (!emailValido(email)) throw new ErroConta('Esse e-mail não parece certo.', 'email');
  validarSenha(senha);
  try {
    const user = s.auth.currentUser ?? (await signInAnonymously(s.auth)).user;
    if (!user.isAnonymous) throw new ErroConta('Você já está numa conta. Sai dela antes de criar outra.');
    const { user: ligado } = await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), senha));
    await updateProfile(ligado, { displayName: nome.trim() });
    app.setNome(nome.trim());
    evento('conta_criada');
    sendEmailVerification(ligado).catch(() => {});
    await ligado.reload();
    set(deUsuario(s.auth.currentUser));
  } catch (e) {
    throw traduzir(e);
  }
}

/** O aparelho tem progresso sem conta (vai ser trocado ao entrar numa conta com dados)? */
export const temProgressoSemConta = () => !!conta?.anonimo && (app.get().provas.length > 0 || app.get().xp > 0);

export async function entrarComEmail(email: string, senha: string) {
  const s = servicos();
  if (!emailValido(email)) throw new ErroConta('Esse e-mail não parece certo.', 'email');
  if (!senha) throw new ErroConta('Escreve a senha.', 'senha');
  try {
    await signInWithEmailAndPassword(s.auth, email.trim(), senha);
  } catch (e) {
    throw traduzir(e);
  }
  let origem: 'nuvem' | 'aparelho' | null;
  try {
    origem = await iniciarNuvem({ trocouDeConta: true });
  } catch {
    // Sem saber o que tem na conta, não dá pra decidir quem manda: volta a ser anônimo e pede pra tentar de novo.
    await signOut(s.auth).catch(() => {});
    iniciarNuvem().catch(() => {});
    throw new ErroConta('Não consegui buscar seu progresso agora. Confere a internet e tenta de novo.');
  }
  // A conta trouxe o progresso dela: o conteúdo das provas deste aparelho era do outro usuário.
  if (origem === 'nuvem') await apagarConteudos();
  // A conta estava vazia e herdou o aparelho: leva junto o conteúdo das provas.
  else await subirConteudos(app.get().provas.map((p) => p.id));
  app.setOnboarded();
  evento('login', { method: 'email', trouxe: origem ?? 'nada' });
  set(deUsuario(s.auth.currentUser));
}

/** Link de nova senha. Não diz se o e-mail existe (proteção contra quem tenta descobrir contas). */
export async function esqueciSenha(email: string) {
  const s = servicos();
  if (!emailValido(email)) throw new ErroConta('Esse e-mail não parece certo.', 'email');
  try {
    await sendPasswordResetEmail(s.auth, email.trim());
  } catch (e) {
    const erro = traduzir(e);
    // "Usuário não existe" não é mostrado: a tela diz o mesmo pra qualquer e-mail.
    if ((e as { code?: string })?.code !== 'auth/user-not-found') throw erro;
  }
}

export async function reenviarVerificacao() {
  const u = servicos().auth.currentUser;
  if (!u || u.isAnonymous) return;
  try {
    await sendEmailVerification(u);
  } catch (e) {
    throw traduzir(e);
  }
}

/** Confere de novo se o e-mail já foi verificado (depois de clicar no link). */
export async function atualizarConta() {
  const s = servicos();
  await s.auth.currentUser?.reload().catch(() => {});
  set(deUsuario(s.auth.currentUser));
}

async function reautenticar(senha: string) {
  const u = servicos().auth.currentUser;
  if (!u?.email) throw new ErroConta('Entra de novo pra continuar.');
  try {
    await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, senha));
  } catch (e) {
    throw traduzir(e);
  }
  return u;
}

/** Erros com campo 'nova' são da senha nova; 'senha' é a atual. */
export async function trocarSenha(atual: string, nova: string) {
  if (!atual) throw new ErroConta('Escreve a senha atual.', 'senha');
  try {
    validarSenha(nova);
  } catch (e) {
    throw new ErroConta((e as Error).message, 'nova');
  }
  if (atual === nova) throw new ErroConta('A senha nova tem que ser diferente da atual.', 'nova');
  const u = await reautenticar(atual);
  try {
    await updatePassword(u, nova);
  } catch (e) {
    const x = traduzir(e);
    throw x.campo === 'senha' ? new ErroConta(x.message, 'nova') : x;
  }
}

export async function trocarNome(nome: string) {
  const n = nome.trim();
  if (!n) return;
  app.setNome(n);
  const u = firebase()?.auth.currentUser;
  if (u && !u.isAnonymous) await updateProfile(u, { displayName: n }).catch(() => {});
}

/** Limpa o aparelho e começa de novo com um usuário anônimo novo. */
async function recomecarNoAparelho() {
  pararSincronia();
  await apagarConteudos();
  limpar();
  app.reset();
  const s = firebase();
  if (s && !s.auth.currentUser) await signInAnonymously(s.auth).catch(() => {});
  iniciarNuvem().catch(() => {});
}

/** Sair de uma conta de e-mail: os dados continuam na nuvem, o aparelho volta ao começo. */
export async function sair() {
  const s = servicos();
  pararSincronia();
  await signOut(s.auth);
  await recomecarNoAparelho();
}

/** Exclui tudo: dados na nuvem, conteúdos, turmas e o usuário. Conta de e-mail confirma com a senha. */
export async function excluirConta(senha?: string) {
  // Sem Firebase (demonstração) só tem o que está no aparelho.
  const s = firebase();
  const u = s?.auth.currentUser;
  if (u && !u.isAnonymous) {
    if (!senha) throw new ErroConta('Confirma com a sua senha.', 'senha');
    await reautenticar(senha);
  }
  await apagarConta();
  // apagarConta faz signOut se o deleteUser falhar; garantimos que não sobra sessão.
  if (s?.auth.currentUser) await signOut(s.auth).catch(() => {});
  evento('conta_excluida');
  await recomecarNoAparelho();
}
