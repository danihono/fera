// Página pública de exclusão de conta (o Google Play exige um link que funcione sem o app instalado).
// Endereço: https://<projeto>.web.app/excluir-conta
import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aviso } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { Rugi } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, fonts, sizes, space, type } from '@/theme';

const EMAIL = 'privacidade@fera.app';

const PASSOS = ['Abra o Fera e toque em Perfil.', 'Toque na engrenagem ⚙️ e depois em Minha conta.', 'Toque em Excluir conta, escreva EXCLUIR e confirme (com a senha, se tiver conta com e-mail).'];

const APAGA = [
  'Provas, materiais e tudo que a IA gerou',
  'XP, nível, sequência e conquistas',
  'Foto, nome, ano escolar e o login (e-mail e senha)',
  'Seu lugar no ranking e as provas que você compartilhou nas turmas',
];

export default function ExcluirContaPublica() {
  const insets = useSafeAreaInsets();
  const pedirPorEmail = () =>
    Linking.openURL(
      `mailto:${EMAIL}?subject=${encodeURIComponent('Excluir minha conta do Fera')}&body=${encodeURIComponent('Quero excluir minha conta do Fera.\nE-mail da conta: \n')}`,
    ).catch(() => {});

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.miolo, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Excluir conta" onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <View style={styles.topo}>
        <Text style={styles.titulo} accessibilityRole="header">
          Como excluir sua conta do Fera
        </Text>
        <Rugi mood="triste" width={80} />
      </View>

      <Text style={styles.secao}>PELO APP (NA HORA)</Text>
      {PASSOS.map((p, i) => (
        <View key={p} style={styles.passo}>
          <Text style={styles.numero}>{i + 1}</Text>
          <Text style={styles.texto}>{p}</Text>
        </View>
      ))}

      <Text style={styles.secao}>SEM O APP</Text>
      <Text style={styles.texto}>
        Mande um e-mail pra {EMAIL} com o e-mail da conta (ou o &quot;código pra suporte&quot; que aparece em Minha conta). A gente confirma e exclui em até 7 dias.
      </Text>
      <FeraButton label="Pedir por e-mail" variant="secondary" onPress={pedirPorEmail} style={{ marginTop: 14 }} />

      <Text style={styles.secao}>O QUE É APAGADO</Text>
      {APAGA.map((a) => (
        <Text key={a} style={styles.item}>
          • {a}
        </Text>
      ))}
      <View style={{ marginTop: 14 }}>
        <Aviso>Some tudo em até 30 dias, dos nossos servidores e dos serviços que usamos (Google Firebase). Não guardamos cópia. A assinatura Fera+ se cancela na loja do celular: excluir a conta não cancela a cobrança.</Aviso>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter },
  topo: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: { flex: 1, ...type.screenTitle, lineHeight: 34, color: colors.text },
  secao: { marginTop: 24, marginBottom: 10, fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.textMuted },
  passo: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  numero: { width: 26, height: 26, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.redSoft, textAlign: 'center', lineHeight: 26, fontFamily: fonts.fredoka700, fontSize: 14, color: colors.redText },
  texto: { flex: 1, fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 22, color: colors.text },
  item: { fontFamily: fonts.nunito600, fontSize: 15, lineHeight: 24, color: colors.text },
});
