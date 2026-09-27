import { router, type Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, sizes, solidShadow } from '@/theme';
import { ExamsIcon, HomeIcon, PawPlusIcon, PodiumIcon, ProfileIcon } from './icons';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const tabs = {
  index: { label: 'Início', Icon: HomeIcon },
  provas: { label: 'Provas', Icon: ExamsIcon },
  turma: { label: 'Turma', Icon: PodiumIcon },
  perfil: { label: 'Perfil', Icon: ProfileIcon },
} as const;

type TabName = keyof typeof tabs;
const left: TabName[] = ['index', 'provas'];
const right: TabName[] = ['turma', 'perfil'];

/**
 * Tab bar do Fera (canvas "Componente · Tab bar"): branca, cantos de 24 no topo, borda 2px,
 * 4 abas + botão central flutuante de patinha (68px, borda branca 4px, sombra sólida 4px).
 * Altura 98 num iPhone com home indicator (64 + 34 de safe area).
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);
  const current = state.routes[state.index]?.name;

  const renderTab = (name: TabName) => {
    const { label, Icon } = tabs[name];
    const active = current === name;
    return (
      <Pressable
        key={name}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        onPress={() => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return;
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) navigation.navigate(name);
        }}
        style={styles.tab}
      >
        <View style={[styles.iconPill, active && { backgroundColor: colors.redSoft }]}>
          <Icon active={active} />
        </View>
        <Text style={[styles.label, active ? styles.labelActive : null]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { height: 64 + bottom, paddingBottom: bottom }]}>
      {left.map(renderTab)}
      <View style={styles.centerSlot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova prova"
          onPress={() => router.push('/prova/nova')}
          style={({ pressed }) => [
            styles.centerButton,
            {
              boxShadow: pressed ? 'none' : solidShadow(colors.redDeep),
              transform: [{ translateY: pressed ? sizes.shadow : 0 }],
            },
          ]}
        >
          <PawPlusIcon />
        </Pressable>
      </View>
      {right.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    gap: 4,
  },
  iconPill: {
    width: 56,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.nunito700,
    fontSize: 12,
    lineHeight: 14,
    color: colors.textMuted,
  },
  labelActive: {
    fontFamily: fonts.nunito800,
    color: colors.redText,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  centerButton: {
    width: 68,
    height: 68,
    marginTop: -36,
    borderRadius: 34,
    backgroundColor: colors.red,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
