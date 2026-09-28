// Materiais da prova (prévia — sem design no canvas). Tudo que a IA gerou pros formatos escolhidos.
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { ChevronRightIcon, CrownIcon, PlusIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { ProvaCard } from '@/components/ProvaCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useConteudo } from '@/data/conteudo';
import { FORMATOS, LIMITE_FORMATOS, type Formato } from '@/data/formatos';
import { gerarFormato } from '@/data/geracao';
import { diasAte, provaAtualDe, proximaMissao, useApp } from '@/data/store';
import { nomeDoModelo } from '@/lib/modelos';
import { colors, fonts, radius, sizes, solidShadow, space } from '@/theme';

export default function Materiais() {
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const { premium } = estado;
  const prova = provaAtualDe(estado);
  const { conteudo } = useConteudo(prova?.id ?? null);
  const [aviso, setAviso] = useState<{ title: string; text: string; premium?: boolean } | null>(null);
  const [criando, setCriando] = useState<string | null>(null);
  const limite = premium ? LIMITE_FORMATOS.premium : LIMITE_FORMATOS.gratis;

  if (!prova) {
    return (
      <View style={[styles.screen, styles.content, { paddingTop: insets.top + sizes.topExtra }]}>
        <ScreenHeader title="Materiais" />
        <Text style={[styles.hint, { marginTop: 24 }]}>Você ainda não mandou o conteúdo de nenhuma prova.</Text>
        <FeraButton label="Mandar o conteúdo" onPress={() => router.replace('/prova/nova')} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const escolhidos = prova.formatos.filter((f) => !FORMATOS.find((x) => x.id === f)?.sempre);
  const meus = FORMATOS.filter((f) => f.sempre || prova.formatos.includes(f.id));
  const outros = FORMATOS.filter((f) => !f.sempre && !prova.formatos.includes(f.id));
  const proxima = proximaMissao(prova);

  const abrir = (f: Formato) => {
    if (f.id === 'quiz') return router.push(`/missao/${proxima ?? 1}`);
    if (f.id === 'teste' || f.id === 'simulado') return router.push(`/missao/${f.id}`);
    router.push(`/material/${f.id}`);
  };

  const adicionar = async (f: Formato) => {
    if (criando) return;
    if (f.premium && !premium) return router.push('/premium');
    if (escolhidos.length >= limite)
      return setAviso({
        title: 'Limite de formatos',
        text: premium ? 'Você já tem 4 formatos nessa prova.' : 'No plano grátis são 2 formatos por prova. Com o Fera+ dá pra ter até 4.',
        premium: !premium,
      });
    setCriando(f.id);
    const erro = await gerarFormato(prova, f.id);
    setCriando(null);
    if (erro) setAviso({ title: 'Não rolou', text: erro });
  };

  const modelos = conteudo ? [...new Set(Object.values(conteudo.modelos).map((m) => nomeDoModelo(m ?? '')))] : [];
  const conferidas = conteudo?.revisao.conferidas ?? 0;
  const autoria =
    prova.modo === 'demo'
      ? 'Prova de exemplo (modo demonstração, sem IA ligada).'
      : modelos.length
        ? `Feitos por ${modelos.join(' e ')}${conferidas ? ` · ${conferidas} questões conferidas` : ''}.`
        : 'A IA montou a partir do conteúdo que você mandou.';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Materiais" />

      <ProvaCard style={{ marginTop: 20 }} materia={prova.materia} topico={prova.topico} data={prova.data} dias={diasAte(prova.data)} feitas={prova.feitas.length} total={prova.totalMissoes} />

      <Text style={styles.section}>Seus materiais</Text>
      <Text style={styles.hint}>{autoria}</Text>
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
              <Text style={styles.cardDesc}>
                {f.id === 'quiz'
                  ? proxima
                    ? `Missão ${proxima} de ${prova.totalMissoes} na trilha`
                    : 'Trilha completa!'
                  : f.pratica
                    ? `${(f.id === 'teste' ? conteudo?.teste : conteudo?.simulado)?.questoes.length ?? 0} questões`
                    : f.descricao}
              </Text>
            </View>
            <ChevronRightIcon size={22} strokeWidth={2.8} color={colors.red} />
          </Pressable>
        ))}
      </View>

      {!!conteudo?.avisos.length && (
        <View style={styles.avisos}>
          <Text style={styles.avisosTitle}>Recado da IA</Text>
          {conteudo.avisos.map((a) => (
            <Text key={a} style={styles.avisoText}>
              • {a}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.section}>Mais formatos</Text>
      <Text style={styles.hint}>
        {escolhidos.length} de {limite} usados{premium ? '' : ' · no Fera+ dá pra ter até 4'}
      </Text>
      <View style={styles.more}>
        {outros.map((f, i) => {
          const bloqueado = f.premium && !premium;
          return (
            <Pressable key={f.id} accessibilityRole="button" disabled={!!criando} onPress={() => adicionar(f)} style={[styles.moreRow, i > 0 && styles.moreDivider]}>
              <View style={[styles.moreIcon, bloqueado && { backgroundColor: colors.offWhite }]}>{f.icone(bloqueado ? colors.lockedIcon : colors.red)}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moreName, bloqueado && { color: colors.textMuted }]}>{f.nome}</Text>
                <Text style={styles.cardDesc}>{criando === f.id ? 'Criando…' : f.descricao}</Text>
              </View>
              {criando === f.id ? (
                <ActivityIndicator color={colors.red} />
              ) : bloqueado ? (
                <CrownIcon width={22} height={17} />
              ) : (
                <PlusIcon size={20} color={colors.redText} />
              )}
            </Pressable>
          );
        })}
      </View>

      {aviso && (
        <InfoSheet
          mood="pensativo"
          title={aviso.title}
          text={aviso.text}
          button={aviso.premium ? 'Conhecer o Fera+' : 'Entendi'}
          onConfirm={aviso.premium ? () => router.push('/premium') : undefined}
          onClose={() => setAviso(null)}
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
  avisos: { marginTop: 16, borderRadius: radius.card, backgroundColor: colors.offWhite, padding: 16, gap: 4 },
  avisosTitle: { fontFamily: fonts.nunito900, fontSize: 15, color: colors.text },
  avisoText: { fontFamily: fonts.nunito600, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  more: { marginTop: 12, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  moreRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  moreDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  moreIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  moreName: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
});
