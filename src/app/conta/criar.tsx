// Criar conta (fora do design — prévia no estilo do design system). Liga e-mail e senha ao usuário de agora:
// provas, XP, sequência e turmas continuam os mesmos.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, type TextInput } from 'react-native';
import { Campo } from '@/components/Campo';
import { Apresentacao, Aviso, Chips, estilosConta, ForcaSenha, LinkTexto, Marcar, TelaConta } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { InfoSheet } from '@/components/InfoSheet';
import { criarConta, ErroConta, forcaDaSenha, traduzir } from '@/data/conta';
import { app, useApp, type FaixaEtaria } from '@/data/store';
import { colors, fonts } from '@/theme';

export default function CriarConta() {
  const { nome: nomeSalvo, xp } = useApp();
  const [nome, setNome] = useState(nomeSalvo);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceite, setAceite] = useState(false);
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(null);
  const crianca = faixa === 'crianca';
  const [erro, setErro] = useState<ErroConta | null>(null);
  const [erroConfirmar, setErroConfirmar] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const limparErro = () => {
    if (erro) setErro(null);
    if (erroConfirmar) setErroConfirmar(null);
  };

  const criar = async () => {
    if (enviando) return;
    setErro(null);
    if (senha !== confirmar) {
      setErroConfirmar('As duas senhas não estão iguais.');
      return;
    }
    if (!faixa) {
      setErro(new ErroConta('Conta pra quem? Escolhe a idade lá em cima.'));
      return;
    }
    if (!aceite) {
      setErro(new ErroConta('Pra criar a conta, marca que leu e aceita os Termos e a Política de privacidade.'));
      return;
    }
    setEnviando(true);
    try {
      await criarConta(nome, email, senha);
      app.setFaixaEtaria(faixa);
      setPronto(true);
    } catch (e) {
      setErro(traduzir(e));
    } finally {
      setEnviando(false);
    }
  };

  const erroDe = (campo: 'nome' | 'email' | 'senha') => (erro?.campo === campo ? erro.message : null);
  const podeEnviar = !!nome.trim() && !!email.trim() && !!senha && !!confirmar && !enviando;

  return (
    <TelaConta titulo="Criar conta">
      <Apresentacao
        mood="comemorando"
        titulo="Guarda seu progresso"
        texto={xp > 0 ? `Seus ${xp} XP, provas e sequência vão junto. Troca de celular e continua de onde parou.` : 'Suas provas, XP e sequência ficam salvos. Troca de celular e continua de onde parou.'}
      />
      {erro && !erro.campo && <Aviso tipo="erro">{erro.message}</Aviso>}

      <Chips
        rotulo="Quantos anos você tem?"
        valor={faixa}
        onChange={(f) => {
          setFaixa(f);
          if (erro) setErro(null);
        }}
        opcoes={[
          { id: 'crianca', label: 'Até 11' },
          { id: 'adolescente', label: '12 a 17' },
          { id: 'adulto', label: '18 ou mais' },
        ]}
      />
      {crianca && <Aviso>Com menos de 12 anos, quem cria a conta é o pai, a mãe ou o responsável, com o e-mail e a senha dele.</Aviso>}

      <Campo
        rotulo={crianca ? 'Nome da criança' : 'Nome'}
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          limparErro();
        }}
        placeholder="Como a gente te chama"
        maxLength={30}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
        erro={erroDe('nome')}
      />
      <Campo
        ref={emailRef}
        rotulo={crianca ? 'E-mail do responsável' : 'E-mail'}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          limparErro();
        }}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => senhaRef.current?.focus()}
        erro={erroDe('email')}
        dica="A gente manda um link pra confirmar."
      />
      <Campo
        ref={senhaRef}
        rotulo="Senha"
        senha
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          limparErro();
        }}
        placeholder="Pelo menos 8, com letras e números"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmarRef.current?.focus()}
        erro={erroDe('senha')}
      />
      {senha.length > 0 && <ForcaSenha forca={forcaDaSenha(senha)} />}
      <Campo
        ref={confirmarRef}
        rotulo="Confirmar senha"
        senha
        value={confirmar}
        onChangeText={(t) => {
          setConfirmar(t);
          limparErro();
        }}
        placeholder="Escreve a senha de novo"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={criar}
        erro={erroConfirmar}
      />

      <Marcar marcado={aceite} onChange={setAceite}>
        {crianca ? 'Sou o responsável, li e aceito os ' : 'Li e aceito os '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => router.push('/legal/termos')}>
          Termos de uso
        </Text>{' '}
        e a{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => router.push('/legal/privacidade')}>
          Política de privacidade
        </Text>
        {crianca ? ', e autorizo a criança a usar o Fera.' : '. Se tenho menos de 18 anos, meu responsável também concorda.'}
      </Marcar>

      <FeraButton label={enviando ? 'Criando…' : 'Criar conta'} disabled={!podeEnviar} onPress={criar} style={estilosConta.botoes} />
      <LinkTexto antes="Já tem conta?" label="Entrar" onPress={() => router.replace('/conta/entrar')} />

      {pronto && (
        <InfoSheet
          mood="comemorando"
          title="Conta criada!"
          text={`Seu progresso tá salvo. Mandamos um link pra ${email.trim()}: toca nele pra confirmar o e-mail.`}
          button="Bora!"
          onClose={() => router.back()}
        />
      )}
    </TelaConta>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.nunito800, color: colors.redText, textDecorationLine: 'underline' },
});
