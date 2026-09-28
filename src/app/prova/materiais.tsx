// Materiais da prova (prévia — sem design no canvas). Tudo que a IA gerou pros formatos escolhidos.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, CrownIcon, PlusIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { ProvaCard } from '@/components/ProvaCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FORMATOS, LIMITE_FORMATOS, type Formato } from '@/data/formatos';
import { mockProva } from '@/data/mock';
import { app, diasAte, useApp } from '@/data/store';
import { colors, fonts, radius, sizes, solidShadow, space } from '@/theme';

export default function Materiais() {
  const insets = useSafeAreaInsets();
  const { prova, premium } = useApp();
  const [aviso, setAviso] = useState(false);
  const limite = premium ? LIMITE_FORMATOS.premium : LIMITE_FORMATOS.gratis;
  const meus = FORMATOS.filter((f) => prova.formatos.includes(f.id));
  const outros = FORMATOS.filter((f) => !prova.formatos.includes(f.id));

  const abrir = (f: Formato) => (f.pratica ? router.push(`/missao/${mockProva.missaoAtual}`) : router.push(`/material/${f.id}`));

  const adicionar = (f: Formato) => {
    if (f.premium && !premium) return router.push('/premium');
    if (prova.formatos.length >= limite) return setAviso(true);
    app.setProva({ formatos: [...prova.formatos, f.id] });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Materiais" />

      <ProvaCard
        style={{ marginTop: 20 }}
        materia={prova.materia}
        topico={prova.topico}
        data={prova.data}
        dias={diasAte(prova.data)}
        feitas={mockProva.missoesFeitas}
        total={mockProva.missoesTotal}
      />

      <Text style={styles.section}>Seus materiais</Text>
      <Text style={styles.hint}>A IA montou a partir do conteúdo que você mandou.</Text>
      <View style={{ gap: 12, marginTop: 12 }}>
        {meus.map((f) => (
          <Pressable
            key={f.id}
            accessibilityRole="button"
            onPress={() => abrir(f)}
            style={({ pressed }) => [styles.card, { boxShadow: pressed ? 'none' : solidShadow(colors.border), transform: [{ translateY: pressed ? sizes.shadow : 0 }] }]}
          >
            <View style={styles.cardIcon}>{f.icone(colors.white)}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{f.nome}</Text>
              <Text style={styles.cardDesc}>{f.pratica ? 'Abre as missões na trilha' : f.descricao}</Text>
            </View>
            <ChevronRightIcon size={22} strokeWidth={2.8} color={colors.red} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Mais formatos</Text>
      <Text style={styles.hint}>
        {prova.formatos.length} de {limite} usados{premium ? '' : ' · no Fera+ dá pra ter até 4'}
      </Text>
      <View style={styles.more}>
        {outros.map((f, i) => {
          const bloqueado = f.premium && !premium;
          return (
            <Pressable key={f.id} accessibilityRole="button" onPress={() => adicionar(f)} style={[styles.moreRow, i > 0 && styles.moreDivider]}>
              <View style={[styles.moreIcon, bloqueado && { backgroundColor: colors.offWhite }]}>{f.icone(bloqueado ? colors.lockedIcon : colors.red)}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moreName, bloqueado && { color: colors.textMuted }]}>{f.nome}</Text>
                <Text style={styles.cardDesc}>{f.descricao}</Text>
              </View>
              {bloqueado ? <CrownIcon width={22} height={17} /> : <PlusIcon size={20} color={colors.redText} />}
            </Pressable>
          );
        })}
      </View>

      {aviso && (
        <InfoSheet
          mood="pensativo"
          title="Limite de formatos"
          text={premium ? 'Você já tem 4 formatos nessa prova.' : 'No plano grátis são 2 formatos por prova. Com o Fera+ dá pra ter até 4.'}
          button={premium ? 'Entendi' : 'Conhecer o Fera+'}
          onConfirm={premium ? undefined : () => router.push('/premium')}
          onClose={() => setAviso(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  section: { marginTop: 26, fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
  hint: { marginTop: 2, fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted },
  card: {
    minHeight: 84,
    borderRadius: radius.card,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontFamily: fonts.nunito800, fontSize: 19, color: colors.text },
  cardDesc: { fontFamily: fonts.nunito600, fontSize: 14, color: colors.textMuted },
  more: { marginTop: 12, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  moreRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  moreDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  moreIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  moreName: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
});
