import { StyleSheet, View } from 'react-native';
import { useStylesTheme } from '@/hooks/use-theme';
import type { Theme } from '@/theme/tokens';
import {
  ConfirmationSuppressionNote,
  type DemandeSuppressionNote,
} from './confirmation-suppression-note';
import { FormulaireNoteView, type FormulaireNoteViewProps } from './formulaire-note-view';
import type { CommandesSuppressionNote } from './vue-liste-notes';
import { type EtatNotes, VueListeNotes } from './vue-liste-notes';

type ListeSectionNotes = {
  etat: EtatNotes;
  titreOuvrage: string;
  suppression: CommandesSuppressionNote;
  messageListe: string | null;
  confirmation: DemandeSuppressionNote | null;
};

type VueSectionNotesProps = {
  formulaire: FormulaireNoteViewProps;
  liste: ListeSectionNotes | null;
};

export const VueSectionNotes = ({ formulaire, liste }: VueSectionNotesProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.section}>
      <FormulaireNoteView {...formulaire} />
      {liste === null ? null : (
        <>
          <VueListeNotes
            etat={liste.etat}
            messageListe={liste.messageListe}
            suppression={liste.suppression}
            titreOuvrage={liste.titreOuvrage}
          />
          <ConfirmationSuppressionNote demande={liste.confirmation} />
        </>
      )}
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    section: { gap: theme.spacing.lg },
  });
