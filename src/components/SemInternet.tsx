// Faixa "Sem internet" no alto de todas as telas (layout raiz). O app segue funcionando: o progresso fica no
// aparelho e sobe pra nuvem quando a conexão volta. Só gerar prova nova precisa de internet.
import { useNetworkState } from 'expo-network';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOffIcon } from '@/components/icons';
import { colors, fonts, radius } from '@/theme';

const ALTURA = 34;

export function SemInternet() {
  const insets = useSafeAreaInsets();
  const rede = useNetworkState();
  // Sem resposta ainda (undefined) conta como online: não pisca no começo.
  const offline = rede.isConnected === false || rede.isInternetReachable === false;
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withTiming(offline ? 1 : 0, { duration: 250, easing: Easing.out(Easing.quad) }));
  }, [offline, v]);
  const estilo = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (v.value - 1) * (ALTURA + 8) }] }));

  return (
    <Animated.View pointerEvents="none" style={[styles.faixa, { top: insets.top + 6 }, estilo]} accessibilityLiveRegion="polite" accessibilityElementsHidden={!offline}>
      <WifiOffIcon size={16} />
      <Text style={styles.texto} numberOfLines={1}>
        Sem internet · seu progresso fica salvo aqui
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  faixa: {
    position: 'absolute',
    alignSelf: 'center',
    height: ALTURA,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  texto: { fontFamily: fonts.nunito800, fontSize: 13, color: colors.white },
});
