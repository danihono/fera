// 10 · Turma (ranking) — canvas artboard Turma.dc.html
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, ChevronDownIcon, CopyIcon, CrownIcon, ShareIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { TextInputSheet } from '@/components/TextInputSheet';
import { StatPill } from '@/components/StatPill';
import { mockTurma, mockUser, type Colega } from '@/data/mock';
import { app, useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const fmt = (n: number) => n.toLocaleString('pt-BR');
const riseEasing = Easing.bezier(0.2, 0.9, 0.3, 1.1);

// Pódio: 2º, 1º, 3º da esquerda pra direita, com as cores do design.
const PODIUM = [
  { place: 2, delay: 150, bar: 70, avatar: 56, avatarBg: colors.successBg, avatarText: colors.successText, ring: colors.border, ringWidth: 2, letter: 22 },
  { place: 1, delay: 300, bar: 96, avatar: 68, avatarBg: colors.redSoft, avatarText: colors.redText, ring: colors.red, ringWidth: 3, letter: 26 },
  { place: 3, delay: 0, bar: 52, avatar: 56, avatarBg: colors.errorBg, avatarText: colors.errorText, ring: colors.border, ringWidth: 2, letter: 22 },
] as const;

export default function Turma() {
  const insets = useSafeAreaInsets();
  const t = mockTurma;
  const { prova, xp, turma, turmas, premium } = useApp();
  const [sheet, setSheet] = useState<null | 'turmas' | 'codigo' | 'copiado'>(null);
  const resto = t.ranking.slice(3);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stats}>
        <StatPill kind="streak" value={mockUser.streak} />
        <StatPill kind="xp" value={xp} />
        <StatPill kind="lives" value={premium ? '∞' : mockUser.lives} />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Turma</Text>
        <Pressable accessibilityRole="button" onPress={() => setSheet('turmas')} style={styles.classPicker}>
          <Text style={styles.classText}>{turma}</Text>
          <ChevronDownIcon size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Ranking até a prova · {shortDate(prova.data).toLowerCase()}</Text>

      {/* O pódio tem 222 de altura, mas o conteúdo é mais alto e desce por cima da lista (como no design). */}
      <View style={styles.podium}>
        <View style={styles.podiumRow}>
          {PODIUM.map((p) => (
            <PodiumColumn key={p.place} colega={t.ranking[p.place - 1]} {...p} />
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {resto.map((c, i) => {
          const pos = i + 4;
          const voce = pos - 1 === t.voce;
          return voce ? (
            <View key={c.nome} style={[styles.row, styles.rowMe]} accessibilityState={{ selected: true }}>
              <Text style={[styles.rank, { fontFamily: fonts.fredoka700, color: colors.redText }]}>{pos}</Text>
              <View style={[styles.rowAvatar, { backgroundColor: colors.red }]}>
                <Text style={[styles.rowAvatarText, { color: colors.white }]}>{mockUser.inicial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.meName}>Você</Text>
                <Text style={styles.meUp}>↑ subiu {t.subiuHoje} hoje</Text>
              </View>
              <Text style={[styles.rowXp, { color: colors.redText }]}>{fmt(c.xp)} XP</Text>
            </View>
          ) : (
            <View key={c.nome} style={styles.row}>
              <Text style={styles.rank}>{pos}</Text>
              <View style={[styles.rowAvatar, i % 2 === 0 ? { backgroundColor: colors.redSoft } : styles.rowAvatarPlain]}>
                <Text style={[styles.rowAvatarText, i % 2 === 0 && { color: colors.redText }]}>{c.inicial}</Text>
              </View>
              <Text style={styles.rowName}>{c.nome}</Text>
              <Text style={styles.rowXp}>{fmt(c.xp)} XP</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Copiar código da sala ${t.codigo}`}
          onPress={() => Clipboard.setStringAsync(t.codigo).then(() => setSheet('copiado'))}
          style={styles.code}
        >
          <Text style={styles.codeText}>{t.codigo}</Text>
          <CopyIcon size={20} color={colors.redText} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Share.share({ message: `Entra na nossa sala no Fera: ${t.codigo}` })}
          style={({ pressed }) => [
            styles.invite,
            { boxShadow: pressed ? 'none' : solidShadow(colors.border), transform: [{ translateY: pressed ? sizes.shadow : 0 }] },
          ]}
        >
          <ShareIcon size={20} color={colors.redText} />
          <Text style={styles.inviteText}>Convidar a turma</Text>
        </Pressable>
      </View>

      {sheet === 'turmas' && (
        <BottomSheet onClose={() => setSheet((x) => (x === 'turmas' ? null : x))}>
          {(close) => (
            <>
              <Text style={styles.sheetTitle}>Suas turmas</Text>
              <View>
                {turmas.map((nome) => {
                  const on = nome === turma;
                  return (
                    <Pressable
                      key={nome}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      onPress={() => close(() => app.setTurma(nome))}
                      style={styles.turmaRow}
                    >
                      <View style={[styles.radio, on && styles.radioOn]}>{on && <CheckIcon size={14} color={colors.white} />}</View>
                      <Text style={[styles.turmaName, on && { color: colors.redText }]}>{nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <FeraButton label="Entrar em outra turma" variant="secondary" onPress={() => close(() => setSheet('codigo'))} />
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
          onSubmit={(codigo) => app.entrarNaTurma(`Turma ${codigo.toUpperCase()}`)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'copiado' && (
        <InfoSheet
          mood="comemorando"
          title="Código copiado!"
          text={`Manda o ${t.codigo} pra galera entrar na sala.`}
          button="Beleza"
          onClose={() => setSheet(null)}
        />
      )}
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
      <View
        style={[
          styles.avatar,
          place === 1 && { marginTop: 2 },
          { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarBg, boxShadow: `0px 0px 0px ${ringWidth}px ${ring}` },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: letter, color: avatarText }]}>{colega.inicial}</Text>
      </View>
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
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  meUp: { fontFamily: fonts.nunito800, fontSize: 12, color: colors.successText },
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
  turmaRow: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: sizes.borderWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderWidth: 0, backgroundColor: colors.red },
  turmaName: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  inviteText: { flexShrink: 1, textAlign: 'center', fontFamily: fonts.nunito900, fontSize: 15, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.redText },
});
