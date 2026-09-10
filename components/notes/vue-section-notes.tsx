import { StyleSheet, View } from 'react-native';
import { theme } from '@/theme/tokens';
import { FormulaireNoteView, type FormulaireNoteViewProps } from './formulaire-note-view';
import { type EtatNotes, VueListeNotes } from './vue-liste-notes';

type VueSectionNotesProps = {
  formulaire: FormulaireNoteViewProps;
  liste: { etat: EtatNotes; titreOuvrage: string } | null;
};

export const VueSectionNotes = ({ formulaire, liste }: VueSectionNotesProps) => (
  <View style={styles.section}>
    <FormulaireNoteView {...formulaire} />
    {liste === null ? null : <VueListeNotes etat={liste.etat} titreOuvrage={liste.titreOuvrage} />}
  </View>
);

const styles = StyleSheet.create({
  section: { gap: theme.spacing.lg },
});
