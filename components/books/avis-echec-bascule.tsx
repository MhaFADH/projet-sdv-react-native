import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme/tokens';

export type AvisReessai = {
  message: string;
  libelleReessai: string;
  reessayer: () => void;
};

type AvisEchecBasculeProps = AvisReessai;

export const AvisEchecBascule = ({ message, libelleReessai, reessayer }: AvisEchecBasculeProps) => (
  <View accessibilityRole="alert" style={styles.avis}>
    <Text style={styles.message}>{message}</Text>
    <Pressable
      accessibilityLabel={libelleReessai}
      accessibilityRole="button"
      onPress={reessayer}
      style={styles.bouton}
    >
      <Text selectable={false} style={styles.texteBouton}>
        Réessayer
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  avis: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerBackground,
  },
  message: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.dangerText,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  texteBouton: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
