import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { theme } from '@/theme/tokens';

type ConfirmationAbandonProps = {
  confirmer: () => void;
  poursuivre: () => void;
};

export const ConfirmationAbandon = ({ confirmer, poursuivre }: ConfirmationAbandonProps) => (
  <View accessibilityRole="alert" style={styles.cadre}>
    <Text accessibilityRole="header" style={styles.titre}>
      Abandonner cette saisie ?
    </Text>
    <Text style={styles.message}>
      Les informations saisies ne sont pas enregistrées. Elles seront perdues si vous quittez le
      formulaire.
    </Text>
    <View style={styles.actions}>
      <Bouton action={poursuivre} libelle="Poursuivre la saisie" />
      <Bouton action={confirmer} libelle="Abandonner la saisie" variante="secondaire" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  cadre: {
    gap: theme.spacing.sm,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.itemTitle,
    fontWeight: '700',
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
});
