// 13 · Fera+ (assinatura) — canvas artboard Premium.dc.html
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { FeraButton } from '@/components/FeraButton';
import { BanIcon, BookWaveIcon, ClipboardCheckIcon, CloseIcon, HeartWaveIcon, SparkleIcon } from '@/components/icons';
import { Rugi } from '@/components/Rugi';
import { InfoSheet } from '@/components/InfoSheet';
import { TapScale } from '@/components/TapScale';
import { Rolavel } from '@/components/Rolavel';
import { assinar, cancelarAssinatura, restaurarCompra } from '@/data/assinatura';
import { useApp } from '@/data/store';
import { pingPong, useLoop } from '@/lib/anim';
import { colors, fonts, radius, sizes, solidShadow, space } from '@/theme';

const BENEFITS: { icon: ReactNode; text: string }[] = [
  { icon: <BookWaveIcon size={24} color={colors.red} />, text: 'Provas ilimitadas' },
  { icon: <ClipboardCheckIcon size={24} color={colors.red} />, text: 'Simulados do ENEM' },
  { icon: <HeartWaveIcon size={24} />, text: 'Vidas infinitas' },
  { icon: <BanIcon size={24} color={colors.red} />, text: 'Sem anúncios' },
];

// Preços de exemplo (o design usa marcadores): 12 × 19,90 = 238,80 → anual 149,90 economiza 37%.
const PLANS = [
  { id: 'mensal', name: 'Mensal', price: 'R$ 19,90', note: 'por mês' },
  { id: 'anual', name: 'Anual', price: 'R$ 149,90', note: 'economiza 37%', badge: 'MAIS ESCOLHIDO' },
] as const;

export default function Premium() {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<(typeof PLANS)[number]['id']>('anual');
  const { premium } = useApp();
  const [sheet, setSheet] = useState<null | 'comprou' | 'restaurar' | 'gerenciar' | 'cancelar'>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Com as Functions no ar, o servidor ativa (e o app só acompanha); sem elas, é simulado no aparelho.
  const comprar = () => {
    setOcupado(true);
    assinar(plan)
      .then(() => setSheet('comprou'))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setOcupado(false));
  };
  const restaurar = () => {
    setOcupado(true);
    restaurarCompra()
      .then(() => setSheet('restaurar'))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setOcupado(false));
  };

  // crown 2.2s · twinkle 1.8s (atrasos 0 / .6s / 1.2s)
  const crown = useLoop(2200);
  const tw = [useLoop(1800), useLoop(1800, { delay: 600 }), useLoop(1800, { delay: 1200 })];
  const crownStyle = useAnimatedStyle(() => {
    const w = pingPong(crown.value);
    return { transform: [{ translateY: -4 * w }, { rotate: `${-6 + 3 * w}deg` }] };
  });

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + sizes.topExtra, paddingBottom: Math.max(insets.bottom, sizes.bottomExtra) + sizes.bottomExtra - sizes.shadow },
      ]}
    >
      {/* O topo vai junto no rolável: a coroa do Rugi passa por cima da área do topo sem ser cortada. */}
      <Rolavel>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => router.back()} style={styles.close}>
            <CloseIcon size={24} strokeWidth={3} color={colors.iconMuted} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={restaurar} style={styles.restore}>
            <Text style={styles.restoreText}>Restaurar compra</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.halo} />
          <Twinkle t={tw[0]} size={18} left={76} top={30} color={colors.red} />
          <Twinkle t={tw[1]} size={14} left={272} top={50} color={colors.redShine} />
          <Twinkle t={tw[2]} size={16} left={282} top={118} color={colors.red} />
          <View style={{ width: 132 }}>
            <Rugi mood="forca" width={132} accessibilityLabel="Rugi usando uma coroa vermelha e branca" />
            <Animated.View style={[styles.crown, crownStyle]}>
              <Svg width={62} height={46} viewBox="0 0 62 46">
                <Path d="M8 40 L4 12 L19 24 L31 6 L43 24 L58 12 L54 40 Z" fill={colors.white} stroke={colors.bookInk} strokeWidth={3.5} strokeLinejoin="round" />
                <Path d="M8 40 H54 V34 H8 Z" fill={colors.red} stroke={colors.bookInk} strokeWidth={3.5} strokeLinejoin="round" />
                <Circle cx={31} cy={6} r={4} fill={colors.red} stroke={colors.bookInk} strokeWidth={2.5} />
                <Circle cx={4} cy={12} r={3.2} fill={colors.red} stroke={colors.bookInk} strokeWidth={2.5} />
                <Circle cx={58} cy={12} r={3.2} fill={colors.red} stroke={colors.bookInk} strokeWidth={2.5} />
                <Circle cx={31} cy={26} r={4} fill={colors.red} />
              </Svg>
            </Animated.View>
          </View>
        </View>

        <View style={styles.brand}>
          <Text style={styles.logo}>
            Fera<Text style={{ color: colors.text }}>+</Text>
          </Text>
          <Text style={styles.tagline}>Estuda sem limite. Vira fera mais rápido.</Text>
        </View>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefit}>
              <View style={styles.benefitIcon}>{b.icon}</View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans} accessibilityRole="radiogroup" accessibilityLabel="Planos">
          {PLANS.map((p) => {
            const on = p.id === plan;
            return (
              <TapScale
                key={p.id}
                scale={0.97}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setPlan(p.id)}
                style={[styles.plan, on && styles.planOn]}
              >
                {'badge' in p && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planName, on && { color: colors.redText }]}>{p.name}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={[styles.planNote, on && { fontFamily: fonts.nunito800, color: colors.redText }]}>{p.note}</Text>
              </TapScale>
            );
          })}
        </View>
      </Rolavel>
      <FeraButton
        label={ocupado ? 'Um instante…' : premium ? 'Gerenciar assinatura' : 'Quero ser Fera+'}
        variant={premium ? 'secondary' : 'primary'}
        disabled={ocupado}
        onPress={premium ? () => setSheet('gerenciar') : comprar}
      />

      {/* Prévia: sem pagamento de verdade ainda. */}
      {sheet === 'comprou' && (
        <InfoSheet
          mood="comemorando"
          title="Agora você é Fera+!"
          text={`Plano ${plan === 'anual' ? 'anual' : 'mensal'} ativado. Isto é uma prévia: nenhuma cobrança foi feita.`}
          button="Bora!"
          onConfirm={() => router.back()}
          onClose={() => setSheet(null)}
        />
      )}
      {/* Na versão final quem gerencia é a loja (App Store / Google Play); aqui dá pra voltar pro grátis e testar. */}
      {sheet === 'gerenciar' && (
        <InfoSheet
          mood="trofeu"
          title="Você é Fera+"
          text="Vidas infinitas, IA completa e até 4 formatos por prova. Nas lojas, a assinatura se gerencia nos ajustes do celular. Aqui é prévia: cancelar só volta pro grátis."
          button="Continuar Fera+"
          secondary={{ label: 'Cancelar assinatura', onPress: () => setSheet('cancelar') }}
          onClose={() => setSheet((s) => (s === 'gerenciar' ? null : s))}
        />
      )}
      {sheet === 'cancelar' && (
        <InfoSheet
          mood="triste"
          title="Cancelar o Fera+?"
          text="Você volta pro plano grátis: 5 vidas por missão, 2 formatos por prova e a IA grátis. Suas provas e seu XP continuam."
          button="Ficar no Fera+"
          secondary={{
            label: 'Cancelar mesmo',
            onPress: () => {
              setOcupado(true);
              cancelarAssinatura()
                .then(() => router.back())
                .catch((e: Error) => setErro(e.message))
                .finally(() => setOcupado(false));
            },
          }}
          onClose={() => setSheet((s) => (s === 'cancelar' ? null : s))}
        />
      )}
      {sheet === 'restaurar' && (
        <InfoSheet
          mood={premium ? 'comemorando' : 'pensativo'}
          title={premium ? 'Tudo certo!' : 'Nada pra restaurar'}
          text={premium ? 'Sua assinatura Fera+ já está ativa.' : 'Não achamos nenhuma compra nessa conta.'}
          button="Entendi"
          onClose={() => setSheet(null)}
        />
      )}
      {erro && <InfoSheet mood="pensativo" title="Não deu" text={erro} button="Beleza" onClose={() => setErro(null)} />}
    </View>
  );
}

/** twinkle 1.8s: cresce de .6 a 1 e acende (.3 → 1). */
function Twinkle({ t, size, left, top, color }: { t: SharedValue<number>; size: number; left: number; top: number; color: string }) {
  const style = useAnimatedStyle(() => {
    const w = pingPong(t.value);
    return { opacity: 0.3 + 0.7 * w, transform: [{ scale: 0.6 + 0.4 * w }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left, top }, style]}>
      <SparkleIcon size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.gutter },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  restore: { height: 44, paddingHorizontal: 6, justifyContent: 'center' }, // padding padrão de <button>
  restoreText: { fontFamily: fonts.nunito800, fontSize: 15, color: colors.textMuted },
  // Coordenadas do design (largura 350 do conteúdo): halo em 95, estrelas em 76 / 272 / 282.
  hero: { width: 350, alignSelf: 'center', height: 164, alignItems: 'center', justifyContent: 'flex-end' },
  halo: { position: 'absolute', left: 95, top: 14, width: 160, height: 160, borderRadius: 80, backgroundColor: colors.redSoft },
  crown: { position: 'absolute', left: 25, top: -30 },
  brand: { marginTop: 12, alignItems: 'center' },
  logo: { fontFamily: fonts.fredoka700, fontSize: 46, lineHeight: 46, color: colors.red },
  tagline: { marginTop: 6, fontFamily: fonts.nunito700, fontSize: 16, color: colors.textMuted },
  benefits: { marginTop: 18, gap: 8 },
  benefit: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  benefitText: { fontFamily: fonts.nunito800, fontSize: 17, color: colors.text },
  plans: { marginTop: 22, flexDirection: 'row', gap: 12 },
  plan: {
    flex: 1,
    height: 104,
    borderRadius: radius.option,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 4,
  },
  planOn: { borderWidth: 3, borderColor: colors.red, backgroundColor: colors.redSoft, boxShadow: solidShadow(colors.red) },
  planBadge: { position: 'absolute', top: -13, left: 14, height: 24, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.red, justifyContent: 'center' },
  planBadgeText: { fontFamily: fonts.nunito900, fontSize: 11, letterSpacing: 0.8, color: colors.white },
  planName: { fontFamily: fonts.nunito800, fontSize: 14, color: colors.textMuted },
  planPrice: { fontFamily: fonts.fredoka700, fontSize: 22, color: colors.text },
  planNote: { fontFamily: fonts.nunito700, fontSize: 13, color: colors.textMuted },
});
