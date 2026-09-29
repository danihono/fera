// Cloud Functions do Fera: geração no modo qualidade (Fera+). Mesma linha de montagem do app (src/ia),
// com cada tarefa no melhor modelo (src/ia/rotas.ts). O progresso vai pro Firestore e o app acompanha ao vivo.
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { ErroGeracao, gerarProva as linhaDeMontagem } from '../../src/ia/pipeline';
import type { Anexo, FormatoId, PedidoGeracao, Progresso, ProvaGerada } from '../../src/ia/tipos';
import { criarMotor, type Chaves } from './motor';

initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

/** Gerações por pessoa por dia (proteção de custo). */
const LIMITE_DIA = Number(process.env.FERA_LIMITE_DIA || 10);
const FORMATOS: FormatoId[] = ['resumo', 'explicacao', 'mapa', 'quiz', 'slides', 'grafico', 'fluxo', 'imagens', 'teste', 'simulado'];
const MAX_ANEXOS_BYTES = 24 * 1024 * 1024;

const opcoes = {
  secrets: [ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY],
  timeoutSeconds: 540,
  memory: '1GiB' as const,
  cors: true,
};

/** Chave vazia ou "-" (secret criado só pra não travar o deploy) conta como ausente. */
const chave = (v: string) => (v && v.trim() !== '-' ? v.trim() : undefined);
const chaves = (): Chaves => ({ anthropic: chave(ANTHROPIC_API_KEY.value()), gemini: chave(GEMINI_API_KEY.value()), openai: chave(OPENAI_API_KEY.value()) });

const semUndefined = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function exigirUsuario(req: CallableRequest): string {
  if (!req.auth?.uid) throw new HttpsError('unauthenticated', 'Entre no app de novo.');
  return req.auth.uid;
}

const idValido = (id: unknown): id is string => typeof id === 'string' && /^[a-z0-9]{6,40}$/.test(id);

function lerPedido(v: unknown): PedidoGeracao {
  const p = (v ?? {}) as Partial<PedidoGeracao>;
  const anexos = Array.isArray(p.anexos) ? p.anexos : [];
  const ok =
    typeof p.materia === 'string' &&
    typeof p.serie === 'string' &&
    Number.isFinite(p.diasAte) &&
    Number.isFinite(p.minutosDia) &&
    Array.isArray(p.formatos) &&
    p.formatos.every((f) => FORMATOS.includes(f)) &&
    anexos.length <= 300 &&
    anexos.every(
      (a: Anexo) =>
        (a.tipo === 'texto' && typeof a.texto === 'string') ||
        (a.tipo === 'foto' && typeof a.base64 === 'string' && /^image\/(jpeg|png|webp|gif|heic|heif)$/.test(a.mime)) ||
        (a.tipo === 'pdf' && typeof a.base64 === 'string' && a.mime === 'application/pdf') ||
        (a.tipo === 'midia' && typeof a.base64 === 'string' && /^(audio|video)\/[\w.+-]+$/.test(a.mime)),
    );
  if (!ok) throw new HttpsError('invalid-argument', 'Pedido inválido.');
  const bytes = anexos.reduce((n, a) => n + (a.tipo === 'texto' ? a.texto.length : a.base64.length), 0);
  if (bytes > MAX_ANEXOS_BYTES) throw new HttpsError('invalid-argument', 'O conteúdo ficou pesado demais.');
  return {
    materia: p.materia!.slice(0, 40),
    topico: String(p.topico ?? '').slice(0, 60),
    serie: p.serie!.slice(0, 30),
    diasAte: Math.max(1, Math.min(365, Math.round(p.diasAte!))),
    minutosDia: Math.max(5, Math.min(60, Math.round(p.minutosDia!))),
    formatos: p.formatos!,
    anexos,
  };
}

/** Só quem tem Fera+ usa o modo qualidade, com limite por dia. */
async function exigirFeraMais(uid: string) {
  const u = await db.doc(`usuarios/${uid}`).get();
  // A compra ainda é simulada no app; com pagamento de verdade, o premium passa a vir do servidor (custom claim).
  if (u.get('estado.premium') !== true) throw new HttpsError('permission-denied', 'O modo qualidade é do Fera+.', { codigo: 'premium', mensagem: 'O modo qualidade é do Fera+.' });
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);
  const hoje = await db.collection(`usuarios/${uid}/geracoes`).where('criadaEm', '>=', Timestamp.fromDate(inicioDoDia)).count().get();
  if (hoje.data().count >= LIMITE_DIA)
    throw new HttpsError('resource-exhausted', 'Limite do dia.', { codigo: 'limite', mensagem: `Você já gerou ${LIMITE_DIA} provas hoje. Amanhã tem mais!` });
}

/** Grava o progresso no Firestore no máximo a cada 800 ms (a última atualização sempre vai). */
function gravadorDeProgresso(ref: FirebaseFirestore.DocumentReference) {
  let ultimo = 0;
  let pendente: Progresso | null = null;
  let timer: NodeJS.Timeout | null = null;
  const gravar = () => {
    if (!pendente) return;
    const p = pendente;
    pendente = null;
    ultimo = Date.now();
    ref.set({ progresso: p }, { merge: true }).catch(() => {});
  };
  return {
    progredir(p: Progresso) {
      pendente = p;
      if (timer) return;
      const espera = Math.max(0, 800 - (Date.now() - ultimo));
      timer = setTimeout(() => {
        timer = null;
        gravar();
      }, espera);
    },
    async fim() {
      if (timer) clearTimeout(timer);
      timer = null;
      gravar();
    },
  };
}

const salvarImagem = (uid: string, provaId: string) => async (png: Buffer, indice: number) => {
  const file = getStorage().bucket().file(`usuarios/${uid}/provas/${provaId}/imagem-${indice + 1}.png`);
  await file.save(png, { contentType: 'image/png', resumable: false });
  return getDownloadURL(file);
};

function erroPraApp(e: unknown): HttpsError {
  if (e instanceof HttpsError) return e;
  if (e instanceof ErroGeracao) return new HttpsError(e.codigo === 'limite' ? 'resource-exhausted' : 'failed-precondition', e.message, { codigo: e.codigo, mensagem: e.message });
  console.error(e);
  return new HttpsError('internal', 'Falhou', { codigo: 'falhou', mensagem: 'Deu ruim na geração. Tenta de novo daqui a pouco.' });
}

/** Prova nova: lê o material, cria materiais e missões, confere o gabarito e ilustra. */
export const gerarProva = onCall(opcoes, async (req) => {
  const uid = exigirUsuario(req);
  const { provaId } = (req.data ?? {}) as { provaId?: unknown };
  if (!idValido(provaId)) throw new HttpsError('invalid-argument', 'Prova inválida.');
  const pedido = lerPedido((req.data as { pedido?: unknown }).pedido);
  await exigirFeraMais(uid);

  const ref = db.doc(`usuarios/${uid}/geracoes/${provaId}`);
  await ref.set({ status: 'gerando', criadaEm: FieldValue.serverTimestamp(), progresso: { etapa: 'lendo', pct: 2, texto: 'Abrindo o caderno…', feitos: [] } });
  const gravador = gravadorDeProgresso(ref);
  try {
    const motor = criarMotor(chaves(), salvarImagem(uid, provaId));
    const prova = await linhaDeMontagem(pedido, motor, gravador.progredir);
    await gravador.fim();
    await db.doc(`usuarios/${uid}/conteudos/${provaId}`).set(semUndefined(prova));
    await ref.set({ status: 'pronta', progresso: { etapa: 'pronto', pct: 100, texto: 'Trilha pronta!', feitos: [] } }, { merge: true });
    return { ok: true };
  } catch (e) {
    await gravador.fim();
    const erro = erroPraApp(e);
    await ref.set({ status: 'erro', erro: erro.details ?? { codigo: 'falhou', mensagem: erro.message } }, { merge: true });
    throw erro;
  }
});

/** Formato a mais numa prova que já existe (usa o plano salvo; não precisa mandar as fotos de novo). */
export const gerarFormato = onCall(opcoes, async (req) => {
  const uid = exigirUsuario(req);
  const { provaId, formato } = (req.data ?? {}) as { provaId?: unknown; formato?: unknown };
  if (!idValido(provaId) || !FORMATOS.includes(formato as FormatoId)) throw new HttpsError('invalid-argument', 'Pedido inválido.');
  await exigirFeraMais(uid);

  const conteudoRef = db.doc(`usuarios/${uid}/conteudos/${provaId}`);
  const snap = await conteudoRef.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Prova não encontrada.');
  const atual = snap.data() as ProvaGerada;
  const usuario = await db.doc(`usuarios/${uid}`).get();
  const provaSalva = ((usuario.get('estado.provas') ?? []) as { id: string; data: string; minutosDia: number }[]).find((p) => p.id === provaId);
  const dias = provaSalva ? Math.round((new Date(provaSalva.data).getTime() - Date.now()) / 86400000) : 3;

  try {
    const motor = criarMotor(chaves(), salvarImagem(uid, provaId));
    const extra = await linhaDeMontagem(
      {
        materia: atual.plano.materia,
        topico: atual.plano.titulo,
        serie: String(usuario.get('estado.serie') ?? '2º ano (EM)'),
        diasAte: Math.max(1, dias),
        minutosDia: provaSalva?.minutosDia ?? 10,
        formatos: [formato as FormatoId],
        anexos: [],
      },
      motor,
      () => {},
      { plano: atual.plano, missoes: false },
    );
    const falhou = extra.avisos.find((a) => a.startsWith('Não deu'));
    if (falhou) throw new ErroGeracao('falhou', falhou);
    const novo: ProvaGerada = {
      ...atual,
      materiais: { ...atual.materiais, ...extra.materiais },
      teste: extra.teste ?? atual.teste,
      simulado: extra.simulado ?? atual.simulado,
      modelos: { ...atual.modelos, ...extra.modelos },
    };
    await conteudoRef.set(semUndefined(novo));
    return { ok: true };
  } catch (e) {
    throw erroPraApp(e);
  }
});

/**
 * Excluir conta: apaga no servidor tudo da pessoa, inclusive o que o app não pode apagar sozinho
 * (progresso das gerações e imagens geradas no Storage). O app chama antes de apagar o usuário.
 */
export const apagarMeusDados = onCall({ cors: true }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Entra pra continuar.');
  await getStorage()
    .bucket()
    .deleteFiles({ prefix: `usuarios/${uid}/` })
    .catch(() => {});
  await db.recursiveDelete(db.doc(`usuarios/${uid}`));
  return { ok: true };
});
