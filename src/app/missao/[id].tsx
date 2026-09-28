// 06 · Missão (Quiz, Lacuna, VF) + 07 · feedback (Acerto / Erro)
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeraButton } from '@/components/FeraButton';
import { FeedbackSheet } from '@/components/missao/FeedbackSheet';
import { LacunaQuestion } from '@/components/missao/LacunaQuestion';
import { MissionHeader } from '@/components/missao/MissionHeader';
import { QuizQuestion } from '@/components/missao/QuizQuestion';
import type { Result } from '@/components/missao/types';
import { VFQuestion } from '@/components/missao/VFQuestion';
import { mockMissao, TAGS, XP_BONUS_MISSAO, XP_POR_ACERTO, type Question } from '@/data/missao';
import { mockUser } from '@/data/mock';
import { app, useApp } from '@/data/store';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const missao = mockMissao; // uma missão de exemplo até o backend existir
  const total = missao.questoes.length;

  const [index, setIndex] = useState(0);
  const q = missao.questoes[index];
  const [answer, setAnswer] = useState<Answer>(() => emptyAnswer(q));
  const [result, setResult] = useState<Result>(null);
  const { premium } = useApp();
  const [lives, setLives] = useState(mockUser.lives);
  const [acertos, setAcertos] = useState(0);

  const verificar = () => {
    const ok = isCorrect(q, answer);
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setAcertos((n) => n + 1);
    else if (!premium) setLives((n) => Math.max(0, n - 1)); // Fera+: vidas infinitas
  };

  const continuar = () => {
    if (index + 1 < total) {
      const next = missao.questoes[index + 1];
      setIndex(index + 1);
      setAnswer(emptyAnswer(next));
      setResult(null);
      return;
    }
    const xp = acertos * XP_POR_ACERTO + XP_BONUS_MISSAO;
    app.addXp(xp);
    router.replace({
      pathname: '/missao/fim',
      params: { id: id ?? String(missao.numero), xp: String(xp), precisao: String(Math.round((acertos / total) * 100)) },
    });
  };

  // Progresso conta as questões já verificadas.
  const progress = (index + (result ? 1 : 0)) / total;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow }]}>
      <MissionHeader progress={progress} lives={premium ? '∞' : lives} onClose={() => router.back()} />

      <View style={styles.tag}>
        <Text style={styles.tagText}>{TAGS[q.kind]}</Text>
      </View>

      {/* Chaves únicas entre irmãos: a questão e a sheet mudam juntas a cada índice. */}
      <View key={`questao-${index}`}>
        {q.kind === 'quiz' && <QuizQuestion q={q} value={answer as number | null} onChange={setAnswer} result={result} />}
        {q.kind === 'lacuna' && <LacunaQuestion q={q} value={answer as (number | null)[]} onChange={setAnswer} result={result} />}
        {q.kind === 'vf' && <VFQuestion q={q} value={answer as boolean | null} onChange={setAnswer} result={result} />}
      </View>

      <View style={{ flex: 1 }} />
      <FeraButton label="Verificar" disabled={!isAnswered(q, answer)} onPress={verificar} />

      {result && <FeedbackSheet key={`feedback-${index}`} correct={result === 'correct'} feedback={q} xp={XP_POR_ACERTO} onContinue={continuar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  tag: { alignSelf: 'flex-start', marginTop: 22, height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.redSoft, justifyContent: 'center' },
  tagText: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.redText },
});
