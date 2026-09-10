import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme/tokens';

type SqueletteDonneesProps = {
  libelle: string;
  nombreLignes: number;
};

type EtatErreurProps = {
  titre: string;
  message: string;
  reessayer: () => void;
};

type EtatAbsenceProps = {
  titre: string;
  message: string;
  alerte?: boolean;
};

const identifiantsLignes = (nombreLignes: number): string[] =>
  Array.from({ length: nombreLignes }, (_valeur, index) => `squelette-${index + 1}`);

export const SqueletteDonnees = ({ libelle, nombreLignes }: SqueletteDonneesProps) => (
  <View accessibilityLabel={libelle} accessibilityRole="progressbar" style={styles.squelettes}>
    {identifiantsLignes(nombreLignes).map((identifiant) => (
      <View key={identifiant} testID="ligne-squelette" style={styles.squelette} />
    ))}
  </View>
);

export const EtatErreur = ({ titre, message, reessayer }: EtatErreurProps) => (
  <View accessibilityRole="alert" style={styles.erreur}>
    <Text accessibilityRole="header" style={[styles.titre, styles.titreErreur]}>
      {titre}
    </Text>
    <Text style={styles.message}>{message}</Text>
    <Pressable accessibilityRole="button" onPress={reessayer} style={styles.bouton}>
      <Text style={styles.texteBouton}>Réessayer</Text>
    </Pressable>
  </View>
);

export const EtatAbsence = ({ titre, message, alerte = false }: EtatAbsenceProps) => (
  <View accessibilityRole={alerte ? 'alert' : undefined} style={styles.absence}>
    <Text accessibilityRole="header" style={styles.titre}>
      {titre}
    </Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  squelettes: {
    gap: theme.spacing.md,
  },
  squelette: {
    minHeight: theme.layout.cardMinHeight,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  erreur: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBackground,
  },
  absence: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutralBackground,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.itemTitle,
    fontWeight: '700',
  },
  titreErreur: {
    color: theme.colors.dangerText,
  },
  message: {
    color: theme.colors.text,
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
