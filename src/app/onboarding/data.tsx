// 02c · Onboarding — Data — canvas artboard Onb3.dc.html
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@/components/icons';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { Rugi } from '@/components/Rugi';
import { TapScale } from '@/components/TapScale';
import { colors, fonts, radius, sizes, solidShadow, space, type } from '@/theme';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

type Quick = { label: string; offset: (today: Date) => number };
const QUICK: Quick[] = [
  { label: 'Amanhã', offset: () => 1 },
  { label: 'Em 3 dias', offset: () => 3 },
  // Próxima segunda-feira (nunca hoje).
  { label: 'Semana que vem', offset: (today) => (8 - today.getDay()) % 7 || 7 },
];

const MINUTES = [
  { min: 5, label: 'Rapidinho' },
  { min: 10, label: 'Na medida' },
  { min: 15, label: 'Modo fera' },
];

export default function OnboardingData() {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // A semana mostrada começa hoje; o padrão é "Semana que vem", como no design.
  const [selected, setSelected] = useState(() => addDays(today, QUICK[2].offset(today)));
  const [week, setWeek] = useState(() => Math.floor(QUICK[2].offset(today) / 7));
  const [minutes, setMinutes] = useState(10);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, week * 7 + i));
  const daysLeft = daysBetween(today, selected);

  const pick = (offset: number) => {
    setSelected(addDays(today, offset));
    setWeek(Math.floor(offset / 7));
  };

  const finish = () => {
    if (router.canDismiss()) router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + sizes.topExtra,
          // O FeraButton já reserva os 4px da sombra embaixo dele.
          paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow,
        },
      ]}
    >
      <OnboardingHeader step={3} />

      <Text style={styles.title}>Quando é?</Text>

      <View style={styles.quickRow}>
        {QUICK.map((q) => {
          const offset = q.offset(today);
          const on = offset === daysLeft;
          return (
            <TapScale
              key={q.label}
              scale={0.95}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => pick(offset)}
              style={[styles.quick, on && styles.quickOn]}
            >
              <Text style={[styles.quickLabel, on && { color: colors.redText }]}>{q.label}</Text>
            </TapScale>
          );
        })}
      </View>

      <View style={styles.calendar}>
        <View style={styles.calHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Semana anterior"
            disabled={week === 0}
            onPress={() => setWeek((w) => w - 1)}
            style={styles.calNav}
          >
            <ChevronLeftIcon size={18} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.calMonth}>
            {MONTHS[days[0].getMonth()]} {days[0].getFullYear()}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Próxima semana" onPress={() => setWeek((w) => w + 1)} style={styles.calNav}>
            <ChevronRightIcon size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.days}>
          {days.map((d) => {
            const offset = daysBetween(today, d);
            const on = offset === daysLeft;
            const isToday = offset === 0;
            return (
              <TapScale
                key={d.getTime()}
                scale={0.95}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: isToday }}
                disabled={isToday}
                onPress={() => setSelected(d)}
                style={[styles.day, on && styles.dayOn]}
              >
                <Text style={[styles.dayName, on && { color: colors.white }]}>{WEEKDAYS[d.getDay()]}</Text>
                <Text style={[styles.dayNum, on && styles.dayNumOn]}>{d.getDate()}</Text>
                {isToday && <View style={styles.todayDot} />}
              </TapScale>
            );
          })}
        </View>

        <View style={styles.countdown}>
          <FireIcon size={18} core={false} />
          <Text style={styles.countdownText}>
            {daysLeft === 1 ? 'Falta 1 dia.' : `Faltam ${daysLeft} dias.`} Dá tempo de sobra.
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Quanto tempo por dia?</Text>

      <View style={styles.minutesRow}>
        {MINUTES.map(({ min, label }) => {
          const on = min === minutes;
          return (
            <TapScale
              key={min}
              scale={0.95}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setMinutes(min)}
              style={[styles.minute, on && styles.minuteOn]}
            >
              <Text style={[styles.minuteNum, on && styles.minuteNumOn]}>
                {min}
                <Text style={styles.minuteUnit}> min</Text>
              </Text>
              <Text style={[styles.minuteLabel, on && styles.minuteLabelOn]}>{label}</Text>
            </TapScale>
          );
        })}
      </View>

      <View style={styles.rugiRow}>
        <Rugi mood="forca" width={66} accessibilityLabel="Rugi" />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Relaxa, eu monto o plano.</Text>
        </View>
      </View>

      <FeraButton label="Criar minha trilha" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  title: { ...type.screenTitle, marginTop: 22, lineHeight: 31, color: colors.text },
  quickRow: { marginTop: 16, flexDirection: 'row', gap: 8 },
  quick: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  quickOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  quickLabel: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  calendar: {
    marginTop: 18,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  calNav: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  calMonth: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 70,
    borderRadius: radius.button,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // No design o selecionado não tem borda; a borda da mesma cor mantém as 7 colunas com a mesma largura.
  dayOn: { borderColor: colors.red, backgroundColor: colors.red, boxShadow: solidShadow(colors.redDeep) },
  dayName: { fontFamily: fonts.nunito800, fontSize: 12, color: colors.textMuted },
  dayNum: { fontFamily: fonts.fredoka600, fontSize: 20, color: colors.text },
  dayNumOn: { fontFamily: fonts.fredoka700, color: colors.white },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.red },
  countdown: {
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.offWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  countdownText: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
  subtitle: { ...type.cardTitle, marginTop: 24, color: colors.text },
  minutesRow: { marginTop: 12, flexDirection: 'row', gap: 10 },
  minute: {
    flex: 1,
    height: 92,
    borderRadius: radius.option,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  minuteOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  minuteNum: { fontFamily: fonts.fredoka600, fontSize: 30, lineHeight: 30, color: colors.text },
  minuteNumOn: { fontFamily: fonts.fredoka700, color: colors.red },
  minuteUnit: { fontSize: 16, lineHeight: 16 },
  minuteLabel: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  minuteLabelOn: { fontFamily: fonts.nunito800, color: colors.redText },
  rugiRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingBottom: 14 },
  bubble: {
    marginBottom: 34,
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
});
