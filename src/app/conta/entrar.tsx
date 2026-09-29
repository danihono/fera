// Entrar com e-mail e senha (fora do design — prévia no estilo do design system).
// Abre pelo "Já tenho conta" do onboarding (02a), pela Minha conta e pelas Configurações.
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Campo } from '@/components/Campo';
import { Apresentacao, Aviso, estilosConta, LinkTexto, TelaConta } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { entrarComEmail, temProgressoSemConta, traduzir, useConta, type ErroConta } from '@/data/conta';
import { useApp } from '@/data/store';
import { goHome } from '@/lib/nav';

export default function Entrar() {
  const { email: emailInicial } = useLocalSearchParams<{ email?: string; de?: string }>();
  const conta = useConta();
  const { xp, provas } = useApp();
  const [email, setEmail] = useState(emailInicial ?? '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<ErroConta | null>(null);
  const [enviando, setEnviando] = useState(false);
  const senhaRef = useRef<TextInput>(null);
  const temProgresso = conta?.anonimo !== false && temProgressoSemConta();

  const entrar = async () => {
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await entrarComEmail(email, senha);
      goHome();
    } catch (e) {
      setErro(traduzir(e));
      setEnviando(false);
    }
  };

  const erroDe = (campo: 'email' | 'senha') => (erro?.campo === campo ? erro.message : null);

  return (
    <TelaConta titulo="Entrar">
      <Apresentacao mood="acenando" titulo="Que bom te ver!" texto="Entra com o e-mail e a senha da sua conta pra continuar de onde parou." />

      {temProgresso && (
        <Aviso>
          {`Este aparelho tem progresso sem conta (${xp} XP${provas.length ? `, ${provas.length} ${provas.length === 1 ? 'prova' : 'provas'}` : ''}). Se a conta em que você vai entrar já tiver progresso, é o dela que fica. Pra guardar o daqui, crie uma conta nova.`}
        </Aviso>
      )}
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
        returnKeyType="next"
        onSubmitEditing={() => senhaRef.current?.focus()}
        submitBehavior="submit"
        erro={erroDe('email')}
      />
      <Campo
        ref={senhaRef}
        rotulo="Senha"
        senha
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          if (erro) setErro(null);
        }}
        placeholder="Sua senha"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={entrar}
        erro={erroDe('senha')}
      />
      <LinkTexto label="Esqueci a senha" alinhar="flex-end" onPress={() => router.push({ pathname: '/conta/esqueci', params: { email: email.trim() } })} />

      <FeraButton label={enviando ? 'Entrando…' : 'Entrar'} disabled={enviando || !email.trim() || !senha} onPress={entrar} style={estilosConta.botoes} />
      <LinkTexto antes="Ainda não tem conta?" label="Criar conta" onPress={() => router.replace('/conta/criar')} />
    </TelaConta>
  );
}
