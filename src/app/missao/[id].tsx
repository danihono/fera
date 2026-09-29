// 06 · Missão (Quiz, Lacuna, VF) + 07 · feedback (Acerto / Erro)
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { InfoSheet } from '@/components/InfoSheet';
import { FeedbackSheet } from '@/components/missao/FeedbackSheet';
import { LacunaQuestion } from '@/components/missao/LacunaQuestion';
import { MissionHeader } from '@/components/missao/MissionHeader';
import { QuizQuestion } from '@/components/missao/QuizQuestion';
import type { Result } from '@/components/missao/types';
import { VFQuestion } from '@/components/missao/VFQuestion';
import { useConteudo } from '@/data/conteudo';
import { TAGS, XP_BONUS_MISSAO, XP_POR_ACERTO, type Question } from '@/data/missao';
import { montarMissao } from '@/data/missoes';
import { app, provaAtualDe, useApp, VIDAS } from '@/data/store';
import { vibrar } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space } from '@/theme';

type Answer = number | boolean | (number | null)[] | null;

const emptyAnswer = (q: Question): Answer => (q.kind === 'lacuna' ? q.respostas.map(() => null) : null);

const isAnswered = (q: Question, a: Answer) => (q.kind === 'lacuna' ? Array.isArray(a) && a.every((w) => w != null) : a != null);

const isCorrect = (q: Question, a: Answer) => {
  switch (q.kind) {
    case 'quiz':
      return a === q.resposta;
    case 'vf':
      return a === q.resposta;
    case 'lacuna':
      return Array.isArray(a) && a.every((w, i) => w != null && q.banco[w] === q.respostas[i]);
  }
};

export default function Missao() {
  const { id = '1' } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const estado = useApp();
  const { premium } = estado;
  const prova = provaAtualDe(estado);
  const { conteudo, carregando } = useConteudo(prova?.id ?? null);
  // Monta a missão uma vez (a lista não muda no meio do caminho).
  const missao = useMemo(() => (carregando ? null : montarMissao(id, prova, conteudo)), [carregando, id, conteudo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!missao) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra }]}>
        {!carregando && (
          <InfoSheet mood="pensativo" title="Missão não encontrada" text="Essa missão não existe nessa prova." button="Voltar" onClose={() => router.back()} />
        )}
      </View>
    );
  }
  return <Jogo key={id} id={id} missao={missao} premium={premium} provaId={prova?.id ?? null} />;
}

function Jogo({ id, missao, premium, provaId }: { id: string; missao: NonNullable<ReturnType<typeof montarMissao>>; premium: boolean; provaId: string | null }) {
  const insets = useSafeAreaInsets();
  const total = missao.questoes.length;
  const [index, setIndex] = useState(0);
  const q = missao.questoes[index];
  const [answer, setAnswer] = useState<Answer>(() => emptyAnswer(q));
  const [result, setResult] = useState<Result>(null);
  const [lives, setLives] = useState(VIDAS);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState<Record<string, number>>({});
  const [certosTopico, setCertosTopico] = useState<Record<string, number>>({});
  const [semVidas, setSemVidas] = useState(false);
  const tentarDeNovo = useRef(false);
  // A questão rola só se não couber na tela (celular pequeno); no tamanho do design ela fica parada.
  const [caixa, setCaixa] = useState(0);
  const [conteudoAltura, setConteudoAltura] = useState(0);

  const verificar = () => {
    const ok = isCorrect(q, answer);
    setResult(ok ? 'correct' : 'wrong');
    vibrar(ok ? 'acerto' : 'erro');
    if (ok) {
      setAcertos((n) => n + 1);
      if (q.topico) setCertosTopico((e) => ({ ...e, [q.topico!]: (e[q.topico!] ?? 0) + 1 }));
    } else {
      if (q.topico) setErros((e) => ({ ...e, [q.topico!]: (e[q.topico!] ?? 0) + 1 }));
      if (!premium) setLives((n) => Math.max(0, n - 1)); // Fera+: vidas infinitas
    }
  };

  const recomecar = () => {
    setIndex(0);
    setAnswer(emptyAnswer(missao.questoes[0]));
    setResult(null);
    setLives(VIDAS);
    setAcertos(0);
    setErros({});
    setCertosTopico({});
  };

  const continuar = () => {
    if (!premium && lives === 0) {
      setSemVidas(true);
      return;
    }
    if (index + 1 < total) {
      const next = missao.questoes[index + 1];
      setIndex(index + 1);
      setAnswer(emptyAnswer(next));
      setResult(null);
      return;
    }
    const xp = acertos * XP_POR_ACERTO + XP_BONUS_MISSAO;
    app.concluirMissao({ provaId, numero: missao.numero, tipo: missao.numero != null ? 'trilha' : (id as 'teste' | 'simulado' | 'revisao'), xp, acertos, respondidas: total, errosPorTopico: erros, acertosPorTopico: certosTopico });
    vibrar('fim');
    router.replace({
      pathname: '/missao/fim',
      params: { id, xp: String(xp), precisao: String(Math.round((acertos / total) * 100)), subtitulo: missao.subtitulo },
    });
  };

  // Progresso conta as questões já verificadas.
  const progress = (index + (result ? 1 : 0)) / total;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}>
      <MissionHeader progress={progress} lives={premium ? '∞' : lives} onClose={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        scrollEnabled={conteudoAltura > caixa + 1}
        onLayout={(e) => setCaixa(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setConteudoAltura(h)}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tag}>
          <Text style={styles.tagText}>{TAGS[q.kind]}</Text>
        </View>

        {/* Chaves únicas entre irmãos: a questão e a sheet mudam juntas a cada índice. */}
        <View key={`questao-${index}`}>
          {q.kind === 'quiz' && <QuizQuestion q={q} value={answer as number | null} onChange={setAnswer} result={result} />}
          {q.kind === 'lacuna' && <LacunaQuestion q={q} value={answer as (number | null)[]} onChange={setAnswer} result={result} />}
          {q.kind === 'vf' && <VFQuestion q={q} value={answer as boolean | null} onChange={setAnswer} result={result} />}
        </View>
        <View style={{ height: space.xl }} />
      </ScrollView>

      <FeraButton label="Verificar" disabled={!isAnswered(q, answer)} onPress={verificar} />

      {result && <FeedbackSheet key={`feedback-${index}`} correct={result === 'correct'} feedback={q} xp={XP_POR_ACERTO} onContinue={continuar} />}

      {semVidas && (
        <InfoSheet
          mood="triste"
          title="Acabaram as vidas"
          text="Dá uma olhada no resumo e tenta de novo. No Fera+ as vidas são infinitas."
          button="Tentar de novo"
          onConfirm={() => (tentarDeNovo.current = true)}
          onClose={() => {
            setSemVidas(false);
            // Fechou sem tentar de novo: sai da missão.
            if (tentarDeNovo.current) recomecar();
            else router.back();
            tentarDeNovo.current = false;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  tag: { alignSelf: 'flex-start', marginTop: 22, height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  tagText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
});
