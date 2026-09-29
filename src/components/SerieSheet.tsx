import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { CheckIcon } from '@/components/icons';
import { app, SERIES } from '@/data/store';
import { colors, fonts, sizes } from '@/theme';

/** Escolha do ano escolar (Configurações e Minha conta). */
export function SerieSheet({ serie, onClose }: { serie: string; onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <Text style={styles.titulo}>Ano escolar</Text>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {SERIES.map((s) => {
              const on = s === serie;
              return (
                <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => close(() => app.setSerie(s))} style={styles.linha}>
                  <View style={[styles.radio, on && styles.radioOn]}>{on && <CheckIcon size={14} color={colors.white} />}</View>
                  <Text style={[styles.texto, on && { color: colors.redText }]}>{s}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titulo: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text, marginBottom: 4 },
  linha: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: sizes.borderWidth, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderWidth: 0, backgroundColor: colors.red },
  texto: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
});
