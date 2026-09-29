// 10 · Turma (ranking) — canvas artboard Turma.dc.html
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, ChevronDownIcon, CopyIcon, CrownIcon, ShareIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { TextInputSheet } from '@/components/TextInputSheet';
import { Pilulas } from '@/components/Pilulas';
import { ProvasDaTurma } from '@/components/turma/ProvasDaTurma';
import { mockTurma, type Colega } from '@/data/mock';
import { criarTurma, entrarNaTurmaNuvem, ouvirRanking, type Membro } from '@/data/nuvem';
import { app, nomeDe, useApp } from '@/data/store';
import { firebaseLigado, usuarioAtual } from '@/lib/firebase';
import { shortDate } from '@/lib/dates';
import { linkDaTurma } from '@/lib/links';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const fmt = (n: number) => n.toLocaleString('pt-BR');
const riseEasing = Easing.bezier(0.2, 0.9, 0.3, 1.1);

// Pódio: 2º, 1º, 3º da esquerda pra direita, com as cores do design.
const PODIUM = [
  { place: 2, delay: 150, bar: 70, avatar: 56, avatarBg: colors.successBg, avatarText: colors.successText, ring: colors.border, ringWidth: 2, letter: 22 },
  { place: 1, delay: 300, bar: 96, avatar: 68, avatarBg: colors.redSoft, avatarText: colors.redText, ring: colors.red, ringWidth: 3, letter: 26 },
  { place: 3, delay: 0, bar: 52, avatar: 56, avatarBg: colors.errorBg, avatarText: colors.errorText, ring: colors.border, ringWidth: 2, letter: 22 },
] as const;

/** Turma de exemplo (modo demonstração, sem Firebase): os colegas do design e você com o seu XP de verdade. */
const TURMA_EXEMPLO = { codigo: mockTurma.codigo, nome: mockTurma.nome };

export default function Turma() {
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const { prova, xp, turmas } = estado;
  const [sheet, setSheet] = useState<null | 'turmas' | 'codigo' | 'criar' | 'copiado' | 'nome'>(null);
  // Na turma o nome aparece pros colegas: sem nome ainda, pergunta antes de criar/entrar.
  const [depoisDoNome, setDepoisDoNome] = useState<'codigo' | 'criar' | 'convite' | null>(null);
  const abrir = (proxima: 'codigo' | 'criar') => {
    if (nuvem && !estado.nome.trim()) {
      setDepoisDoNome(proxima);
      setSheet('nome');
    } else {
      setSheet(proxima);
    }
  };
  const [aviso, setAviso] = useState<string | null>(null);
  const [ao, setAo] = useState<{ codigo: string; membros: Membro[] } | null>(null);
  const nuvem = firebaseLigado;
  const turma = nuvem ? estado.turma : (estado.turma ?? TURMA_EXEMPLO);
  const codigo = turma?.codigo ?? null;
  const eu = usuarioAtual()?.uid;

  // Ranking ao vivo da turma escolhida.
  useEffect(() => {
    if (!nuvem || !codigo) return;
    return ouvirRanking(codigo, (membros) => setAo({ codigo, membros }));
  }, [nuvem, codigo]);
  const membros = ao && ao.codigo === codigo ? ao.membros : null;

  const minhaInicial = nomeDe(estado).charAt(0).toUpperCase();
  const minhaFoto = estado.fotoMini;
  const ranking: (Colega & { voce: boolean })[] = nuvem
    ? (membros ?? []).map((m) =>
        m.uid === eu ? { nome: 'Você', inicial: minhaInicial, xp, foto: minhaFoto, voce: true } : { nome: m.nome, inicial: m.inicial, xp: m.xp, foto: m.foto, voce: false },
      )
    : [...mockTurma.ranking.filter((_, i) => i !== mockTurma.voce).map((c) => ({ ...c, voce: false })), { nome: 'Você', inicial: minhaInicial, xp, foto: minhaFoto, voce: true }];
  ranking.sort((a, b) => b.xp - a.xp);
  const podio = ranking.length >= 3;
  const minhaPosicao = ranking.findIndex((c) => c.voce);
  useEffect(() => {
    if (ranking.length >= 4 && minhaPosicao >= 0 && minhaPosicao < 3) app.marcar('top3');
  }, [ranking.length, minhaPosicao]);
  const resto = podio ? ranking.slice(3) : ranking;

  const entrar = async (codigo: string) => {
    const c = codigo.trim().toUpperCase();
    if (!nuvem) return app.entrarNaTurma({ codigo: c, nome: `Turma ${c}` });
    const t = await entrarNaTurmaNuvem(c).catch(() => null);
    if (t) app.entrarNaTurma(t);
    else setAviso(`Não achei a turma ${c}. Confere o código com quem te chamou.`);
  };
  // Convite por link (…/turma?codigo=FERA-72K): pergunta se quer entrar.
  const { codigo: convite } = useLocalSearchParams<{ codigo?: string }>();
  const [dispensado, setDispensado] = useState<string | null>(null);
  const [convitePendente, setConvitePendente] = useState<string | null>(null);
  const codigoConvite = convite?.trim().toUpperCase() ?? '';
  const conviteAberto =
    /^FERA-[A-Z0-9]{3}$/.test(codigoConvite) && !turmas.some((t) => t.codigo === codigoConvite) && dispensado !== codigoConvite ? codigoConvite : null;
  const aceitarConvite = (c: string) => {
    if (nuvem && !estado.nome.trim()) {
      setConvitePendente(c);
      setDepoisDoNome('convite');
      setSheet('nome');
    } else entrar(c);
  };

  const criar = async (nome: string) => {
    const t = await criarTurma(nome).catch(() => null);
    if (t) app.entrarNaTurma(t);
    else setAviso('Não deu pra criar a turma agora. Confere a internet e tenta de novo.');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <Pilulas />

      <View style={styles.titleRow}>
        <Text style={styles.title}>Turma</Text>
        <Pressable accessibilityRole="button" onPress={() => setSheet('turmas')} style={styles.classPicker}>
          <Text style={styles.classText} numberOfLines={1}>
            {turma?.nome ?? 'Escolher turma'}
          </Text>
          <ChevronDownIcon size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Ranking até a prova · {shortDate(prova.data).toLowerCase()}</Text>

      {!turma ? (
        <View style={styles.semTurma}>
          <Text style={styles.semTurmaText}>Estudar com a galera rende mais. Cria a turma e manda o código, ou entra com o código de alguém.</Text>
          <FeraButton label="Criar turma" onPress={() => abrir('criar')} />
          <FeraButton label="Entrar com código" variant="secondary" onPress={() => abrir('codigo')} />
        </View>
      ) : (
        <>
          {podio && (
            /* O pódio tem 222 de altura, mas o conteúdo é mais alto e desce por cima da lista (como no design). */
            <View style={styles.podium}>
              <View style={styles.podiumRow}>
                {PODIUM.map((p) => (
                  <PodiumColumn key={p.place} colega={ranking[p.place - 1]} {...p} />
                ))}
              </View>
            </View>
          )}

          {resto.length > 0 && (
            <View style={[styles.list, !podio && { marginTop: 14 }]}>
              {resto.map((c, i) => {
                const pos = i + (podio ? 4 : 1);
                return c.voce ? (
                  <View key={`${c.nome}-${i}`} style={[styles.row, styles.rowMe]} accessibilityState={{ selected: true }}>
                    <Text style={[styles.rank, { fontFamily: fonts.fredoka700, color: colors.redText }]}>{pos}</Text>
                    <Avatar foto={c.foto} inicial={minhaInicial} style={[styles.rowAvatar, { backgroundColor: colors.red }]} textStyle={[styles.rowAvatarText, { color: colors.white }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.meName}>Você</Text>
                    </View>
                    <Text style={[styles.rowXp, { color: colors.redText }]}>{fmt(c.xp)} XP</Text>
                  </View>
                ) : (
                  <View key={`${c.nome}-${i}`} style={styles.row}>
                    <Text style={styles.rank}>{pos}</Text>
                    <Avatar
                      foto={c.foto}
                      inicial={c.inicial}
                      style={[styles.rowAvatar, i % 2 === 0 ? { backgroundColor: colors.redSoft } : styles.rowAvatarPlain]}
                      textStyle={[styles.rowAvatarText, i % 2 === 0 && { color: colors.redText }]}
                    />
                    <Text style={styles.rowName} numberOfLines={1}>
                      {c.nome}
                    </Text>
                    <Text style={styles.rowXp}>{fmt(c.xp)} XP</Text>
                  </View>
                );
              })}
            </View>
          )}
          {nuvem && membros && membros.length < 3 && <Text style={styles.dica}>Com 3 pessoas aparece o pódio. Chama a galera!</Text>}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Copiar código da sala ${turma.codigo}`}
              onPress={() => Clipboard.setStringAsync(turma.codigo).then(() => setSheet('copiado'))}
              style={styles.code}
            >
              <Text style={styles.codeText}>{turma.codigo}</Text>
              <CopyIcon size={20} color={colors.redText} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => Share.share({ message: `Entra na nossa turma no Fera! Código ${turma.codigo}\n${linkDaTurma(turma.codigo)}` })}
              style={({ pressed }) => [
                styles.invite,
                { boxShadow: pressed ? 'none' : solidShadow(colors.border), transform: [{ translateY: pressed ? sizes.shadow : 0 }] },
              ]}
            >
              <ShareIcon size={20} color={colors.redText} />
              <Text style={styles.inviteText}>Convidar a turma</Text>
            </Pressable>
          </View>

          {nuvem && <ProvasDaTurma codigo={turma.codigo} />}
        </>
      )}

      {sheet === 'turmas' && (
        <BottomSheet onClose={() => setSheet((x) => (x === 'turmas' ? null : x))}>
          {(close) => (
            <>
              <Text style={styles.sheetTitle}>Suas turmas</Text>
              <View>
                {(nuvem ? turmas : turmas.length ? turmas : [TURMA_EXEMPLO]).map((t) => {
                  const on = t.codigo === turma?.codigo;
                  return (
                    <Pressable
                      key={t.codigo}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      onPress={() => close(() => app.setTurma(t))}
                      style={styles.turmaRow}
                    >
                      <View style={[styles.radio, on && styles.radioOn]}>{on && <CheckIcon size={14} color={colors.white} />}</View>
                      <Text style={[styles.turmaName, on && { color: colors.redText }]}>{t.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <FeraButton label="Entrar em outra turma" variant="secondary" onPress={() => close(() => abrir('codigo'))} />
              {nuvem && <FeraButton label="Criar turma" variant="secondary" onPress={() => close(() => abrir('criar'))} />}
            </>
          )}
        </BottomSheet>
      )}
      {sheet === 'codigo' && (
        <TextInputSheet
          title="Código da turma"
          placeholder="Ex.: FERA-72K"
          autoCapitalize="characters"
          maxLength={12}
          button="Entrar"
          onSubmit={entrar}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'nome' && (
        <TextInputSheet
          title="Como a turma vai te chamar?"
          placeholder="Seu nome ou apelido"
          maxLength={30}
          onSubmit={(nome) => {
            app.setNome(nome);
            setDepoisDoNome(null);
            if (depoisDoNome === 'convite') {
              setSheet(null);
              if (convitePendente) entrar(convitePendente);
              setConvitePendente(null);
            } else setSheet(depoisDoNome);
          }}
          onClose={() => setSheet((x) => (x === 'nome' ? null : x))}
        />
      )}
      {sheet === 'criar' && (
        <TextInputSheet title="Nome da turma" placeholder="Ex.: 2º B · Matemática" maxLength={40} button="Criar" onSubmit={criar} onClose={() => setSheet(null)} />
      )}
      {sheet === 'copiado' && turma && (
        <InfoSheet
          mood="comemorando"
          title="Código copiado!"
          text={`Manda o ${turma.codigo} pra galera entrar na sala.`}
          button="Beleza"
          onClose={() => setSheet(null)}
        />
      )}
      {conviteAberto && !sheet && (
        <InfoSheet
          mood="acenando"
          title={`Entrar na turma ${conviteAberto}?`}
          text="Te chamaram pra estudar junto: ranking da sala e as provas que a galera já gerou."
          button="Entrar"
          onConfirm={() => aceitarConvite(conviteAberto)}
          secondary={{ label: 'Agora não' }}
          onClose={() => setDispensado(conviteAberto)}
        />
      )}
      {aviso && <InfoSheet mood="pensativo" title="Opa!" text={aviso} button="Beleza" onClose={() => setAviso(null)} />}
    </ScrollView>
  );
}

type ColumnProps = (typeof PODIUM)[number] & { colega: Colega };

function PodiumColumn({ colega, place, delay, bar, avatar, avatarBg, avatarText, ring, ringWidth, letter }: ColumnProps) {
  // riseA .6s: a barra cresce de baixo pra cima (3º, 2º, 1º).
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.set(withDelay(delay, withTiming(1, { duration: 600, easing: riseEasing })));
  }, [rise, delay]);
  const riseStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: rise.value }], transformOrigin: '50% 100%' }));

  // Avatar sem box-sizing: border-box no design → borda branca de 3 soma ao tamanho.
  const size = avatar + 6;
  return (
    <View style={styles.column}>
      {place === 1 && <CrownIcon />}
      <Avatar
        foto={colega.foto}
        inicial={colega.inicial}
        style={[
          styles.avatar,
          place === 1 && { marginTop: 2 },
          { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarBg, boxShadow: `0px 0px 0px ${ringWidth}px ${ring}` },
        ]}
        textStyle={[styles.avatarText, { fontSize: letter, color: avatarText }]}
      />
      <Text style={styles.podiumName}>{colega.nome}</Text>
      <Text style={styles.podiumXp}>{fmt(colega.xp)} XP</Text>
      <Animated.View
        style={[
          styles.bar,
          { height: bar },
          place === 1 && { backgroundColor: colors.red },
          place === 2 && { backgroundColor: colors.redSoft },
          place === 3 && styles.barThird,
          riseStyle,
        ]}
      >
        <Text
          style={[
            styles.barText,
            place === 1 && { fontSize: 32, color: colors.white },
            place === 2 && { fontSize: 28, color: colors.redText },
            place === 3 && { fontSize: 26, color: colors.textMuted },
          ]}
        >
          {place}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  titleRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.screenTitle, lineHeight: 31, color: colors.text },
  classPicker: {
    height: 40,
    paddingLeft: 14,
    paddingRight: 12,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classText: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  subtitle: { marginTop: 4, fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  podium: { marginTop: 14, height: 222, zIndex: 1 },
  podiumRow: { position: 'absolute', left: 0, right: 0, top: 0, minHeight: 222, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  column: { flex: 1, alignItems: 'center' },
  avatar: { borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.fredoka600 },
  podiumName: { marginTop: 6, fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  podiumXp: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  bar: { marginTop: 8, alignSelf: 'stretch', borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center', paddingTop: 10 },
  barThird: {
    backgroundColor: colors.offWhite,
    borderWidth: sizes.borderWidth,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingTop: 6,
  },
  barText: { fontFamily: fonts.fredoka700 },
  list: { padding: 8, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, gap: 4 },
  row: { height: 56, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowMe: {
    height: 60,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    backgroundColor: colors.redSoft,
    borderWidth: sizes.borderWidth,
    borderColor: colors.red,
  },
  rank: { width: 20, fontFamily: fonts.fredoka600, fontSize: 18, color: colors.textMuted },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowAvatarPlain: { backgroundColor: colors.offWhite, borderWidth: sizes.borderWidth, borderColor: colors.border },
  rowAvatarText: { fontFamily: fonts.fredoka600, fontSize: 18, color: colors.text },
  meName: { fontFamily: fonts.nunito900, fontSize: 16, color: colors.text },
  rowName: { flex: 1, fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  rowXp: { fontFamily: fonts.fredoka600, fontSize: 17, color: colors.textMuted },
  actions: { marginTop: 14, flexDirection: 'row', gap: 10 },
  code: {
    height: 56,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderStyle: 'dashed',
    borderColor: colors.red,
    backgroundColor: colors.offWhite,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: { fontFamily: fonts.fredoka700, fontSize: 18, letterSpacing: 1.5, color: colors.redText },
  invite: {
    flex: 1,
    height: 56,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetTitle: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text },
  semTurma: { marginTop: 20, gap: 12 },
  semTurmaText: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 22, color: colors.textMuted, marginBottom: 4 },
  dica: { marginTop: 10, fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  turmaRow: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: sizes.borderWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderWidth: 0, backgroundColor: colors.red },
  turmaName: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  inviteText: { flexShrink: 1, textAlign: 'center', fontFamily: fonts.nunito900, fontSize: 15, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.redText },
});
