import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { extraitNote, formaterDateNote, type NoteLecture } from '@/domain/note-lecture';
import { theme } from '@/theme/tokens';

export type DemandeSuppressionNote = {
  note: NoteLecture;
  titre: string;
  avertissement: string;
  libelleRenoncer: string;
  libelleConfirmer: string;
  renoncer: () => void;
  confirmer: () => void;
};

const ContenuConfirmation = ({
  note,
  titre,
  avertissement,
  libelleRenoncer,
  libelleConfirmer,
  renoncer,
  confirmer,
}: DemandeSuppressionNote) => (
  <View style={styles.fond}>
    <View
      accessibilityLabel="Confirmation de suppression de note"
      accessibilityViewIsModal
      role="dialog"
      style={styles.dialogue}
    >
      <Text accessibilityRole="header" style={styles.titre}>
        {titre}
      </Text>
      <Text style={styles.date}>Note du {formaterDateNote(note.createdAt)}</Text>
      <Text style={styles.extrait}>« {extraitNote(note.contenu)} »</Text>
      <Text style={styles.avertissement}>{avertissement}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={libelleRenoncer}
          accessibilityRole="button"
          onPress={renoncer}
          style={styles.boutonSecondaire}
        >
          <Text selectable={false} style={styles.texteSecondaire}>
            Renoncer
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={libelleConfirmer}
          accessibilityRole="button"
          onPress={confirmer}
          style={styles.boutonDanger}
        >
          <Text selectable={false} style={styles.texteDanger}>
            {libelleConfirmer}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
);

export const ConfirmationSuppressionNote = ({
  demande,
}: {
  demande: DemandeSuppressionNote | null;
}) => (
  <Modal
    animationType="fade"
    onRequestClose={() => demande?.renoncer()}
    transparent
    visible={demande !== null}
  >
    {demande === null ? null : <ContenuConfirmation {...demande} />}
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
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.metadata,
    fontWeight: '600',
  },
  extrait: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
    fontStyle: 'italic',
  },
  avertissement: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
    fontWeight: '600',
  },
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
  texteSecondaire: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  texteDanger: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
