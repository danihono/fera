// Esqueci a senha (fora do design — prévia no estilo do design system): manda o link de nova senha do Firebase.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Campo } from '@/components/Campo';
import { Apresentacao, Aviso, estilosConta, LinkTexto, TelaConta } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { MailIcon } from '@/components/icons';
import { esqueciSenha, traduzir, type ErroConta } from '@/data/conta';
import { colors, fonts, radius, sizes } from '@/theme';

const ESPERA = 30;

export default function EsqueciSenha() {
  const { email: emailInicial } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(emailInicial ?? '');
  const [erro, setErro] = useState<ErroConta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const [falta, setFalta] = useState(0);

  // Contagem pra poder reenviar (evita "muitas tentativas" do Firebase).
  useEffect(() => {
    if (falta <= 0) return;
    const t = setTimeout(() => setFalta((f) => f - 1), 1000);
    return () => clearTimeout(t);
  }, [falta]);

  const enviar = async () => {
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await esqueciSenha(email);
      setEnviadoPara(email.trim());
      setFalta(ESPERA);
    } catch (e) {
      setErro(traduzir(e));
    } finally {
      setEnviando(false);
    }
  };

  if (enviadoPara) {
    return (
      <TelaConta titulo="Esqueci a senha">
        <View style={styles.envelope}>
          <MailIcon size={44} color={colors.red} />
        </View>
        <Text style={styles.titulo} accessibilityRole="header">
          Confere seu e-mail
        </Text>
        <Text style={styles.texto}>
          Se existir uma conta com <Text style={styles.destaque}>{enviadoPara}</Text>, o link pra criar uma senha nova chega em alguns minutos. Olha também o spam e as promoções.
        </Text>
        {erro && <Aviso tipo="erro">{erro.message}</Aviso>}
        <FeraButton label="Voltar pra entrar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/conta/entrar'))} style={estilosConta.botoes} />
        <FeraButton
          label={falta > 0 ? `Reenviar em ${falta}s` : enviando ? 'Enviando…' : 'Reenviar link'}
          variant="secondary"
          disabled={falta > 0 || enviando}
          onPress={enviar}
        />
        <LinkTexto label="Usar outro e-mail" onPress={() => setEnviadoPara(null)} />
      </TelaConta>
    );
  }

  return (
    <TelaConta titulo="Esqueci a senha">
      <Apresentacao mood="pensativo" titulo="Acontece com todo mundo" texto="Escreve o e-mail da sua conta que a gente manda um link pra criar uma senha nova." />
      {erro && !erro.campo && <Aviso tipo="erro">{erro.message}</Aviso>}
      <Campo
        rotulo="E-mail"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (erro) setErro(null);
        }}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={enviar}
        erro={erro?.campo ? erro.message : null}
        autoFocus={!emailInicial}
      />
      <FeraButton label={enviando ? 'Enviando…' : 'Mandar link'} disabled={enviando || !email.trim()} onPress={enviar} style={estilosConta.botoes} />
    </TelaConta>
  );
}

const styles = StyleSheet.create({
  envelope: {
    alignSelf: 'center',
    marginTop: 12,
    width: 96,
    height: 96,
    borderRadius: radius.card,
    backgroundColor: colors.redSoft,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fonts.fredoka600, fontSize: 28, lineHeight: 34, color: colors.text, textAlign: 'center' },
  texto: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 23, color: colors.textMuted, textAlign: 'center' },
  destaque: { fontFamily: fonts.nunito800, color: colors.text },
});
