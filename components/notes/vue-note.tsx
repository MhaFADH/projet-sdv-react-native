import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formaterDateNote, libelleNote, type NoteLecture } from '@/domain/note-lecture';
import { theme } from '@/theme/tokens';
import { type AvisSuppressionNote, VueAvisSuppressionNote } from './avis-suppression-note';

type ActionSuppressionNote = {
  libelle: string;
  libelleEnvoiEnCours: string;
  enEnvoi: boolean;
  demander: () => void;
  avis: AvisSuppressionNote | null;
};

type VueNoteProps = {
  note: NoteLecture;
  suppression: ActionSuppressionNote;
};

export const VueNote = ({ note, suppression }: VueNoteProps) => {
  const { enEnvoi, avis } = suppression;

  return (
    <View role="listitem" style={styles.note}>
      <Text style={styles.contenu}>{note.contenu}</Text>
      <View style={styles.pied}>
        <Text style={styles.date}>{formaterDateNote(note.createdAt)}</Text>
        <Pressable
          accessibilityLabel={`Supprimer la ${libelleNote(note)}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: enEnvoi, busy: enEnvoi }}
          disabled={enEnvoi}
          onPress={suppression.demander}
          style={[styles.bouton, enEnvoi && styles.boutonDesactive]}
        >
          <Text selectable={false} style={styles.texteBouton}>
            {enEnvoi ? suppression.libelleEnvoiEnCours : suppression.libelle}
          </Text>
        </Pressable>
      </View>
      {avis === null ? null : <VueAvisSuppressionNote {...avis} />}
    </View>
  );
};

const styles = StyleSheet.create({
  note: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borderWidth,
    borderBottomColor: theme.colors.border,
  },
  contenu: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  pied: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.metadata,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.dangerText,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  boutonDesactive: { opacity: 0.5 },
  texteBouton: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
