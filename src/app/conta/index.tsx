// Minha conta (fora do design — prévia no estilo do design system): foto, nome, e-mail, senha, sair e excluir.
// Sem conta (login anônimo), convida a criar uma pra não perder o progresso.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { Aviso } from '@/components/conta/ui';
import { FeraButton } from '@/components/FeraButton';
import { CameraSmallIcon, CrownIcon, FileIcon, ImageIcon, KeyIcon, LogoutIcon, MailIcon, TrashIcon, UserIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Linha, Secao } from '@/components/Lista';
import type { RugiMood } from '@/components/Rugi';
import { Rugi } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SerieSheet } from '@/components/SerieSheet';
import { TextInputSheet } from '@/components/TextInputSheet';
import { atualizarConta, contasDisponiveis, reenviarVerificacao, sair, traduzir, trocarNome, useConta } from '@/data/conta';
import { app, nomeDe, useApp } from '@/data/store';
import { ErroFoto, escolherFotoDePerfil } from '@/lib/fotoPerfil';
import { colors, fonts, radius, sizes, space } from '@/theme';

type Info = { mood: RugiMood; title: string; text: string; button: string; variant?: 'primary' | 'error'; onConfirm?: () => void; secondary?: { label: string; onPress?: () => void } };

export default function MinhaConta() {
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const { foto, serie, premium } = estado;
  const nome = nomeDe(estado);
  const conta = useConta();
  const comEmail = !!conta && !conta.anonimo;
  const [sheet, setSheet] = useState<null | 'foto' | 'nome' | 'serie'>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Voltou do e-mail depois de tocar no link: confere se já está verificado.
  useFocusEffect(
    useCallback(() => {
      if (contasDisponiveis) atualizarConta().catch(() => {});
    }, []),
  );

  const trocarFoto = async (fonte: 'camera' | 'galeria') => {
    try {
      const f = await escolherFotoDePerfil(fonte);
      if (f) app.setFoto(f.foto, f.mini);
    } catch (e) {
      setInfo({ mood: 'pensativo', title: 'Não deu', text: e instanceof ErroFoto ? e.message : 'Não consegui abrir essa foto.', button: 'Beleza' });
    }
  };

  const verificar = async () => {
    try {
      await reenviarVerificacao();
      setInfo({ mood: 'acenando', title: 'Link enviado', text: `Abre o e-mail que mandamos pra ${conta?.email} e toca no link. Depois volta aqui.`, button: 'Beleza' });
    } catch (e) {
      setInfo({ mood: 'pensativo', title: 'Não deu', text: traduzir(e).message, button: 'Beleza' });
    }
  };

  const confirmarSair = () =>
    setInfo({
      mood: 'triste',
      title: 'Sair da conta?',
      text: 'Seu progresso continua salvo na conta. Neste aparelho o Fera volta pro começo até você entrar de novo.',
      button: 'Sair',
      secondary: { label: 'Ficar' },
      onConfirm: async () => {
        setOcupado(true);
        try {
          await sair();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/onboarding');
        } catch (e) {
          setOcupado(false);
          setInfo({ mood: 'pensativo', title: 'Não deu', text: traduzir(e).message, button: 'Beleza' });
        }
      },
    });

  return (
    <View style={styles.tela}>
      <ScrollView
        style={styles.tela}
        contentContainerStyle={[styles.miolo, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Minha conta" />

        <View style={styles.identidade}>
          <Pressable accessibilityRole="button" accessibilityLabel={foto ? 'Trocar foto de perfil' : 'Pôr foto de perfil'} onPress={() => setSheet('foto')}>
            <Avatar foto={foto} inicial={nome.charAt(0).toUpperCase()} style={styles.avatar} textStyle={styles.avatarTexto} />
            <View style={styles.camera}>
              <CameraSmallIcon size={16} />
            </View>
          </Pressable>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email} numberOfLines={1}>
            {comEmail ? conta.email : contasDisponiveis ? 'Sem conta · progresso só neste aparelho' : 'Modo demonstração'}
          </Text>
          {comEmail && (
            <View style={[styles.selo, { backgroundColor: conta.verificado ? colors.successBg : colors.errorBg }]}>
              <Text style={[styles.seloTexto, { color: conta.verificado ? colors.successText : colors.errorText }]}>{conta.verificado ? 'E-mail confirmado' : 'Falta confirmar o e-mail'}</Text>
            </View>
          )}
        </View>

        {contasDisponiveis && !comEmail && (
          <View style={styles.convite}>
            <View style={styles.conviteTopo}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.conviteTitulo}>Cria sua conta</Text>
                <Text style={styles.conviteTexto}>Se trocar ou perder o celular, seu progresso vem junto. Leva 30 segundos.</Text>
              </View>
              <Rugi mood="forca" width={72} />
            </View>
            <FeraButton label="Criar conta" onPress={() => router.push('/conta/criar')} />
            <FeraButton label="Já tenho conta" variant="secondary" onPress={() => router.push('/conta/entrar')} />
          </View>
        )}
        {!contasDisponiveis && <Aviso>No modo demonstração tudo fica só neste aparelho. Contas aparecem quando o Firebase estiver ligado.</Aviso>}

        <Secao titulo="PERFIL">
          <Linha icone={<ImageIcon />} rotulo="Foto" valor={foto ? 'Trocar' : 'Pôr foto'} onPress={() => setSheet('foto')} />
          <Linha icone={<UserIcon />} rotulo="Nome" valor={estado.nome || 'Pôr nome'} onPress={() => setSheet('nome')} />
          <Linha icone={<FileIcon size={22} />} rotulo="Ano escolar" sub="A IA explica no seu nível" valor={serie} onPress={() => setSheet('serie')} />
        </Secao>

        {comEmail && (
          <Secao titulo="LOGIN E SEGURANÇA">
            {conta.verificado ? (
              <Linha icone={<MailIcon />} rotulo="E-mail" sub={conta.email ?? undefined} valor="Confirmado" />
            ) : (
              <Linha icone={<MailIcon />} rotulo="Confirmar e-mail" sub="Toca pra mandar o link de novo" onPress={verificar} />
            )}
            <Linha icone={<KeyIcon />} rotulo="Trocar senha" onPress={() => router.push('/conta/senha')} />
          </Secao>
        )}

        <Secao titulo="ASSINATURA">
          <Linha icone={<CrownIcon width={22} height={18} />} rotulo="Fera+" sub={premium ? 'Vidas infinitas e IA completa' : 'Vidas infinitas, formatos e IA completa'} valor={premium ? 'Ativo' : 'Conhecer'} onPress={() => router.push('/premium')} />
        </Secao>

        <Secao>
          {comEmail && <Linha icone={<LogoutIcon size={20} />} rotulo="Sair da conta" onPress={confirmarSair} />}
          <Linha icone={<TrashIcon color={colors.errorText} />} rotulo={comEmail ? 'Excluir conta' : 'Apagar meus dados'} perigo onPress={() => router.push('/conta/excluir')} />
        </Secao>

        {conta && <Text style={styles.codigo}>Código pra suporte: {conta.uid.slice(0, 8).toUpperCase()}</Text>}
      </ScrollView>

      {sheet === 'foto' && (
        <BottomSheet onClose={() => setSheet((s) => (s === 'foto' ? null : s))}>
          {(close) => (
            <>
              <Text style={styles.sheetTitulo}>Foto de perfil</Text>
              <View>
                <Linha icone={<CameraSmallIcon size={22} color={colors.red} />} rotulo="Tirar foto" onPress={() => close(() => trocarFoto('camera'))} />
                <Linha icone={<ImageIcon />} rotulo="Escolher da galeria" onPress={() => close(() => trocarFoto('galeria'))} />
                {foto && <Linha icone={<TrashIcon color={colors.errorText} />} rotulo="Remover foto" perigo onPress={() => close(() => app.setFoto(null, null))} />}
              </View>
              <Text style={styles.sheetNota}>A foto aparece no seu perfil e pros colegas da turma.</Text>
            </>
          )}
        </BottomSheet>
      )}
      {sheet === 'nome' && <TextInputSheet title="Como você quer ser chamado?" placeholder={nome} maxLength={30} button="Salvar" onSubmit={trocarNome} onClose={() => setSheet(null)} />}
      {sheet === 'serie' && <SerieSheet serie={serie} onClose={() => setSheet(null)} />}
      {info && <InfoSheet {...info} onClose={() => setInfo(null)} />}
      {ocupado && <View style={styles.bloqueio} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter },
  identidade: { alignItems: 'center', marginTop: 12, gap: 4 },
  // Mesmo círculo do Perfil (84 + borda 4).
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.red, borderWidth: 4, borderColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontFamily: fonts.fredoka700, fontSize: 36, color: colors.white },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { marginTop: 10, fontFamily: fonts.nunito900, fontSize: 22, color: colors.text },
  email: { fontFamily: fonts.nunito700, fontSize: 14, color: colors.textMuted, maxWidth: '100%' },
  selo: { marginTop: 4, height: 26, paddingHorizontal: 10, borderRadius: radius.pill, justifyContent: 'center' },
  seloTexto: { fontFamily: fonts.nunito800, fontSize: 13 },
  convite: { marginTop: 22, borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, backgroundColor: colors.offWhite, padding: 16, gap: 10 },
  conviteTopo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  conviteTitulo: { fontFamily: fonts.nunito900, fontSize: 18, color: colors.text },
  conviteTexto: { fontFamily: fonts.nunito700, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  codigo: { marginTop: 18, textAlign: 'center', fontFamily: fonts.nunito700, fontSize: 12, color: colors.lockedIcon },
  sheetTitulo: { fontFamily: fonts.nunito800, fontSize: 20, color: colors.text },
  sheetNota: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  bloqueio: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
