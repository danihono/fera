// Webhook do RevenueCat → assinaturas/{uid}. Código puro (testado em tests/revenuecat.test.ts).
// O app configura o RevenueCat com appUserID = uid do Firebase, então app_user_id aqui é o uid.
// Tipos de evento: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields

export type EventoRC = {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  expiration_at_ms?: number | null;
  period_type?: string;
  store?: string;
};

export type MudancaAssinatura = {
  uid: string;
  dados: { ativo: boolean; plano: 'mensal' | 'anual'; origem: 'loja'; loja: string; produto: string; expiraEm: number | null; cancelada: boolean };
} | null;

/** Liga (compra, renovação, reativação), marca cancelada (continua valendo até vencer) ou desliga (venceu). */
const LIGA = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT'];

/** uid do Firebase no evento (ignora os ids anônimos do próprio RevenueCat, que começam com $RCAnonymousID). */
function uidDo(e: EventoRC) {
  const candidatos = [e.app_user_id, e.original_app_user_id, ...(e.aliases ?? [])];
  return candidatos.find((c): c is string => !!c && !c.startsWith('$RCAnonymousID') && /^[A-Za-z0-9]{10,128}$/.test(c)) ?? null;
}

export function mudancaDoEvento(e: EventoRC, agora = Date.now()): MudancaAssinatura {
  const uid = uidDo(e);
  if (!uid) return null;
  const produto = e.product_id ?? '';
  const plano = /anual|annual|year|ano/i.test(produto) ? 'anual' : 'mensal';
  const expiraEm = e.expiration_at_ms ?? null;
  const base = { plano, origem: 'loja', loja: e.store ?? '', produto, expiraEm } as const;
  if (LIGA.includes(e.type)) return { uid, dados: { ...base, ativo: expiraEm == null || expiraEm > agora, cancelada: false } };
  // Cancelou a renovação: continua Fera+ até vencer.
  if (e.type === 'CANCELLATION') return { uid, dados: { ...base, ativo: expiraEm == null || expiraEm > agora, cancelada: true } };
  if (e.type === 'EXPIRATION') return { uid, dados: { ...base, ativo: false, cancelada: true } };
  return null; // BILLING_ISSUE, TEST, TRANSFER…: não muda nada
}
