import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FeraButton } from '@/components/FeraButton';
import { Rugi } from '@/components/Rugi';
import { slides } from '@/data/materiais';
import { colors, fonts, radius, space } from '@/theme';

const MOODS = ['acenando', 'forca', 'pensativo', 'comemorando', 'fogo'] as const;

/** Aula em cards: arrasta pro lado ou usa os botões. */
export function Slides() {
  const { width } = useWindowDimensions();
  const w = width - 2 * space.gutter;
  const ref = useRef<ScrollView>(null);
  const [i, setI] = useState(0);
  const ir = (n: number) => {
    const k = Math.max(0, Math.min(slides.length - 1, n));
    ref.current?.scrollTo({ x: k * w, animated: true });
    setI(k);
  };

  return (
    <View style={{ gap: 16 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / w))}
        onScroll={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / w))}
        scrollEventThrottle={64}
        style={{ width: w }}
      >
        {slides.map((s, k) => {
          const red = k === 0 || k === slides.length - 1;
          return (
            <View key={s.titulo} style={[styles.slide, { width: w }, red && { backgroundColor: colors.red }]}>
              <Text style={[styles.n, red && { color: colors.white }]}>
                {k + 1}/{slides.length}
              </Text>
              <Text style={[styles.title, red && { color: colors.white }]}>{s.titulo}</Text>
              <Text style={[styles.text, red && { color: colors.white }]}>{s.texto}</Text>
              <View style={[styles.destaque, red && { backgroundColor: colors.white }]}>
                <Text style={styles.destaqueText}>{s.destaque}</Text>
              </View>
              <View style={styles.rugi}>
                <Rugi mood={MOODS[k % MOODS.length]} width={110} />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((s, k) => (
          <View key={s.titulo} style={[styles.dot, k === i && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.nav}>
        <FeraButton label="Voltar" variant="secondary" disabled={i === 0} onPress={() => ir(i - 1)} style={{ flex: 1 }} />
        <FeraButton label={i === slides.length - 1 ? 'Fim!' : 'Próximo'} disabled={i === slides.length - 1} onPress={() => ir(i + 1)} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { height: 440, borderRadius: radius.card, backgroundColor: colors.offWhite, padding: 22, gap: 10, overflow: 'hidden' },
  n: { fontFamily: fonts.nunito900, fontSize: 12, letterSpacing: 1, color: colors.textMuted },
  title: { fontFamily: fonts.fredoka700, fontSize: 30, lineHeight: 33, color: colors.text },
  text: { fontFamily: fonts.nunito700, fontSize: 17, lineHeight: 24, color: colors.text },
  destaque: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 16, height: 52, borderRadius: 16, backgroundColor: colors.white, justifyContent: 'center' },
  destaqueText: { fontFamily: fonts.fredoka700, fontSize: 24, color: colors.red },
  rugi: { position: 'absolute', right: 16, bottom: 0 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { width: 24, backgroundColor: colors.red },
  nav: { flexDirection: 'row', gap: 12 },
});
