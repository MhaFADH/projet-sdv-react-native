import { Pressable, StyleSheet, Text } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

type BoutonProps = {
  libelle: string;
  action: () => void;
  variante?: 'primaire' | 'secondaire';
  desactive?: boolean;
  indication?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const Bouton = ({
  libelle,
  action,
  variante = 'primaire',
  desactive = false,
  indication,
  onFocus,
  onBlur,
}: BoutonProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <Pressable
      accessibilityHint={indication}
      accessibilityRole="button"
      accessibilityState={{ disabled: desactive }}
      disabled={desactive}
      onBlur={onBlur}
      onFocus={onFocus}
      onPress={action}
      style={[
        styles.bouton,
        variante === 'secondaire' && styles.boutonSecondaire,
        desactive && styles.boutonDesactive,
      ]}
    >
      <Text
        style={[
          styles.texte,
          variante === 'secondaire' && styles.texteSecondaire,
          desactive && styles.texteDesactive,
        ]}
      >
        {libelle}
      </Text>
    </Pressable>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    bouton: {
      minHeight: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
    },
    boutonSecondaire: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    boutonDesactive: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
    },
    texte: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
    texteSecondaire: {
      color: theme.colors.primary,
    },
    texteDesactive: {
      color: theme.colors.textMuted,
    },
  });
