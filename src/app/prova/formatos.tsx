// Escolha dos formatos de estudo (prévia — sem design no canvas). Vem depois de "Manda o conteúdo" (04).
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { CheckIcon, CrownIcon } from '@/components/icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TapScale } from '@/components/TapScale';
import { FORMATOS, LIMITE_FORMATOS, type Formato, type FormatoId } from '@/data/formatos';
import { app, useApp } from '@/data/store';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

export default function Formatos() {
  const insets = useSafeAreaInsets();
  const { premium, prova } = useApp();
  const limite = premium ? LIMITE_FORMATOS.premium : LIMITE_FORMATOS.gratis;
  const [escolhidos, setEscolhidos] = useState<FormatoId[]>(() => (prova.formatos as FormatoId[]).filter((id) => premium || !FORMATOS.find((f) => f.id === id)?.premium).slice(0, limite));

  const toggle = (f: Formato) => {
    if (f.premium && !premium) {
      router.push('/premium');
      return;
    }
    setEscolhidos((atual) => {
      if (atual.includes(f.id)) return atual.filter((id) => id !== f.id);
      // No limite, o mais antigo sai pra dar lugar ao novo.
      return atual.length >= limite ? [...atual.slice(1), f.id] : [...atual, f.id];
    });
  };

  const gerar = () => {
    app.setProva({ formatos: escolhidos });
    router.push('/prova/gerando');
  };

  const gratis = FORMATOS.filter((f) => !f.premium);
  const pagos = FORMATOS.filter((f) => f.premium);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}>
      <ScreenHeader title="Nova prova" />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Como você quer estudar?</Text>
        <Text style={styles.subtitle}>
          Escolha até {limite} formatos. A IA monta tudo a partir do seu conteúdo de {prova.materia}.
        </Text>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {escolhidos.length} de {limite} escolhidos
          </Text>
        </View>

        <Text style={styles.section}>Grátis</Text>
        <Grid items={gratis} escolhidos={escolhidos} premium={premium} onPress={toggle} />

        <View style={styles.sectionRow}>
          <CrownIcon width={24} height={18} />
          <Text style={[styles.section, { marginTop: 0, marginBottom: 0 }]}>Fera+</Text>
          {!premium && <Text style={styles.sectionHint}>toque pra conhecer</Text>}
        </View>
        <Grid items={pagos} escolhidos={escolhidos} premium={premium} onPress={toggle} />
      </ScrollView>

      <FeraButton label="Gerar materiais" disabled={escolhidos.length === 0} onPress={gerar} />
    </View>
  );
}

function Grid({ items, escolhidos, premium, onPress }: { items: Formato[]; escolhidos: FormatoId[]; premium: boolean; onPress: (f: Formato) => void }) {
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, r) => items.slice(r * 2, r * 2 + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row, r) => (
        <View key={r} style={styles.gridRow}>
          {row.map((f) => {
            const on = escolhidos.includes(f.id);
            const bloqueado = f.premium && !premium;
            return (
              <TapScale
                key={f.id}
                scale={0.96}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: bloqueado }}
                accessibilityLabel={bloqueado ? `${f.nome}, Fera+` : f.nome}
                onPress={() => onPress(f)}
                style={[styles.card, on && styles.cardOn]}
              >
                <View style={[styles.cardIcon, on && { backgroundColor: colors.red }, bloqueado && { backgroundColor: colors.offWhite }]}>
                  {f.icone(on ? colors.white : bloqueado ? colors.lockedIcon : colors.red)}
                </View>
                <Text style={[styles.cardName, bloqueado && { color: colors.textMuted }]}>{f.nome}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {f.descricao}
                </Text>
                {on && (
                  <View style={styles.check}>
                    <CheckIcon size={14} color={colors.white} />
                  </View>
                )}
                {bloqueado && (
                  <View style={styles.plusTag}>
                    <Text style={styles.plusTagText}>Fera+</Text>
                  </View>
                )}
              </TapScale>
            );
          })}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  body: { flex: 1, marginHorizontal: -space.gutter },
  bodyContent: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  title: { ...type.screenTitle, marginTop: 20, lineHeight: 31, color: colors.text },
  subtitle: { marginTop: 6, fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  counter: { alignSelf: 'flex-start', marginTop: 14, height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  counterText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 0.5, color: colors.redText },
  section: { marginTop: 22, marginBottom: 12, fontFamily: fonts.nunito900, fontSize: 18, color: colors.text },
  sectionRow: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionHint: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    minHeight: 124,
    borderRadius: radius.option,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 14,
    gap: 4,
  },
  cardOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  cardName: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  cardDesc: { fontFamily: fonts.nunito700, fontSize: 13, lineHeight: 17, color: colors.textMuted },
  check: {
    position: 'absolute',
    top: -8,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
    borderWidth: sizes.borderWidth,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusTag: { position: 'absolute', top: 12, right: 12, height: 22, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: colors.red, justifyContent: 'center' },
  plusTagText: { fontFamily: fonts.fredoka700, fontSize: 12, color: colors.white },
});
