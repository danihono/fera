import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/materia" />
        <Stack.Screen name="onboarding/data" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="prova/nova" options={{ presentation: 'modal' }} />
        <Stack.Screen name="prova/gerando" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="missao/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="missao/fim" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="streak" options={{ presentation: 'modal' }} />
        <Stack.Screen name="vespera/[provaId]" options={{ animation: 'fade' }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        <Stack.Screen name="configuracoes" />
        <Stack.Screen name="conquistas" />
      </Stack>
    </SafeAreaProvider>
  );
}
