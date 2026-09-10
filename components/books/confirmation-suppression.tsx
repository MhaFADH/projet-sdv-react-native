import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { OuvrageASupprimer } from '@/domain/groupe-suppressions';
import { theme } from '@/theme/tokens';

type ConfirmationSuppressionProps = {
  visible: boolean;
  ouvrages: OuvrageASupprimer[];
  annuler: () => void;
  confirmer: () => void;
  desactivee?: boolean;
};

export const ConfirmationSuppression = ({
  visible,
  ouvrages,
  annuler,
  confirmer,
  desactivee = false,
}: ConfirmationSuppressionProps) => (
  <Modal animationType="fade" onRequestClose={annuler} transparent visible={visible}>
    <View style={styles.fond}>
      <View
        accessibilityLabel="Confirmation de suppression"
        accessibilityViewIsModal
        role="dialog"
        style={styles.dialogue}
      >
        <Text accessibilityRole="header" style={styles.titre}>
          Confirmer la suppression
        </Text>
        <Text style={styles.texte}>
          {ouvrages.length === 1
            ? 'Cet ouvrage sera masqué puis supprimé après cinq secondes.'
            : `${ouvrages.length} ouvrages seront masqués puis supprimés après cinq secondes.`}
        </Text>
        <View accessibilityLabel="Ouvrages à supprimer" role="list" style={styles.liste}>
          {ouvrages.map((ouvrage) => (
            <Text key={ouvrage.id} role="listitem" style={styles.ouvrage}>
              {ouvrage.titre}
            </Text>
          ))}
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Renoncer à la suppression"
            accessibilityRole="button"
            onPress={annuler}
            style={styles.boutonSecondaire}
          >
            <Text style={styles.texteSecondaire}>Renoncer</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Confirmer la suppression"
            accessibilityRole="button"
            accessibilityState={{ disabled: desactivee }}
            disabled={desactivee}
            onPress={confirmer}
            style={[styles.boutonDanger, desactivee && styles.boutonDesactive]}
          >
            <Text style={styles.texteDanger}>{desactivee ? 'Envoi en cours' : 'Supprimer'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  fond: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.overlay,
  },
  dialogue: {
    width: '100%',
    maxWidth: theme.layout.dialogMaxWidth,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.sectionTitle,
    fontWeight: '700',
  },
  texte: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  liste: { gap: theme.spacing.xs },
  ouvrage: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  boutonSecondaire: {
    minHeight: theme.minTargetSize,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  boutonDanger: {
    minHeight: theme.minTargetSize,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerText,
  },
  boutonDesactive: { opacity: 0.5 },
  texteSecondaire: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '700' },
  texteDanger: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
