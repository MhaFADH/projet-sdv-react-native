import { Pressable, StyleSheet, Text } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import { creerActivationParEspace } from '@/services/plateforme/activation-clavier';
import type { Theme } from '@/theme/tokens';

type CaseSelectionOuvrageProps = {
  titre: string;
  selectionne: boolean;
  desactivee: boolean;
  basculer: () => void;
};

export const CaseSelectionOuvrage = ({
  titre,
  selectionne,
  desactivee,
  basculer,
}: CaseSelectionOuvrageProps) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <Pressable
      {...creerActivationParEspace(basculer)}
      accessibilityLabel={t('ouvrage.selectionner', { titre })}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selectionne, disabled: desactivee }}
      aria-checked={selectionne}
      disabled={desactivee}
      onPress={basculer}
      style={[
        styles.caseSelection,
        selectionne && styles.caseSelectionnee,
        desactivee && styles.caseSelectionDesactivee,
      ]}
    >
      <Text selectable={false} style={styles.coche}>
        {selectionne ? '✓' : ''}
      </Text>
    </Pressable>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    caseSelection: {
      width: theme.minTargetSize,
      minWidth: theme.minTargetSize,
      minHeight: theme.minTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surface,
    },
    caseSelectionnee: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    caseSelectionDesactivee: {
      opacity: 0.5,
    },
    coche: {
      color: theme.colors.primaryText,
      fontSize: theme.typography.body,
      fontWeight: '700',
    },
  });
