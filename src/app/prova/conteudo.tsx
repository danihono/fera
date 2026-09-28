// Conteúdo da prova (prévia — sem design no canvas): confere as fotos, PDFs e textos antes de gerar.
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { CameraIcon, CloseIcon, FileIcon, ImageIcon, PencilIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Rugi } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { adicionarTexto, escolherFotos, escolherPdf, LIMITE_BYTES, remover, tirarFoto, totalBytes, useRascunho, type Item } from '@/data/rascunho';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const mb = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`);

export default function Conteudo() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ texto?: string }>();
  const itens = useRascunho();
  const [escrevendo, setEscrevendo] = useState(params.texto === '1');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const fotos = itens.filter((i) => i.tipo === 'foto');
  const outros = itens.filter((i) => i.tipo !== 'foto');

  const acao = (f: () => Promise<boolean>) => () => f().catch((e: Error) => setErro(e.message || 'Não deu pra abrir. Tenta de novo.'));
  const salvarTexto = () => {
    try {
      adicionarTexto(texto);
      setTexto('');
      setEscrevendo(false);
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}
    >
      <ScreenHeader title="Nova prova" />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Seu conteúdo</Text>
        <Text style={styles.subtitle}>Confere se dá pra ler. Pode mandar mais de um jeito.</Text>

        {fotos.length > 0 && (
          <View style={styles.grid}>
            {fotos.map((f) => (
              <View key={f.id} style={styles.thumb}>
                <Image source={{ uri: f.tipo === 'foto' ? f.uri : undefined }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={f.tipo === 'foto' ? f.nome : ''} />
                <RemoveButton item={f} />
              </View>
            ))}
          </View>
        )}

        {outros.length > 0 && (
          <View style={styles.list}>
            {outros.map((i, k) => (
              <View key={i.id} style={[styles.row, k > 0 && styles.rowDivider]}>
                <View style={styles.rowIcon}>{i.tipo === 'pdf' ? <FileIcon size={22} /> : <PencilIcon size={22} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {i.tipo === 'pdf' ? i.nome : 'Texto'}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {i.tipo === 'pdf' ? mb(i.bytes) : i.tipo === 'texto' ? i.texto : ''}
                  </Text>
                </View>
                <RemoveButton item={i} inline />
              </View>
            ))}
          </View>
        )}

        {escrevendo ? (
          <View style={styles.editor}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Cola aqui o texto, os tópicos ou a matéria do quadro…"
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
              textAlignVertical="top"
              style={styles.input}
              accessibilityLabel="Texto da matéria"
            />
            <View style={styles.editorActions}>
              <FeraButton label="Cancelar" variant="secondary" onPress={() => setEscrevendo(false)} style={{ flex: 1 }} />
              <FeraButton label="Adicionar" disabled={!texto.trim()} onPress={salvarTexto} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <View style={styles.add}>
            <AddChip icon={<CameraIcon size={20} color={colors.red} />} label="Câmera" onPress={acao(tirarFoto)} />
            <AddChip icon={<ImageIcon size={20} />} label="Galeria" onPress={acao(escolherFotos)} />
            <AddChip icon={<FileIcon size={20} />} label="PDF" onPress={acao(escolherPdf)} />
            <AddChip icon={<PencilIcon size={20} />} label="Texto" onPress={() => setEscrevendo(true)} />
          </View>
        )}

        {itens.length > 0 && (
          <Text style={styles.meter}>
            {mb(totalBytes(itens))} de {mb(LIMITE_BYTES)}
          </Text>
        )}

        <View style={styles.tip}>
          <Rugi mood="pensativo" width={64} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Foto reta, com luz e uma página por vez. Eu leio até letra de médico.</Text>
          </View>
        </View>
      </ScrollView>

      <FeraButton label="Continuar" disabled={itens.length === 0} onPress={() => router.push('/prova/formatos')} />

      {erro && <InfoSheet mood="pensativo" title="Opa!" text={erro} button="Beleza" onClose={() => setErro(null)} />}
    </KeyboardAvoidingView>
  );
}

function RemoveButton({ item, inline }: { item: Item; inline?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Tirar" hitSlop={8} onPress={() => remover(item.id)} style={inline ? styles.removeInline : styles.remove}>
      <CloseIcon size={14} strokeWidth={3.2} color={inline ? colors.textMuted : colors.white} />
    </Pressable>
  );
}

function AddChip({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.redSoft }]}>
      {icon}
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const THUMB_GAP = 10;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  body: { flex: 1, marginHorizontal: -space.gutter },
  bodyContent: { paddingHorizontal: space.gutter, paddingBottom: space.xl },
  title: { ...type.screenTitle, marginTop: 20, lineHeight: 31, color: colors.text },
  subtitle: { marginTop: 6, fontFamily: fonts.nunito600, fontSize: 15, color: colors.textMuted },
  grid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: THUMB_GAP },
  thumb: { width: '31%', aspectRatio: 3 / 4, borderRadius: radius.option, overflow: 'hidden', backgroundColor: colors.offWhite },
  remove: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  removeInline: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 16, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  rowIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.nunito600, fontSize: 13, color: colors.textMuted },
  add: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
  editor: { marginTop: 18, gap: 12 },
  input: {
    minHeight: 180,
    borderRadius: radius.card,
    borderWidth: sizes.borderWidth,
    borderColor: colors.red,
    padding: 16,
    fontFamily: fonts.nunito600,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  editorActions: { flexDirection: 'row', gap: 12 },
  meter: { marginTop: 12, fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  tip: { marginTop: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubble: {
    flex: 1,
    marginBottom: 24,
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  bubbleText: { fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 21, color: colors.text },
});
