import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.white } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="provas" options={{ title: 'Provas' }} />
      <Tabs.Screen name="turma" options={{ title: 'Turma' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
