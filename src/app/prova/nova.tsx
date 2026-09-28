// 04 · Nova prova — canvas artboard NovaProva.dc.html
import { router } from 'expo-router';
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  FileIcon,
  PencilIcon,
  SubjectIcon,
} from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import { SquareButton } from '@/components/SquareButton';
import { useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const STEPS = ['Matéria', 'Data', 'Conteúdo'];
const CURRENT = 2;

export default function NovaProva() {
  const insets = useSafeAreaInsets();
  const { prova } = useApp();
  const gerar = () => router.push('/prova/gerando');

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra },
      ]}
    >
      <View style={styles.header}>
        <SquareButton label="Fechar" onPress={() => router.back()}>
          <CloseIcon size={20} />
        </SquareButton>
        <Text style={styles.headerTitle}>Nova prova</Text>
        <View style={{ width: sizes.touch }} />
      </View>

      <View style={styles.steps} accessibilityLabel="Etapas">
        {STEPS.map((label, i) => (
          <Fragment key={label}>
            {i > 0 && <View style={styles.stepLine} />}
            <View style={styles.step}>
              {i < CURRENT ? (
                <View style={styles.stepDone}>
                  <CheckIcon size={16} color={colors.white} />
                </View>
              ) : (
                <View style={styles.stepCurrent}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                </View>
              )}
              <Text style={[styles.stepLabel, i === CURRENT && styles.stepLabelCurrent]}>{label}</Text>
            </View>
          </Fragment>
        ))}
      </View>

      <View style={styles.chips}>
        <View style={styles.chip}>
          <SubjectIcon subject={prova.icone} size={18} color={colors.red} />
          <Text style={styles.chipText}>{prova.materia}</Text>
        </View>
        <View style={styles.chip}>
          <CalendarIcon size={18} color={colors.red} />
          <Text style={styles.chipText}>{shortDate(prova.data)}</Text>
        </View>
      </View>

      <Text style={styles.title}>Manda o conteúdo</Text>
      <Text style={styles.subtitle}>O que vai cair na prova. Pode ser mais de um.</Text>

      <View style={styles.options}>
        <OptionCard
          highlighted
          icon={<CameraIcon size={28} color={colors.white} />}
          title="Tirar foto"
          description="Do caderno, livro ou lousa"
          badge="Mais rápido"
          onPress={gerar}
        />
        <OptionCard icon={<FileIcon size={28} color={colors.red} />} title="Enviar PDF" description="Slides, apostila ou resumo" onPress={gerar} />
        <OptionCard
          icon={<PencilIcon size={28} color={colors.red} />}
          title="Escrever ou colar"
          description="Tópicos, texto ou matéria do quadro"
          onPress={gerar}
        />
      </View>

      <View style={styles.rugiRow}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Manda que eu resolvo.</Text>
        </View>
        <Rugi mood="forca" width={108} accessibilityLabel="Rugi confiante" />
      </View>
    </View>
  );
}

type OptionProps = { icon: ReactNode; title: string; description: string; badge?: string; highlighted?: boolean; onPress: () => void };

/** Card de opção: sombra sólida 4px; ao tocar, afunda 4px e a sombra some. */
function OptionCard({ icon, title, description, badge, highlighted, onPress }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlighted && { borderColor: colors.red },
        {
          boxShadow: pressed ? 'none' : solidShadow(highlighted ? colors.trailDone : colors.border),
          transform: [{ translateY: pressed ? sizes.shadow : 0 }],
        },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: highlighted ? colors.red : colors.redSoft }]}>{icon}</View>
      <View style={styles.cardTexts}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRightIcon size={22} strokeWidth={2.8} color={highlighted ? colors.red : colors.iconMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  header: { height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: fonts.nunito800, fontSize: 17, color: colors.text },
  // Cada item cresce a partir do próprio conteúdo (flex-grow: 1), como no <ol> do design.
  steps: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-start' },
  stepLine: { flexGrow: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.red, marginTop: 14 },
  step: { flexGrow: 1, alignItems: 'center', gap: 6 },
  stepDone: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  stepCurrent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.redSoft,
    borderWidth: 3,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { fontFamily: fonts.fredoka700, fontSize: 15, color: colors.red },
  stepLabel: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.text },
  stepLabelCurrent: { fontFamily: fonts.nunito900, color: colors.redText },
  chips: { marginTop: 22, flexDirection: 'row', gap: 8 },
  chip: {
    height: 34,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.offWhite,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  title: { ...type.screenTitle, marginTop: 22, lineHeight: 31, color: colors.text },
  subtitle: { marginTop: 6, fontFamily: fonts.nunito600, fontSize: 15, color: colors.textMuted },
  options: { marginTop: 20, gap: 14 },
  card: {
    minHeight: 92,
    borderRadius: radius.card,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardTexts: { flex: 1, gap: 2 },
  cardTitle: { ...type.cardTitle, color: colors.text },
  cardDescription: { fontFamily: fonts.nunito600, fontSize: 14, color: colors.textMuted },
  badge: {
    position: 'absolute',
    top: -12,
    right: 16,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.nunito900, fontSize: 12, color: colors.white },
  rugiRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  bubble: {
    marginBottom: 64,
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleText: { fontFamily: fonts.fredoka600, fontSize: 20, color: colors.text },
});
