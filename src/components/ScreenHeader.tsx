import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeftIcon, CloseIcon } from '@/components/icons';
import { SquareButton } from '@/components/SquareButton';
import { colors, fonts, sizes } from '@/theme';

/** Topo com botão quadrado (voltar ou fechar) e título centralizado, como na Nova prova (04). */
export function ScreenHeader({ title, icon = 'back', onBack = () => router.back() }: { title: string; icon?: 'back' | 'close'; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <SquareButton label={icon === 'back' ? 'Voltar' : 'Fechar'} onPress={onBack}>
        {icon === 'back' ? <ChevronLeftIcon size={22} color={colors.text} /> : <CloseIcon size={20} />}
      </SquareButton>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: sizes.touch }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: sizes.touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.nunito800, fontSize: 17, color: colors.text },
});
