import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme/tokens';

type GlobalErrorViewProps = {
  retry: () => void;
};

export const GlobalErrorView = ({ retry }: GlobalErrorViewProps) => (
  <View accessibilityRole="alert" style={styles.page}>
    <View style={styles.carte}>
      <Text accessibilityRole="header" style={styles.titre}>
        Une erreur inattendue est survenue
      </Text>
      <Text style={styles.message}>
        L&apos;application ne peut pas afficher cette page pour le moment.
      </Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.bouton}>
        <Text style={styles.texteBouton}>Réessayer</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  carte: {
    width: '100%',
    maxWidth: theme.layout.dialogMaxWidth,
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.sectionTitle,
    fontWeight: '700',
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  texteBouton: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
