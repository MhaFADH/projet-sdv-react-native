import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFormats } from '@/hooks/use-formats';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

type ProprietesBarreSelectionSuppression = {
  nombreSelectionnes: number;
  suppressionDesactivee: boolean;
  demanderSuppression: () => void;
};

export const BarreSelectionSuppression = ({
  nombreSelectionnes,
  suppressionDesactivee,
  demanderSuppression,
}: ProprietesBarreSelectionSuppression) => {
  const t = useTraduction();
  const { nombre } = useFormats();
  const styles = useStylesTheme(creerStyles);
  if (nombreSelectionnes === 0) return null;
  const desactivee = suppressionDesactivee;
  const libelle = t('selection.action', {
    count: nombreSelectionnes,
    nombre: nombre(nombreSelectionnes),
  });

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

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    barre: { alignSelf: 'flex-end' },
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
