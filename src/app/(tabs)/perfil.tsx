// 12 · Perfil — canvas artboard Perfil.dc.html
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoltIcon, ExamsFilledIcon, FireIcon, GearIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { MedalGrid } from '@/components/Medal';
import { ProgressBar } from '@/components/ProgressBar';
import { conquistasDe, type Conquista } from '@/data/conquistas';
import { diasAte, nivelDe, nomeDe, streakAtual, useApp, XP_POR_NIVEL } from '@/data/store';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const { premium, xp, serie, turma, provas } = estado;
  const nome = nomeDe(estado);
  const n = nivelDe(xp);
  const faltam = XP_POR_NIVEL - n.noNivel;
  const usuario = `@${nome.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'fera'}`;
  const provasFeitas = provas.filter((p) => diasAte(p.data) < 0).length;
  const [medalha, setMedalha] = useState<Conquista | null>(null);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/premium')}
            style={({ pressed }) => [
              styles.plus,
              { boxShadow: pressed ? 'none' : solidShadow(colors.redDeep, 3), transform: [{ translateY: pressed ? 3 : 0 }] },
            ]}
          >
            <Text style={styles.plusText}>{premium ? 'Fera+ ✓' : 'Fera+'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Configurações" onPress={() => router.push('/configuracoes')} style={styles.gear}>
            <GearIcon size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.identity}>
        <View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{n.nivel}</Text>
          </View>
        </View>
        <View style={styles.identityTexts}>
          <Text style={styles.name}>{nome}</Text>
          <Text style={styles.handle} numberOfLines={1}>
            {usuario} · {turma?.nome ?? serie}
          </Text>
          <View style={styles.levelTag}>
            <Text style={styles.levelTagText}>
              Nível {n.nivel} · {n.titulo}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.levelBlock}>
        <View style={{ flexDirection: 'row' }}>
          <ProgressBar height={14} shine={3} progress={n.noNivel / XP_POR_NIVEL} accessibilityLabel={`Nível ${n.nivel}`} />
        </View>
        <Text style={styles.levelLeft}>
          {faltam} XP pro nível {n.nivel + 1}
        </Text>
      </View>

      <View style={styles.cards}>
        <StatCard icon={<FireIcon size={26} core={false} />} value={String(streakAtual(estado))} label="dias seguidos" />
        <StatCard icon={<BoltIcon size={26} />} value={fmt(xp)} label="XP total" />
        <StatCard icon={<ExamsFilledIcon size={26} />} value={String(provasFeitas)} label="provas feitas" />
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Conquistas</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/conquistas')} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Ver todas</Text>
        </Pressable>
      </View>

      <View style={styles.medals}>
        <MedalGrid items={conquistasDe(estado).slice(0, 8)} onPress={setMedalha} />
      </View>

      {medalha && (
        <InfoSheet
          mood={medalha.bloqueada ? 'pensativo' : 'trofeu'}
          title={medalha.nomeLongo ?? medalha.nome}
          text={medalha.bloqueada ? `Bloqueada. ${medalha.descricao}` : medalha.descricao}
          button={medalha.bloqueada ? 'Bora conseguir' : 'Show!'}
          onClose={() => setMedalha(null)}
        />
      )}
    </ScrollView>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.card}>
      {icon}
      <View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.screenTitle, color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plus: { height: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.red, justifyContent: 'center' },
  plusText: { fontFamily: fonts.fredoka700, fontSize: 16, color: colors.white },
  gear: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  // 84 + borda de 4 (sem border-box no design) = 92.
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.red,
    borderWidth: 4,
    borderColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.fredoka700, fontSize: 36, color: colors.white },
  levelBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: { fontFamily: fonts.fredoka700, fontSize: 15, color: colors.redText },
  identityTexts: { gap: 4 },
  name: { fontFamily: fonts.nunito900, fontSize: 22, color: colors.text },
  handle: { fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
  levelTag: { alignSelf: 'flex-start', marginTop: 2, height: 26, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  levelTagText: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.redText },
  levelBlock: { marginTop: 16, gap: 6 },
  levelLeft: { alignSelf: 'flex-end', fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  cards: { marginTop: 14, flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    height: 104,
    borderRadius: radius.option,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardValue: { fontFamily: fonts.fredoka700, fontSize: 28, lineHeight: 28, color: colors.text },
  cardLabel: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  sectionRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
  seeAll: { minHeight: 44, justifyContent: 'center' },
  seeAllText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.redText },
  medals: { marginTop: 4 },
});
