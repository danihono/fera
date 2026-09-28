// Material de estudo gerado pela IA (prévia — sem design no canvas).
import { useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { Explicacao } from '@/components/materiais/Explicacao';
import { Fluxo } from '@/components/materiais/Fluxo';
import { Grafico } from '@/components/materiais/Grafico';
import { Imagens } from '@/components/materiais/Imagens';
import { Mapa } from '@/components/materiais/Mapa';
import { Resumo } from '@/components/materiais/Resumo';
import { Slides } from '@/components/materiais/Slides';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useConteudo } from '@/data/conteudo';
import { formato } from '@/data/formatos';
import { gerarFormato } from '@/data/geracao';
import { provaAtualDe, useApp } from '@/data/store';
import { ehMaterial, type Materiais, type MaterialId } from '@/ia/tipos';
import { nomeDoModelo } from '@/lib/modelos';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

function Viewer({ tipo, m }: { tipo: MaterialId; m: Partial<Materiais> }): ReactNode {
  switch (tipo) {
    case 'resumo':
      return m.resumo && <Resumo d={m.resumo} />;
    case 'explicacao':
      return m.explicacao && <Explicacao d={m.explicacao} />;
    case 'mapa':
      return m.mapa && <Mapa d={m.mapa} />;
    case 'slides':
      return m.slides && <Slides d={m.slides} />;
    case 'grafico':
      return m.grafico && <Grafico d={m.grafico} />;
    case 'fluxo':
      return m.fluxo && <Fluxo d={m.fluxo} />;
    case 'imagens':
      return m.imagens && <Imagens d={m.imagens} />;
  }
}

export default function Material() {
  const { tipo } = useLocalSearchParams<{ tipo: string }>();
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const prova = provaAtualDe(estado);
  const { conteudo, carregando } = useConteudo(prova?.id ?? null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const f = formato(tipo ?? '');
  const id = ehMaterial(tipo ?? '') ? (tipo as MaterialId) : null;
  const tem = !!(id && conteudo?.materiais[id]);
  const modelo = id && conteudo?.modelos[id];

  const gerar = async () => {
    if (!prova || !id) return;
    setGerando(true);
    setErro(await gerarFormato(prova, id));
    setGerando(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={f?.nome ?? 'Material'} />
      <View style={styles.tag}>
        <Text style={styles.tagText}>{modelo ? `GERADO PELA IA · ${nomeDoModelo(modelo).toUpperCase()}` : 'GERADO PELA IA'}</Text>
      </View>
      <Text style={styles.title}>{prova?.topico ?? 'Material'}</Text>

      <View style={{ marginTop: 16 }}>
        {tem && id && conteudo ? (
          <Viewer tipo={id} m={conteudo.materiais} />
        ) : carregando ? (
          <ActivityIndicator color={colors.red} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.vazio}>
            <Text style={styles.vazioText}>{erro ?? 'Esse material ainda não foi criado pra essa prova.'}</Text>
            {prova && id && <FeraButton label={gerando ? 'Criando…' : 'Criar agora'} disabled={gerando} onPress={gerar} />}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter },
  tag: { alignSelf: 'flex-start', marginTop: 20, height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  tagText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
  title: { ...type.screenTitle, marginTop: 10, lineHeight: 31, color: colors.text },
  vazio: { gap: 16, marginTop: 12 },
  vazioText: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 22, color: colors.textMuted },
});
