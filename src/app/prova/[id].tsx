// Detalhe da prova (fora do design — prévia no estilo do design system). Abre pela aba Provas.
// Mostra o andamento, o desempenho por tópico e as ações: estudar, materiais, mudar a data, excluir.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aviso } from '@/components/conta/ui';
import { DataSheet } from '@/components/DataSheet';
import { FeraButton } from '@/components/FeraButton';
import { BookWaveIcon, CalendarEditIcon, ShareIcon, TrashIcon, TrophyIcon } from '@/components/icons';
import { InfoSheet } from '@/components/InfoSheet';
import { Linha, Secao } from '@/components/Lista';
import { ProvaCard } from '@/components/ProvaCard';
import type { RugiMood } from '@/components/Rugi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { apagarConteudo, useConteudo } from '@/data/conteudo';
import { topicosFracos } from '@/data/missoes';
import { compartilharProva } from '@/data/nuvem';
import { app, diasAte, proximaMissao, useApp } from '@/data/store';
import { shortDate } from '@/lib/dates';
import { firebaseLigado } from '@/lib/firebase';
import { colors, fonts, radius, sizes, space } from '@/theme';
import { evento } from '@/lib/metricas';

type Desempenho = { nome: string; certas: number; erradas: number };

export default function DetalheDaProva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const prova = estado.provas.find((p) => p.id === id) ?? null;
  const { conteudo } = useConteudo(prova?.id ?? null);
  const [mudandoData, setMudandoData] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [trocou, setTrocou] = useState(false);
  const [aviso, setAviso] = useState<{ titulo: string; texto: string; mood: RugiMood } | null>(null);

  if (!prova) {
    return (
      <View style={[styles.tela, styles.miolo, { paddingTop: insets.top + sizes.topExtra }]}>
        <ScreenHeader title="Prova" />
        <Text style={[styles.vazio, { marginTop: 24 }]}>Essa prova não existe mais.</Text>
      </View>
    );
  }

  const dias = diasAte(prova.data);
  const atual = estado.provaAtual === prova.id;
  const passou = dias < 0;
  const precisao = prova.respondidas ? Math.round((prova.acertos / prova.respondidas) * 100) : null;
  const proxima = proximaMissao(prova);

  // Tópicos do plano (na ordem da IA) + os que só aparecem nos erros/acertos.
  const nomes = [...(conteudo?.plano.topicos.map((t) => t.nome) ?? [])];
  for (const t of [...Object.keys(prova.erros), ...Object.keys(prova.acertosTopico ?? {})]) if (!nomes.includes(t)) nomes.push(t);
  const desempenho: Desempenho[] = nomes.map((nome) => ({ nome, certas: prova.acertosTopico?.[nome] ?? 0, erradas: prova.erros[nome] ?? 0 }));
  const comDados = desempenho.filter((d) => d.certas + d.erradas > 0);
  const fraco = [...comDados].filter((d) => d.erradas > 0).sort((a, b) => b.erradas / (b.certas + b.erradas) - a.erradas / (a.certas + a.erradas) || b.erradas - a.erradas)[0];

  const estudar = () => {
    app.setProvaAtual(prova.id);
    if (atual && proxima) router.push(`/missao/${proxima}`);
    else router.navigate('/');
  };

  const compartilhar = async () => {
    const turma = estado.turma;
    if (!turma) return router.navigate('/turma');
    if (!conteudo) return;
    try {
      await compartilharProva(turma.codigo, prova, conteudo);
      evento('prova_compartilhada');
      setAviso({ titulo: 'Tá na turma!', texto: `A galera da ${turma.nome} já vê essa prova na aba Turma.`, mood: 'comemorando' });
    } catch {
      setAviso({ titulo: 'Não deu', texto: 'Confere a internet e tenta de novo.', mood: 'pensativo' });
    }
  };

  const excluir = () => {
    const provaId = prova.id;
    router.back();
    // Tira da lista depois que a tela saiu (senão ela pisca "essa prova não existe" na saída).
    setTimeout(() => {
      app.excluirProva(provaId);
      apagarConteudo(provaId).catch(() => {});
    }, 400);
  };

  return (
    <View style={styles.tela}>
      <ScrollView
        style={styles.tela}
        contentContainerStyle={[styles.miolo, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={`Prova de ${prova.materia}`} />

        <ProvaCard materia={prova.materia} topico={prova.topico} data={prova.data} dias={dias} feitas={prova.feitas.length} total={prova.totalMissoes} style={styles.card} />

        <View style={styles.numeros}>
          <Numero valor={`${prova.feitas.length}/${prova.totalMissoes}`} rotulo="missões" />
          <Numero valor={precisao != null ? `${precisao}%` : '—'} rotulo="de acerto" />
          <Numero valor={String(prova.respondidas)} rotulo="questões" />
        </View>

        {!passou && (
          <FeraButton
            label={atual ? (proxima ? `Fazer a missão ${proxima}` : 'Ir pra trilha') : 'Estudar essa agora'}
            onPress={atual ? estudar : () => setTrocou(true)}
            style={{ marginTop: 18 }}
          />
        )}

        <Text style={styles.secao}>Desempenho por tópico</Text>
        {comDados.length === 0 ? (
          <Text style={styles.vazio}>Faz as missões que aqui aparece onde você manda bem e o que precisa revisar.</Text>
        ) : (
          <View style={styles.topicos}>
            {desempenho.map((d) => (
              <Topico key={d.nome} {...d} />
            ))}
          </View>
        )}
        {fraco && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <Aviso>{`Pra revisar: ${fraco.nome}. ${passou ? 'Vale rever antes da próxima prova.' : 'A revisão da véspera foca nele.'}`}</Aviso>
            {topicosFracos(prova).length > 0 && (
              <FeraButton
                label="Reforçar agora"
                variant="secondary"
                onPress={() => {
                  app.setProvaAtual(prova.id);
                  router.push('/missao/reforco');
                }}
              />
            )}
          </View>
        )}

        <Secao titulo="PROVA">
          {atual && <Linha icone={<BookWaveIcon />} rotulo="Materiais" sub="Resumo, explicação e o que a IA gerou" onPress={() => router.push('/prova/materiais')} />}
          {firebaseLigado && !prova.origem && conteudo && (
            <Linha
              icone={<ShareIcon size={22} color={colors.red} />}
              rotulo="Compartilhar com a turma"
              sub={estado.turma ? `A ${estado.turma.nome} estuda sem gastar geração` : 'Entre numa turma primeiro'}
              onPress={compartilhar}
            />
          )}
          <Linha icone={<CalendarEditIcon />} rotulo="Mudar a data" valor={shortDate(prova.data).toLowerCase()} onPress={() => setMudandoData(true)} />
          {!passou && <Linha icone={<TrophyIcon size={22} />} rotulo="Modo véspera" sub="Revisão rápida do que mais cai" onPress={() => router.push(`/vespera/${prova.id}`)} />}
          <Linha icone={<TrashIcon color={colors.errorText} />} rotulo="Excluir prova" perigo onPress={() => setExcluindo(true)} />
        </Secao>
      </ScrollView>

      {mudandoData && <DataSheet data={prova.data} onSalvar={(d) => app.setDataProva(prova.id, d)} onClose={() => setMudandoData(false)} />}
      {excluindo && (
        <InfoSheet
          mood="triste"
          title="Excluir essa prova?"
          text={`A trilha, os materiais e o desempenho de ${prova.materia} somem. O XP que você ganhou continua.`}
          button="Excluir"
          variant="error"
          onConfirm={excluir}
          secondary={{ label: 'Cancelar' }}
          onClose={() => setExcluindo(false)}
        />
      )}
      {aviso && <InfoSheet mood={aviso.mood} title={aviso.titulo} text={aviso.texto} button="Beleza" onClose={() => setAviso(null)} />}
      {trocou && (
        <InfoSheet
          mood="forca"
          title={`Bora de ${prova.materia}!`}
          text={`A trilha de ${prova.topico} vira a da Início. Dá pra voltar pra outra prova quando quiser.`}
          button="Estudar essa agora"
          onConfirm={estudar}
          onClose={() => setTrocou(false)}
        />
      )}
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.numero}>
      <Text style={styles.numeroValor}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

/** Barra com a parte verde (certas) e laranja (erradas) — erro nunca é vermelho no design. */
function Topico({ nome, certas, erradas }: Desempenho) {
  const total = certas + erradas;
  return (
    <View style={styles.topico} accessibilityLabel={`${nome}: ${certas} certas de ${total}`}>
      <View style={styles.topicoTopo}>
        <Text style={styles.topicoNome} numberOfLines={2}>
          {nome}
        </Text>
        <Text style={styles.topicoConta}>{total ? `${certas} de ${total}` : 'ainda não caiu'}</Text>
      </View>
      <View style={styles.barra}>
        {total > 0 && (
          <>
            <View style={{ flex: certas, backgroundColor: colors.success }} />
            <View style={{ flex: erradas, backgroundColor: colors.error }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.white },
  miolo: { paddingHorizontal: space.gutter },
  card: { marginTop: 14 },
  numeros: { marginTop: 18, flexDirection: 'row', gap: 10 },
  numero: { flex: 1, height: 80, borderRadius: radius.option, borderWidth: sizes.borderWidth, borderColor: colors.border, padding: 12, justifyContent: 'center' },
  numeroValor: { fontFamily: fonts.fredoka700, fontSize: 24, lineHeight: 28, color: colors.text },
  numeroRotulo: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  secao: { marginTop: 24, marginBottom: 10, fontFamily: fonts.nunito900, fontSize: 20, color: colors.text },
  vazio: { fontFamily: fonts.nunito700, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  topicos: { borderWidth: sizes.borderWidth, borderColor: colors.border, borderRadius: radius.card, padding: 16, gap: 16 },
  topico: { gap: 8 },
  topicoTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  topicoNome: { flex: 1, fontFamily: fonts.nunito800, fontSize: 15, lineHeight: 20, color: colors.text },
  topicoConta: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
  barra: { height: 10, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden', flexDirection: 'row' },
});
