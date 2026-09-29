// Configurações (fora do design — prévia no estilo do design system). Aberta pela engrenagem do Perfil.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BellIcon,
  ChartIcon,
  CrownIcon,
  FileIcon,
  FireIcon,
  HelpIcon,
  LogoutIcon,
  ShieldIcon,
  SparkleIcon,
  SoundIcon,
  TimerIcon,
  TrophyIcon,
  UserIcon,
} from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Linha, Secao } from '@/components/Lista';
import type { RugiMood } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { OpcoesSheet, SerieSheet } from '@/components/SerieSheet';
import { Toggle } from '@/components/Toggle';
import { contasDisponiveis, excluirConta, sair as sairDaConta, traduzir, useConta } from '@/data/conta';
import { DESCRICAO_MODO, modoIA } from '@/data/geracao';
import { app, useApp } from '@/data/store';
import { aplicarConsentimento } from '@/lib/metricas';
import { notificacoesDisponiveis, permitirNotificacoes } from '@/lib/notificacoes';
import { colors, fonts, sizes, space } from '@/theme';

const MINUTOS = [5, 10, 15];
const HORARIOS = ['07:00', '12:00', '14:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
/** Valor curto na linha (o nome completo aparece na sheet). */
const MODO_CURTO = { demo: 'Demonstração', gratis: 'Grátis', qualidade: 'Fera+' } as const;

type Info = {
  mood: RugiMood;
  title: string;
  text: string;
  button: string;
  variant?: 'primary' | 'error';
  onConfirm?: () => void;
  secondary?: { label: string; onPress?: () => void };
};

const irProComeco = () => {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/onboarding');
};

export default function Configuracoes() {
  const insets = useSafeAreaInsets();
  const { prova, lembrete, lembreteHora, sons, metricas, premium, serie, provaAtual } = useApp();
  const conta = useConta();
  const comEmail = !!conta && !conta.anonimo;
  const [escolhendoSerie, setEscolhendoSerie] = useState(false);
  const [escolhendoHora, setEscolhendoHora] = useState(false);
  const modo = modoIA(premium);
  const [info, setInfo] = useState<Info | null>(null);

  const proximoMinuto = () => {
    const i = MINUTOS.indexOf(prova.minutosDia);
    app.setProva({ minutosDia: MINUTOS[(i + 1) % MINUTOS.length] });
  };

  // Ligar o lembrete pede a permissão do celular; negada, ele fica desligado e a gente explica.
  const trocarLembrete = async (ligar: boolean) => {
    if (!ligar || !notificacoesDisponiveis) return app.setLembrete(ligar);
    if (await permitirNotificacoes(true)) app.setLembrete(true);
    else {
      app.setLembrete(false);
      setInfo({ mood: 'impaciente', title: 'Notificação bloqueada', text: 'Pra eu te lembrar, libera as notificações do Fera nos ajustes do celular.', button: 'Beleza' });
    }
  };

  const falhou = (e: unknown) => setInfo({ mood: 'pensativo', title: 'Não deu', text: traduzir(e).message, button: 'Beleza' });
  const apagarTudo = () => excluirConta().then(irProComeco, falhou);

  const sair = () => {
    if (comEmail) {
      setInfo({
        mood: 'triste',
        title: 'Sair da conta?',
        text: 'Seu progresso continua salvo na conta. Neste aparelho o Fera volta pro começo até você entrar de novo.',
        button: 'Sair',
        secondary: { label: 'Ficar' },
        onConfirm: () => sairDaConta().then(irProComeco, falhou),
      });
    } else if (contasDisponiveis) {
      // Sem conta, sair é apagar: oferece criar a conta antes.
      setInfo({
        mood: 'triste',
        title: 'Você está sem conta',
        text: 'Sair apaga suas provas, XP e sequência. Cria uma conta antes e tudo fica guardado.',
        button: 'Criar conta',
        onConfirm: () => router.push('/conta/criar'),
        secondary: { label: 'Sair e apagar tudo', onPress: apagarTudo },
      });
    } else {
      setInfo({
        mood: 'triste',
        title: 'Sair?',
        text: 'O Rugi vai sentir sua falta. Sair apaga suas provas, XP e sequência deste aparelho.',
        button: 'Sair',
        variant: 'error',
        onConfirm: apagarTudo,
        secondary: { label: 'Ficar' },
      });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Configurações" />

      <Secao titulo="CONTA">
        <Linha icone={<UserIcon />} rotulo="Minha conta" sub={comEmail ? (conta.email ?? undefined) : 'Foto, nome e login'} valor={comEmail ? undefined : contasDisponiveis ? 'Sem conta' : undefined} onPress={() => router.push('/conta')} />
        <Linha icone={<FileIcon size={22} />} rotulo="Ano escolar" sub="A IA explica no seu nível" valor={serie} onPress={() => setEscolhendoSerie(true)} />
        <Linha icone={<CrownIcon width={22} height={18} />} rotulo="Fera+" valor={premium ? 'Ativo' : 'Conhecer'} onPress={() => router.push('/premium')} />
      </Secao>

      <Secao titulo="ESTUDO">
        <Linha
          icone={<BellIcon />}
          rotulo="Lembrete diário"
          sub={notificacoesDisponiveis ? `Todo dia às ${lembreteHora} · toca pra mudar` : 'Só no app do celular'}
          onPress={notificacoesDisponiveis ? () => setEscolhendoHora(true) : undefined}
          direita={<Toggle label="Lembrete diário" value={lembrete} onChange={trocarLembrete} />}
        />
        <Linha icone={<TimerIcon size={22} />} rotulo="Tempo por dia" valor={`${prova.minutosDia} min`} onPress={proximoMinuto} />
        <Linha icone={<SoundIcon />} rotulo="Sons e vibração" direita={<Toggle label="Sons e vibração" value={sons} onChange={app.setSons} />} />
        <Linha
          icone={<SparkleIcon size={22} />}
          rotulo="Geração por IA"
          valor={MODO_CURTO[modo]}
          onPress={() =>
            setInfo({
              mood: 'pensativo',
              title: DESCRICAO_MODO[modo].nome,
              text: `${DESCRICAO_MODO[modo].texto}${modo === 'gratis' ? ' No Fera+ entra o time completo: Claude escreve, outro modelo confere e o GPT Image ilustra.' : ''}`,
              button: 'Entendi',
            })
          }
        />
      </Secao>

      <Secao titulo="AJUDA">
        <Linha
          icone={<ChartIcon />}
          rotulo="Estatísticas de uso"
          sub="Anônimas: ajudam a melhorar o Fera"
          direita={
            <Toggle
              label="Estatísticas de uso"
              value={metricas}
              onChange={(v) => {
                app.setMetricas(v);
                aplicarConsentimento(v);
              }}
            />
          }
        />
        <Linha icone={<HelpIcon />} rotulo="Central de ajuda" sub="Perguntas frequentes e contato" onPress={() => router.push('/ajuda')} />
        <Linha icone={<FileIcon size={22} />} rotulo="Termos de uso" onPress={() => router.push('/legal/termos')} />
        <Linha icone={<ShieldIcon />} rotulo="Política de privacidade" onPress={() => router.push('/legal/privacidade')} />
      </Secao>

      {/* Telas que o app mostra em momentos específicos — atalhos pra ver como ficam. */}
      <Secao titulo="PRÉVIAS">
        <Linha icone={<FireIcon size={22} core={false} />} rotulo="Sequência perdida" sub="Aparece quando você fica um dia sem estudar" onPress={() => router.push('/streak')} />
        <Linha icone={<TrophyIcon size={22} />} rotulo="Modo véspera" sub="Aparece no dia antes da prova" onPress={() => router.push(`/vespera/${provaAtual ?? 'exemplo'}`)} />
      </Secao>

      <Pressable accessibilityRole="button" onPress={sair} style={styles.logout}>
        <LogoutIcon size={20} color={colors.redText} />
        <Text style={styles.logoutText}>{comEmail ? 'Sair da conta' : 'Sair'}</Text>
      </Pressable>
      <View>
        <Text style={styles.version}>Fera · versão {Constants.expoConfig?.version ?? '0.2.0'}</Text>
      </View>

      {info && <InfoSheet {...info} onClose={() => setInfo(null)} />}
      {escolhendoSerie && <SerieSheet serie={serie} onClose={() => setEscolhendoSerie(false)} />}
      {escolhendoHora && (
        <OpcoesSheet
          titulo="Horário do lembrete"
          opcoes={HORARIOS}
          valor={lembreteHora}
          onEscolher={(h) => {
            app.setLembreteHora(h);
            trocarLembrete(true);
          }}
          onClose={() => setEscolhendoHora(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  logout: { marginTop: 26, height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
  version: { marginTop: 4, textAlign: 'center', fontFamily: fonts.nunito700, fontSize: 12, color: colors.lockedIcon },
});
