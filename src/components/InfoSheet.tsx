import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { FeraButton } from '@/components/FeraButton';
import { Rugi, type RugiMood } from '@/components/Rugi';
import { colors, fonts, type } from '@/theme';

type Props = {
  mood: RugiMood;
  title: string;
  text: string;
  button: string;
  /** Roda depois que a sheet fecha pelo botão. */
  onConfirm?: () => void;
  onClose: () => void;
};

/** Aviso rápido em sheet: Rugi espiando no canto, título, texto e um botão. */
export function InfoSheet({ mood, title, text, button, onConfirm, onClose }: Props) {
  return (
    <BottomSheet onClose={onClose}>
      {(close) => (
        <>
          <View style={styles.rugi} pointerEvents="none">
            <Rugi mood={mood} width={96} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
          </View>
          <FeraButton label={button} onPress={() => close(onConfirm)} />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  rugi: { position: 'absolute', right: 18, top: -64 },
  texts: { gap: 8, paddingRight: 96, marginBottom: 6 },
  title: { ...type.screenTitle, lineHeight: 31, color: colors.text },
  text: { fontFamily: fonts.nunito700, fontSize: 16, lineHeight: 22, color: colors.textMuted },
});
