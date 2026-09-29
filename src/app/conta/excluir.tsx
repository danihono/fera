// Excluir conta (fora do design — prévia no estilo do design system). Apaga tudo na nuvem e no aparelho.
// Conta de e-mail confirma com a senha; sem conta, basta digitar EXCLUIR.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Campo } from '@/components/Campo';
import { Apresentacao, Aviso, estilosConta, TelaConta } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { XMarkIcon } from '@/components/icons';
import { excluirConta, traduzir, useConta, type ErroConta } from '@/data/conta';
import { useApp } from '@/data/store';
import { colors, fonts, radius, sizes } from '@/theme';

const PALAVRA = 'EXCLUIR';

export default function Excluir() {
  const conta = useConta();
  const { premium, provas, xp, turmas } = useApp();
  const comEmail = !!conta && !conta.anonimo;
  const [palavra, setPalavra] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<ErroConta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const confirmou = palavra.trim().toUpperCase() === PALAVRA;

  const itens = [
    provas.length ? `${provas.length} ${provas.length === 1 ? 'prova' : 'provas'} e tudo que a IA gerou` : 'Suas provas e tudo que a IA gerou',
    `${xp} XP, nível, sequência e conquistas`,
    turmas.length ? `Seu lugar no ranking de ${turmas.length === 1 ? '1 turma' : `${turmas.length} turmas`}` : 'Seu lugar no ranking das turmas',
    ...(comEmail ? [`O login com ${conta.email}`] : []),
  ];

  const excluir = async () => {
    if (enviando || !confirmou) return;
    setErro(null);
    setEnviando(true);
    try {
      await excluirConta(comEmail ? senha : undefined);
      if (router.canDismiss()) router.dismissAll();
      router.replace('/onboarding');
    } catch (e) {
      setErro(traduzir(e));
      setEnviando(false);
    }
  };

  return (
    <TelaConta titulo={comEmail ? 'Excluir conta' : 'Apagar meus dados'}>
      <Apresentacao mood="triste" titulo="Vai mesmo?" texto="Isso apaga pra sempre, do aparelho e da nuvem. Não dá pra desfazer." />

      <View style={styles.lista}>
        {itens.map((t) => (
          <View key={t} style={styles.item}>
            <View style={styles.x}>
              <XMarkIcon size={14} color={colors.errorText} strokeWidth={3.2} />
            </View>
            <Text style={styles.itemTexto}>{t}</Text>
          </View>
        ))}
      </View>

      {premium && (
        <Aviso>
          O Fera+ é cobrado pela loja do celular. Excluir a conta não cancela a assinatura: cancele em Ajustes → Assinaturas (iPhone) ou Play Store → Pagamentos e assinaturas (Android).
        </Aviso>
      )}
      {erro && !erro.campo && <Aviso tipo="erro">{erro.message}</Aviso>}

      <Campo
        rotulo={`Pra confirmar, escreve ${PALAVRA}`}
        value={palavra}
        onChangeText={setPalavra}
        placeholder={PALAVRA}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType={comEmail ? 'next' : 'done'}
      />
      {comEmail && (
        <Campo
          rotulo="Sua senha"
          senha
          value={senha}
          onChangeText={(t) => {
            setSenha(t);
            if (erro) setErro(null);
          }}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={excluir}
          erro={erro?.campo ? erro.message : null}
        />
      )}

      <FeraButton
        label={enviando ? 'Apagando…' : 'Excluir pra sempre'}
        variant="error"
        disabled={enviando || !confirmou || (comEmail && !senha)}
        onPress={excluir}
        style={estilosConta.botoes}
      />
      <FeraButton label="Mudei de ideia" variant="secondary" onPress={() => router.back()} />
    </TelaConta>
  );
}

const styles = StyleSheet.create({
  lista: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.option, padding: 16, gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  x: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.errorBg, alignItems: 'center', justifyContent: 'center' },
  itemTexto: { flex: 1, fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 20, color: colors.text },
});
