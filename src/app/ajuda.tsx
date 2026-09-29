// Central de ajuda (fora do design — prévia no estilo do design system): perguntas frequentes e contato.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDownIcon, FileIcon, HelpIcon, MailIcon, ShieldIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Linha, Secao } from '@/components/Lista';
import { Rugi } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useConta } from '@/data/conta';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const EMAIL = 'ajuda@fera.app';

const PERGUNTAS: { p: string; r: string }[] = [
  {
    p: 'Como o Fera monta as missões?',
    r: 'Você manda o conteúdo da prova e a IA lê tudo, separa os tópicos e cria missões de 5 minutos, do mais básico ao que mais cai. Outra IA confere o gabarito de cada questão antes de chegar em você.',
  },
  {
    p: 'Que arquivos posso mandar?',
    r: 'Quase tudo: fotos do caderno ou da lousa, PDF, Word, PowerPoint, Excel, páginas da web (HTML), ePub, texto, legendas, áudio ou vídeo curto da aula e até um .zip com tudo junto. Dá pra mandar vários de uma vez, até 14 MB por prova. Word antigo (.doc) precisa ser salvo como .docx ou PDF.',
  },
  {
    p: 'A IA pode errar?',
    r: 'Pode, principalmente com foto tremida ou letra difícil. Por isso cada questão passa por uma segunda IA que resolve sem ver a resposta. Se ainda assim achar um erro, toca em "Reportar um problema" aqui embaixo.',
  },
  {
    p: 'Preciso criar conta?',
    r: 'Não. Dá pra usar sem conta, e o progresso fica salvo neste aparelho. Com a conta (e-mail e senha), você não perde nada se trocar de celular. Criar a conta depois leva junto tudo que você já fez.',
  },
  {
    p: 'Esqueci a senha. E agora?',
    r: 'Na tela de Entrar, toca em "Esqueci a senha" e escreve seu e-mail. Chega um link pra criar uma senha nova. Não achou? Olha o spam e as promoções.',
  },
  {
    p: 'Como funciona a sequência?',
    r: 'Cada dia com pelo menos uma missão feita soma 1 na sequência. Se passar um dia inteiro sem estudar, ela volta pro zero. Seu recorde fica guardado.',
  },
  {
    p: 'O que são as vidas?',
    r: 'Cada missão começa com 5 vidas e cada erro gasta uma. Se acabarem, é só tentar a missão de novo. No Fera+ as vidas são infinitas.',
  },
  {
    p: 'Como entro numa turma?',
    r: 'Na aba Turma, toca em "Entrar com código" e escreve o código que alguém te mandou (tipo FERA-72K). Pra criar a sua, toca em "Criar turma" e manda o código pra galera.',
  },
  {
    p: 'Como cancelo o Fera+?',
    r: 'A assinatura é cobrada pela loja do celular. No iPhone: Ajustes → seu nome → Assinaturas. No Android: Play Store → Pagamentos e assinaturas → Assinaturas. Apagar o app ou a conta não cancela a cobrança.',
  },
  {
    p: 'Como apago meus dados?',
    r: 'Em Perfil → engrenagem → Minha conta → Excluir conta. Isso apaga tudo do aparelho e da nuvem, sem volta.',
  },
];

export default function Ajuda() {
  const insets = useSafeAreaInsets();
  const conta = useConta();
  const [aberta, setAberta] = useState<number | null>(0);
  const [semEmail, setSemEmail] = useState(false);

  const escrever = (assunto: string) => {
    // Duas linhas em branco pra pessoa escrever; embaixo, o que ajuda o suporte a achar o problema.
    const info = [`App: Fera ${Constants.expoConfig?.version ?? ''}`, `Aparelho: ${Platform.OS} ${String(Platform.Version ?? '')}`];
    if (conta) info.push(`Código: ${conta.uid.slice(0, 8).toUpperCase()}`);
    const corpo = ['', '', '— Pra ajudar a gente (pode deixar aqui embaixo) —', ...info].join('\n');
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    Linking.openURL(url).catch(() => setSemEmail(true));
  };

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.miolo, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Ajuda" />

      <View style={styles.topo}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.titulo} accessibilityRole="header">
            Como posso ajudar?
          </Text>
          <Text style={styles.texto}>As dúvidas mais comuns estão aqui. Não achou? Fala com a gente.</Text>
        </View>
        <Rugi mood="pensativo" width={84} />
      </View>

      <Text style={styles.secao}>PERGUNTAS FREQUENTES</Text>
      <View style={styles.lista}>
        {PERGUNTAS.map((q, i) => {
          const on = aberta === i;
          return (
            <View key={q.p} style={i > 0 && styles.divisor}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => setAberta(on ? null : i)} style={styles.pergunta}>
                <Text style={styles.perguntaTexto}>{q.p}</Text>
                <View style={on && { transform: [{ rotate: '180deg' }] }}>
                  <ChevronDownIcon size={18} color={colors.iconMuted} />
                </View>
              </Pressable>
              {on && <Text style={styles.resposta}>{q.r}</Text>}
            </View>
          );
        })}
      </View>

      <Secao titulo="FALE COM A GENTE">
        <Linha icone={<MailIcon />} rotulo="Mandar uma mensagem" sub={`Respondemos em até 2 dias úteis · ${EMAIL}`} onPress={() => escrever('Dúvida sobre o Fera')} />
        <Linha icone={<HelpIcon />} rotulo="Reportar um problema" sub="Questão errada, erro no app, algo estranho" onPress={() => escrever('Problema no Fera')} />
      </Secao>

      <Secao titulo="DOCUMENTOS">
        <Linha icone={<FileIcon size={22} />} rotulo="Termos de uso" onPress={() => router.push('/legal/termos')} />
        <Linha icone={<ShieldIcon />} rotulo="Política de privacidade" onPress={() => router.push('/legal/privacidade')} />
      </Secao>

      {semEmail && (
        <InfoSheet mood="pensativo" title="Sem app de e-mail" text={`Manda sua mensagem pra ${EMAIL} de qualquer lugar que a gente responde.`} button="Beleza" onClose={() => setSemEmail(false)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter },
  topo: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: { ...type.screenTitle, lineHeight: 34, color: colors.text },
  texto: { fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  secao: { marginTop: 22, marginBottom: 8, fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.textMuted, paddingHorizontal: 4 },
  lista: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  divisor: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  pergunta: { minHeight: 60, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  perguntaTexto: { flex: 1, fontFamily: fonts.nunito800, fontSize: 16, lineHeight: 21, color: colors.text },
  resposta: { paddingHorizontal: 16, paddingBottom: 16, marginTop: -4, fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 22, color: colors.textMuted },
});
