// Trocar senha (fora do design — prévia no estilo do design system). Pede a senha atual (o Firebase exige login recente).
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Campo } from '@/components/Campo';
import { Apresentacao, Aviso, estilosConta, ForcaSenha, LinkTexto, TelaConta } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { InfoSheet } from '@/components/InfoSheet';
import { forcaDaSenha, traduzir, trocarSenha, useConta, type ErroConta } from '@/data/conta';

export default function TrocarSenha() {
  const conta = useConta();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState<ErroConta | null>(null);
  const [erroNova, setErroNova] = useState<string | null>(null);
  const [erroConfirmar, setErroConfirmar] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const novaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const limpar = () => {
    setErro(null);
    setErroNova(null);
    setErroConfirmar(null);
  };

  const salvar = async () => {
    if (enviando) return;
    limpar();
    if (nova !== confirmar) {
      setErroConfirmar('As duas senhas novas não estão iguais.');
      return;
    }
    setEnviando(true);
    try {
      await trocarSenha(atual, nova);
      setPronto(true);
    } catch (e) {
      const x = traduzir(e);
      if (x.campo === 'nova') setErroNova(x.message);
      else setErro(x);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <TelaConta titulo="Trocar senha">
      <Apresentacao mood="forca" titulo="Senha nova" texto="Primeiro a atual, pra gente saber que é você mesmo." />
      {erro && !erro.campo && <Aviso tipo="erro">{erro.message}</Aviso>}
      <Campo
        rotulo="Senha atual"
        senha
        value={atual}
        onChangeText={(t) => {
          setAtual(t);
          limpar();
        }}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => novaRef.current?.focus()}
        erro={erro?.campo ? erro.message : null}
      />
      <Campo
        ref={novaRef}
        rotulo="Senha nova"
        senha
        value={nova}
        onChangeText={(t) => {
          setNova(t);
          limpar();
        }}
        placeholder="Pelo menos 8, com letras e números"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmarRef.current?.focus()}
        erro={erroNova}
      />
      {nova.length > 0 && <ForcaSenha forca={forcaDaSenha(nova)} />}
      <Campo
        ref={confirmarRef}
        rotulo="Confirmar senha nova"
        senha
        value={confirmar}
        onChangeText={(t) => {
          setConfirmar(t);
          limpar();
        }}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={salvar}
        erro={erroConfirmar}
      />
      <FeraButton label={enviando ? 'Salvando…' : 'Salvar senha'} disabled={enviando || !atual || !nova || !confirmar} onPress={salvar} style={estilosConta.botoes} />
      <LinkTexto label="Esqueci a senha atual" onPress={() => router.push({ pathname: '/conta/esqueci', params: { email: conta?.email ?? '' } })} />

      {pronto && <InfoSheet mood="comemorando" title="Senha trocada!" text="Da próxima vez que entrar, usa a senha nova." button="Beleza" onClose={() => router.back()} />}
    </TelaConta>
  );
}
