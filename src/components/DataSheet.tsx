// Mudar a data da prova: mesmo calendário semanal da 02c (Onb3), dentro de uma sheet.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@/components/icons';
import { TapScale } from '@/components/TapScale';
import { MONTHS, WEEKDAYS_SHORT } from '@/lib/dates';
import { colors, fonts, radius, sizes, solidShadow } from '@/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

const faltam = (dias: number) => (dias === 1 ? 'Falta 1 dia.' : `Faltam ${dias} dias.`);

export function DataSheet({ data, onSalvar, onClose }: { data: Date; onSalvar: (d: Date) => void; onClose: () => void }) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const inicial = daysBetween(today, data) >= 1 ? data : addDays(today, 1);
  const [selected, setSelected] = useState(inicial);
  const [week, setWeek] = useState(Math.max(0, Math.floor(daysBetween(today, inicial) / 7)));
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, week * 7 + i));
  const daysLeft = daysBetween(today, selected);

  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <Text style={styles.titulo}>Nova data da prova</Text>
          <View style={styles.calendar}>
            <View style={styles.calHeader}>
              <Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" disabled={week === 0} onPress={() => setWeek((w) => w - 1)} style={styles.calNav}>
                <ChevronLeftIcon size={18} color={week === 0 ? colors.border : colors.textMuted} />
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
                    accessibilityLabel={`${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`}
                    accessibilityState={{ selected: on, disabled: isToday }}
                    disabled={isToday}
                    onPress={() => setSelected(d)}
                    style={[styles.day, on && styles.dayOn]}
                  >
                    <Text style={[styles.dayName, on && { color: colors.white }]}>{WEEKDAYS_SHORT[d.getDay()]}</Text>
                    <Text style={[styles.dayNum, on && styles.dayNumOn]}>{d.getDate()}</Text>
                    {isToday && <View style={styles.todayDot} />}
                  </TapScale>
                );
              })}
            </View>
            <View style={styles.countdown}>
              <FireIcon size={18} core={false} />
              <Text style={styles.countdownText}>{faltam(daysLeft)} O plano se ajusta.</Text>
            </View>
          </View>
          <FeraButton label="Salvar data" onPress={() => close(() => onSalvar(selected))} />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titulo: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text },
  calendar: {
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
  dayOn: { borderColor: colors.red, backgroundColor: colors.red, boxShadow: solidShadow(colors.redDeep) },
  dayName: { fontFamily: fonts.nunito800, fontSize: 12, color: colors.textMuted },
  dayNum: { fontFamily: fonts.fredoka600, fontSize: 20, color: colors.text },
  dayNumOn: { fontFamily: fonts.fredoka700, color: colors.white },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.red },
  countdown: { height: 36, borderRadius: radius.pill, backgroundColor: colors.offWhite, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  countdownText: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.text },
});
