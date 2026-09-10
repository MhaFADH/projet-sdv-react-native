import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme/tokens';

type ProprietesBarreSelectionSuppression = {
  nombreSelectionnes: number;
  suppressionDesactivee: boolean;
  demanderSuppression: () => void;
};

const libelleSelection = (nombre: number): string =>
  `${nombre} sélectionné${nombre === 1 ? '' : 's'} — Supprimer`;

export const BarreSelectionSuppression = ({
  nombreSelectionnes,
  suppressionDesactivee,
  demanderSuppression,
}: ProprietesBarreSelectionSuppression) => {
  const desactivee = nombreSelectionnes === 0 || suppressionDesactivee;
  const libelle = libelleSelection(nombreSelectionnes);

  return (
    <View accessibilityLiveRegion="polite" style={styles.barre}>
      <Pressable
        accessibilityLabel={libelle}
        accessibilityRole="button"
        accessibilityState={{ disabled: desactivee }}
        disabled={desactivee}
        onPress={demanderSuppression}
        style={[styles.bouton, desactivee && styles.boutonDesactive]}
      >
        <Text selectable={false} style={[styles.texte, desactivee && styles.texteDesactive]}>
          {libelle}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  barre: {
    alignItems: 'flex-end',
    padding: theme.spacing.sm,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerText,
  },
  boutonDesactive: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  texte: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  texteDesactive: {
    color: theme.colors.textMuted,
  },
});
