import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CloseIcon, HeartIcon } from '@/components/icons';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, fonts, sizes } from '@/theme';

/** Topo da missão: sair (X), progresso e vidas. */
export function MissionHeader({ progress, lives, onClose }: { progress: number; lives: number | '∞'; onClose: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Sair da missão" onPress={onClose} style={styles.close}>
        <CloseIcon size={24} strokeWidth={3} color={colors.iconMuted} />
      </Pressable>
      <ProgressBar progress={progress} accessibilityLabel="Progresso da missão" />
      <View style={styles.lives} accessible accessibilityLabel={lives === '∞' ? 'Vidas infinitas' : `${lives} vidas`}>
        <HeartIcon size={24} shine={false} />
        <Text style={styles.livesText}>{lives}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: sizes.touch, flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  lives: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  livesText: { fontFamily: fonts.fredoka600, fontSize: 18, color: colors.red },
});
