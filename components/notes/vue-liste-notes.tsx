import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SqueletteDonnees } from '@/components/etats-donnees';
import { formaterDateNote, type NoteLecture } from '@/domain/note-lecture';
import { theme } from '@/theme/tokens';

export type EtatNotes =
  | { type: 'chargement' }
  | { type: 'vide' }
  | { type: 'erreur'; message: string; reessayer: () => void; reessaiEnCours: boolean }
  | { type: 'succes'; notes: NoteLecture[] };

type ProprietesVueListeNotes = {
  etat: EtatNotes;
  titreOuvrage: string;
};

const VueNote = ({ note }: { note: NoteLecture }) => (
  <View role="listitem" style={styles.note}>
    <Text style={styles.contenu}>{note.contenu}</Text>
    <Text style={styles.date}>{formaterDateNote(note.createdAt)}</Text>
  </View>
);

const ContenuNotes = ({ etat, titreOuvrage }: ProprietesVueListeNotes) => {
  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees libelle={`Chargement des notes de ${titreOuvrage}`} nombreLignes={2} />
    );
  }

  if (etat.type === 'vide') {
    return <Text style={styles.message}>Aucune note de lecture pour {titreOuvrage}.</Text>;
  }

  if (etat.type === 'erreur') {
    return (
      <View accessibilityRole="alert" style={styles.erreur}>
        <Text style={styles.message}>{etat.message}</Text>
        <Pressable
          accessibilityLabel="Réessayer le chargement des notes"
          accessibilityRole="button"
          accessibilityState={{ disabled: etat.reessaiEnCours }}
          disabled={etat.reessaiEnCours}
          onPress={etat.reessayer}
          style={[styles.bouton, etat.reessaiEnCours && styles.desactive]}
        >
          <Text style={styles.texteBouton}>
            {etat.reessaiEnCours ? 'Nouvel essai en cours' : 'Réessayer'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View accessibilityLabel={`Notes de lecture de ${titreOuvrage}`} role="list">
      {etat.notes.map((note) => (
        <VueNote key={note.id} note={note} />
      ))}
    </View>
  );
};

export const VueListeNotes = ({ etat, titreOuvrage }: ProprietesVueListeNotes) => (
  <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.titre}>
      Notes de lecture
    </Text>
    <ContenuNotes etat={etat} titreOuvrage={titreOuvrage} />
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.sectionTitle,
    fontWeight: '700',
  },
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
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.metadata,
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  erreur: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerBackground,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  texteBouton: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  desactive: { opacity: 0.5 },
});
