// Configurações (fora do design — prévia no estilo do design system). Aberta pela engrenagem do Perfil.
import { router } from 'expo-router';
import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  CrownIcon,
  FileIcon,
  FireIcon,
  HelpIcon,
  LogoutIcon,
  SparkleIcon,
  SoundIcon,
  TimerIcon,
  TrophyIcon,
  UserIcon,
} from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import type { RugiMood } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextInputSheet } from '@/components/TextInputSheet';
import { Toggle } from '@/components/Toggle';
import { apagarConteudos } from '@/data/conteudo';
import { DESCRICAO_MODO, modoIA } from '@/data/geracao';
import { apagarConta } from '@/data/nuvem';
import { limpar } from '@/data/rascunho';
import { app, SERIES, useApp } from '@/data/store';
import { colors, fonts, radius, sizes, space } from '@/theme';

const MINUTOS = [5, 10, 15];

type Info = { mood: RugiMood; title: string; text: string; button: string; onConfirm?: () => void };

export default function Configuracoes() {
  const insets = useSafeAreaInsets();
  const { nome, prova, lembrete, sons, premium, serie, provaAtual } = useApp();
  const [editando, setEditando] = useState(false);
  const [escolhendoSerie, setEscolhendoSerie] = useState(false);
  const modo = modoIA(premium);
  const [info, setInfo] = useState<Info | null>(null);

  const proximoMinuto = () => {
    const i = MINUTOS.indexOf(prova.minutosDia);
    app.setProva({ minutosDia: MINUTOS[(i + 1) % MINUTOS.length] });
  };

  const sair = () =>
    setInfo({
      mood: 'triste',
      title: 'Sair da conta?',
      text: 'O Rugi vai sentir sua falta. Sair apaga suas provas, XP e sequência deste aparelho e da nuvem.',
      button: 'Sair',
      onConfirm: async () => {
        await apagarConta().catch(() => {});
        await apagarConteudos();
        limpar();
        app.reset();
        if (router.canDismiss()) router.dismissAll();
        router.replace('/onboarding');
      },
    });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Configurações" />

      <Section title="CONTA">
        <Row icon={<UserIcon />} label="Nome" value={nome || 'Pôr nome'} onPress={() => setEditando(true)} />
        <Row icon={<FileIcon size={22} />} label="Ano escolar" sub="A IA explica no seu nível" value={serie} onPress={() => setEscolhendoSerie(true)} />
        <Row icon={<CrownIcon width={22} height={18} />} label="Fera+" value={premium ? 'Ativo' : 'Conhecer'} onPress={() => router.push('/premium')} />
      </Section>

      <Section title="ESTUDO">
        <Row icon={<BellIcon />} label="Lembrete diário" sub="Todo dia às 19:00" right={<Toggle label="Lembrete diário" value={lembrete} onChange={app.setLembrete} />} />
        <Row icon={<TimerIcon size={22} />} label="Tempo por dia" value={`${prova.minutosDia} min`} onPress={proximoMinuto} />
        <Row icon={<SoundIcon />} label="Sons e vibração" right={<Toggle label="Sons e vibração" value={sons} onChange={app.setSons} />} />
        <Row
          icon={<SparkleIcon size={22} />}
          label="Geração por IA"
          value={DESCRICAO_MODO[modo].nome}
          onPress={() =>
            setInfo({
              mood: 'pensativo',
              title: DESCRICAO_MODO[modo].nome,
              text: `${DESCRICAO_MODO[modo].texto}${modo === 'gratis' ? ' No Fera+ entra o time completo: Claude escreve, outro modelo confere e o GPT Image ilustra.' : ''}`,
              button: 'Entendi',
            })
          }
        />
      </Section>

      <Section title="AJUDA">
        <Row
          icon={<HelpIcon />}
          label="Central de ajuda"
          onPress={() => setInfo({ mood: 'acenando', title: 'Tamo aqui!', text: 'Manda sua dúvida pra ajuda@fera.app que o time responde rapidinho.', button: 'Valeu' })}
        />
        <Row
          icon={<FileIcon size={22} />}
          label="Termos e privacidade"
          onPress={() => setInfo({ mood: 'pensativo', title: 'Termos e privacidade', text: 'Os textos oficiais entram aqui antes do lançamento.', button: 'Entendi' })}
        />
      </Section>

      {/* Telas que o app mostra em momentos específicos — atalhos pra ver como ficam. */}
      <Section title="PRÉVIAS">
        <Row icon={<FireIcon size={22} core={false} />} label="Sequência perdida" sub="Aparece quando você fica um dia sem estudar" onPress={() => router.push('/streak')} />
        <Row icon={<TrophyIcon size={22} />} label="Modo véspera" sub="Aparece no dia antes da prova" onPress={() => router.push(`/vespera/${provaAtual ?? 'exemplo'}`)} />
      </Section>

      <Pressable accessibilityRole="button" onPress={sair} style={styles.logout}>
        <LogoutIcon size={20} color={colors.redText} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </Pressable>
      <Text style={styles.version}>Fera · versão 0.2.0</Text>

      {editando && <TextInputSheet title="Como você quer ser chamado?" placeholder={nome} maxLength={30} onSubmit={app.setNome} onClose={() => setEditando(false)} />}
      {info && <InfoSheet {...info} onClose={() => setInfo(null)} />}
      {escolhendoSerie && (
        <BottomSheet onClose={() => setEscolhendoSerie(false)}>
          {(close) => (
            <>
              <Text style={styles.sheetTitle}>Ano escolar</Text>
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {SERIES.map((s) => {
                  const on = s === serie;
                  return (
                    <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => close(() => app.setSerie(s))} style={styles.serieRow}>
                      <View style={[styles.radio, on && styles.radioOn]}>{on && <CheckIcon size={14} color={colors.white} />}</View>
                      <Text style={[styles.serieText, on && { color: colors.redText }]}>{s}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </BottomSheet>
      )}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {c}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

function Row({ icon, label, sub, value, right, onPress }: { icon: ReactNode; label: string; sub?: string; value?: string; right?: ReactNode; onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {value && (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      )}
      {right ?? (onPress && <ChevronRightIcon size={18} strokeWidth={2.8} color={colors.iconMuted} />)}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.offWhite }]}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  section: { marginTop: 22, gap: 8 },
  sectionTitle: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.textMuted, paddingHorizontal: 4 },
  card: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingVertical: 4, overflow: 'hidden' },
  divider: { height: sizes.borderWidth, backgroundColor: colors.border, marginHorizontal: 16 },
  row: { minHeight: 64, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  rowValue: { maxWidth: 130, fontFamily: fonts.nunito700, fontSize: 15, color: colors.textMuted },
  logout: { marginTop: 26, height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.redText },
  version: { marginTop: 4, textAlign: 'center', fontFamily: fonts.nunito700, fontSize: 12, color: colors.lockedIcon },
  sheetTitle: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text, marginBottom: 4 },
  serieRow: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: sizes.borderWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderWidth: 0, backgroundColor: colors.red },
  serieText: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
});
