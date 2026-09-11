import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { libelleReessaiTemporise } from '@/components/messages-ecriture';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';

export type AvisSuppressionNote = {
  message: string;
  libelleReessayer: string;
  reessayer: () => void;
  secondesRestantes: number;
  verifier?: { libelle: string; executer: () => void };
};

export const VueAvisSuppressionNote = ({
  message,
  libelleReessayer,
  reessayer,
  secondesRestantes,
  verifier,
}: AvisSuppressionNote) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <View accessibilityRole="alert" style={styles.cadre}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {verifier === undefined ? null : (
          <Bouton action={verifier.executer} libelle={verifier.libelle} variante="secondaire" />
        )}
        <Bouton
          action={reessayer}
          desactive={secondesRestantes > 0}
          libelle={libelleReessaiTemporise(secondesRestantes, libelleReessayer)}
        />
      </View>
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    cadre: {
      gap: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.dangerBackground,
      padding: theme.spacing.md,
    },
    message: {
      color: theme.colors.dangerText,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
