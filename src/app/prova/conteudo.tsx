// Conteúdo da prova (prévia — sem design no canvas): confere tudo o que vai pra IA antes de gerar.
// Aceita câmera, galeria, qualquer arquivo (vários de uma vez, zip incluso) e texto; na web dá pra arrastar e soltar.
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import {
  BookWaveIcon,
  CameraIcon,
  CloseIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  MicIcon,
  PencilIcon,
  SlidesIcon,
  TableIcon,
  UploadIcon,
  VideoIcon,
} from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Rugi } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  adicionarArquivos,
  adicionarTexto,
  editarTexto,
  escolherArquivos,
  escolherFotos,
  esquecerAvisos,
  LIMITE_BYTES,
  mb,
  remover,
  tirarFoto,
  totalBytes,
  useRascunho,
  type Item,
} from '@/data/rascunho';
import type { Categoria } from '@/lib/arquivos';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

const ROTULO: Record<Categoria, string> = {
  imagem: 'Foto',
  pdf: 'PDF',
  texto: 'Texto',
  word: 'Documento',
  slides: 'Apresentação',
  planilha: 'Planilha',
  pagina: 'Página web',
  ebook: 'Livro digital',
  audio: 'Áudio',
  video: 'Vídeo',
};

function IconeDoItem({ item }: { item: Item }) {
  const c = colors.red;
  if (item.tipo === 'pdf') return <FileIcon size={22} color={c} />;
  if (item.tipo === 'midia') return item.categoria === 'audio' ? <MicIcon color={c} /> : <VideoIcon color={c} />;
  if (item.tipo === 'texto') {
    if (item.digitado) return <PencilIcon size={22} color={c} />;
    if (item.categoria === 'slides') return <SlidesIcon color={c} />;
    if (item.categoria === 'planilha') return <TableIcon color={c} />;
    if (item.categoria === 'pagina') return <GlobeIcon color={c} />;
    if (item.categoria === 'ebook') return <BookWaveIcon color={c} />;
    return <FileIcon size={22} color={c} />;
  }
  return <ImageIcon color={c} />;
}

const categoriaDo = (i: Item): Categoria => (i.tipo === 'foto' ? 'imagem' : i.tipo === 'pdf' ? 'pdf' : i.categoria);

function subtitulo(i: Item) {
  if (i.tipo === 'texto' && i.digitado) return i.texto;
  const partes = [ROTULO[categoriaDo(i)], i.tipo === 'texto' ? `${i.texto.length.toLocaleString('pt-BR')} caracteres` : mb(i.bytes)];
  if (i.origem) partes.push(`de ${i.origem}`);
  return partes.join(' · ');
}

export default function Conteudo() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ texto?: string }>();
  const { itens, lendo, ignorados } = useRascunho();
  const [escrevendo, setEscrevendo] = useState(params.texto === '1');
  const [texto, setTexto] = useState('');
  const [editando, setEditando] = useState<Extract<Item, { tipo: 'texto' }> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const fotos = itens.filter((i) => i.tipo === 'foto');
  const outros = itens.filter((i) => i.tipo !== 'foto');

  const acao = (f: () => Promise<boolean>) => () => {
    if (lendo) return;
    f().catch((e: Error) => setErro(e.message || 'Não deu pra abrir. Tenta de novo.'));
  };
  const salvarTexto = () => {
    try {
      adicionarTexto(texto);
      setTexto('');
      setEscrevendo(false);
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  // Web: arrastar arquivos do computador direto pra tela.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let dentro = 0;
    const temArquivos = (e: DragEvent) => !!e.dataTransfer && [...e.dataTransfer.types].includes('Files');
    const entrou = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      dentro++;
      setArrastando(true);
    };
    const saiu = () => {
      dentro = Math.max(0, dentro - 1);
      if (!dentro) setArrastando(false);
    };
    const sobre = (e: DragEvent) => temArquivos(e) && e.preventDefault();
    const soltou = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      dentro = 0;
      setArrastando(false);
      const arquivos = [...(e.dataTransfer?.files ?? [])];
      adicionarArquivos(arquivos.map((f) => ({ nome: f.name, mime: f.type, bytes: async () => new Uint8Array(await f.arrayBuffer()) }))).catch((x: Error) => setErro(x.message));
    };
    document.addEventListener('dragenter', entrou);
    document.addEventListener('dragleave', saiu);
    document.addEventListener('dragover', sobre);
    document.addEventListener('drop', soltou);
    return () => {
      document.removeEventListener('dragenter', entrou);
      document.removeEventListener('dragleave', saiu);
      document.removeEventListener('dragover', sobre);
      document.removeEventListener('drop', soltou);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}
    >
      <ScreenHeader title="Nova prova" />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Seu conteúdo</Text>
        <Text style={styles.subtitle}>Foto, PDF, Word, slides, planilha, página web, áudio da aula ou um zip com tudo. Pode misturar.</Text>

        {fotos.length > 0 && (
          <View style={styles.grid}>
            {fotos.map((f) => (
              <View key={f.id} style={styles.thumb}>
                <Image source={{ uri: f.tipo === 'foto' ? f.uri : undefined }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={f.nome} />
                <RemoveButton item={f} />
              </View>
            ))}
          </View>
        )}

        {outros.length > 0 && (
          <View style={styles.list}>
            {outros.map((i, k) => {
              const editavel = i.tipo === 'texto';
              const linha = (
                <>
                  <View style={styles.rowIcon}>
                    <IconeDoItem item={i} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {i.nome}
                    </Text>
                    <Text style={styles.rowSub} numberOfLines={2}>
                      {subtitulo(i)}
                    </Text>
                  </View>
                  <RemoveButton item={i} inline />
                </>
              );
              return editavel ? (
                <Pressable
                  key={i.id}
                  accessibilityRole="button"
                  accessibilityHint="Abre o texto pra conferir ou corrigir"
                  onPress={() => setEditando(i)}
                  style={({ pressed }) => [styles.row, k > 0 && styles.rowDivider, pressed && { opacity: 0.7 }]}
                >
                  {linha}
                </Pressable>
              ) : (
                <View key={i.id} style={[styles.row, k > 0 && styles.rowDivider]}>
                  {linha}
                </View>
              );
            })}
          </View>
        )}

        {lendo && (
          <View style={styles.lendo} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.red} />
            <Text style={styles.lendoText} numberOfLines={2}>
              {lendo}
            </Text>
          </View>
        )}

        {ignorados.length > 0 && (
          <View style={styles.avisos}>
            <View style={styles.avisosTopo}>
              <InfoIcon size={20} color={colors.errorText} />
              <Text style={styles.avisosTitle}>{ignorados.length === 1 ? '1 arquivo ficou de fora' : `${ignorados.length} arquivos ficaram de fora`}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar avisos" hitSlop={8} onPress={esquecerAvisos}>
                <CloseIcon size={16} color={colors.errorText} />
              </Pressable>
            </View>
            {ignorados.slice(0, 6).map((g, k) => (
              <Text key={`${g.nome}-${k}`} style={styles.avisoText} numberOfLines={2}>
                • {g.nome}: {g.motivo}
              </Text>
            ))}
            {ignorados.length > 6 && <Text style={styles.avisoText}>… e mais {ignorados.length - 6}</Text>}
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
            <AddChip icon={<CameraIcon size={20} color={colors.red} />} label="Câmera" onPress={acao(tirarFoto)} disabled={!!lendo} />
            <AddChip icon={<ImageIcon size={20} />} label="Galeria" onPress={acao(escolherFotos)} disabled={!!lendo} />
            <AddChip icon={<UploadIcon size={20} />} label="Arquivos" onPress={acao(escolherArquivos)} disabled={!!lendo} />
            <AddChip icon={<PencilIcon size={20} />} label="Texto" onPress={() => setEscrevendo(true)} disabled={!!lendo} />
          </View>
        )}

        {itens.length > 0 && (
          <Text style={styles.meter}>
            {itens.length === 1 ? '1 item' : `${itens.length} itens`} · {mb(totalBytes(itens))} de {mb(LIMITE_BYTES)}
          </Text>
        )}

        <View style={styles.tip}>
          <Rugi mood="pensativo" width={64} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              {Platform.OS === 'web' ? 'Dá pra arrastar os arquivos pra cá. ' : ''}Foto reta, com luz, uma página por vez. Eu leio até letra de médico.
            </Text>
          </View>
        </View>
      </ScrollView>

      <FeraButton label="Continuar" disabled={itens.length === 0 || !!lendo} onPress={() => router.push('/prova/formatos')} />

      {arrastando && (
        <View style={styles.soltar} pointerEvents="none">
          <UploadIcon size={40} color={colors.white} />
          <Text style={styles.soltarText}>Solta aqui</Text>
        </View>
      )}

      {editando && <EditarTexto item={editando} onClose={() => setEditando(null)} />}
      {erro && <InfoSheet mood="pensativo" title="Opa!" text={erro} button="Beleza" onClose={() => setErro(null)} />}
    </KeyboardAvoidingView>
  );
}

/** Confere/corrige o texto extraído de um arquivo (ou o digitado). */
function EditarTexto({ item, onClose }: { item: Extract<Item, { tipo: 'texto' }>; onClose: () => void }) {
  const [valor, setValor] = useState(item.texto);
  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <Text style={styles.sheetTitle} numberOfLines={1}>
            {item.nome}
          </Text>
          <TextInput value={valor} onChangeText={setValor} multiline textAlignVertical="top" style={[styles.input, styles.inputSheet]} accessibilityLabel={`Texto de ${item.nome}`} />
          <FeraButton label="Salvar" onPress={() => close(() => editarTexto(item.id, valor))} />
        </>
      )}
    </BottomSheet>
  );
}

function RemoveButton({ item, inline }: { item: Item; inline?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Tirar ${item.nome}`} hitSlop={8} onPress={() => remover(item.id)} style={inline ? styles.removeInline : styles.remove}>
      <CloseIcon size={14} strokeWidth={3.2} color={inline ? colors.textMuted : colors.white} />
    </Pressable>
  );
}

function AddChip({ icon, label, onPress, disabled }: { icon: ReactNode; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.redSoft }, disabled && { opacity: 0.5 }]}
    >
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
  subtitle: { marginTop: 6, fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  grid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: THUMB_GAP },
  thumb: { width: '31%', aspectRatio: 3 / 4, borderRadius: radius.option, overflow: 'hidden', backgroundColor: colors.offWhite },
  remove: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.photoButton, alignItems: 'center', justifyContent: 'center' },
  removeInline: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 16, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowDivider: { borderTopWidth: sizes.borderWidth, borderColor: colors.border },
  rowIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.nunito800, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.nunito600, fontSize: 13, color: colors.textMuted },
  lendo: { marginTop: 16, minHeight: 52, borderRadius: radius.button, backgroundColor: colors.offWhite, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lendoText: { flex: 1, fontFamily: fonts.nunito800, fontSize: 15, color: colors.text },
  avisos: { marginTop: 16, borderRadius: radius.card, backgroundColor: colors.errorBg, padding: 14, gap: 4 },
  avisosTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  avisosTitle: { flex: 1, fontFamily: fonts.nunito900, fontSize: 15, color: colors.errorText },
  avisoText: { fontFamily: fonts.nunito700, fontSize: 13, lineHeight: 18, color: colors.text },
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
    outlineWidth: 0,
  },
  inputSheet: { height: 320, borderColor: colors.border },
  sheetTitle: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text },
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
  soltar: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.dropOverlay, alignItems: 'center', justifyContent: 'center', gap: 10 },
  soltarText: { fontFamily: fonts.fredoka700, fontSize: 28, color: colors.white },
});
