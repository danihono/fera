// Webhook do RevenueCat → assinatura (npm test).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mudancaDoEvento } from '../functions/src/revenuecat';

const AGORA = 1_800_000_000_000;
const UID = 'Xy12AbC34dEf56GhI78j';

test('compra anual liga o Fera+ até a data da loja', () => {
  const m = mudancaDoEvento({ type: 'INITIAL_PURCHASE', app_user_id: UID, product_id: 'fera_plus_anual', expiration_at_ms: AGORA + 1000, store: 'PLAY_STORE' }, AGORA)!;
  assert.equal(m.uid, UID);
  assert.deepEqual(m.dados, { ativo: true, plano: 'anual', origem: 'loja', loja: 'PLAY_STORE', produto: 'fera_plus_anual', expiraEm: AGORA + 1000, cancelada: false });
});

test('cancelou: continua até vencer; venceu: desliga', () => {
  const c = mudancaDoEvento({ type: 'CANCELLATION', app_user_id: UID, product_id: 'fera_plus_mensal', expiration_at_ms: AGORA + 1000 }, AGORA)!;
  assert.equal(c.dados.ativo, true);
  assert.equal(c.dados.cancelada, true);
  assert.equal(c.dados.plano, 'mensal');
  const e = mudancaDoEvento({ type: 'EXPIRATION', app_user_id: UID, product_id: 'fera_plus_mensal', expiration_at_ms: AGORA - 1 }, AGORA)!;
  assert.equal(e.dados.ativo, false);
});

test('id anônimo do RevenueCat não vale; usa o alias que é o uid', () => {
  assert.equal(mudancaDoEvento({ type: 'RENEWAL', app_user_id: '$RCAnonymousID:abc' }, AGORA), null);
  const m = mudancaDoEvento({ type: 'RENEWAL', app_user_id: '$RCAnonymousID:abc', aliases: ['$RCAnonymousID:abc', UID], expiration_at_ms: AGORA + 5 }, AGORA)!;
  assert.equal(m.uid, UID);
});

test('eventos que não mudam nada', () => {
  assert.equal(mudancaDoEvento({ type: 'BILLING_ISSUE', app_user_id: UID }, AGORA), null);
  assert.equal(mudancaDoEvento({ type: 'TEST', app_user_id: UID }, AGORA), null);
});
