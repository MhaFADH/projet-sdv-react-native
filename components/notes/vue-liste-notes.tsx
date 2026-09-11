import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SqueletteDonnees } from '@/components/etats-donnees';
import type { NoteLecture } from '@/domain/note-lecture';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import type { AvisSuppressionNote } from './avis-suppression-note';
import { VueNote } from './vue-note';

export type EtatNotes =
  | { type: 'chargement' }
  | { type: 'vide' }
  | { type: 'erreur'; message: string; reessayer: () => void; reessaiEnCours: boolean }
  | { type: 'succes'; notes: NoteLecture[] };

export type CommandesSuppressionNote = {
  libelle: string;
  libelleEnvoiEnCours: string;
  demander: (note: NoteLecture) => void;
  enEnvoi: (noteId: string) => boolean;
  avis: (noteId: string) => AvisSuppressionNote | null;
};

type ProprietesVueListeNotes = {
  etat: EtatNotes;
  titreOuvrage: string;
  suppression: CommandesSuppressionNote;
  messageListe: string | null;
};

const ContenuNotes = ({
  etat,
  titreOuvrage,
  suppression,
}: Omit<ProprietesVueListeNotes, 'messageListe'>) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees libelle={t('notes.chargement', { titre: titreOuvrage })} nombreLignes={2} />
    );
  }

  if (etat.type === 'vide') {
    return <Text style={styles.message}>{t('notes.vide', { titre: titreOuvrage })}</Text>;
  }

  if (etat.type === 'erreur') {
    return (
      <View accessibilityRole="alert" style={styles.erreur}>
        <Text style={styles.message}>{etat.message}</Text>
        <Pressable
          accessibilityLabel={t('notes.reessaiChargement')}
          accessibilityRole="button"
          accessibilityState={{ disabled: etat.reessaiEnCours }}
          disabled={etat.reessaiEnCours}
          onPress={etat.reessayer}
          style={[styles.bouton, etat.reessaiEnCours && styles.desactive]}
        >
          <Text style={styles.texteBouton}>
            {t(etat.reessaiEnCours ? 'notes.reessaiEnCours' : 'etats.reessayer')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View accessibilityLabel={t('notes.liste', { titre: titreOuvrage })} role="list">
      {etat.notes.map((note) => (
        <VueNote
          key={note.id}
          note={note}
          suppression={{
            libelle: suppression.libelle,
            libelleEnvoiEnCours: suppression.libelleEnvoiEnCours,
            enEnvoi: suppression.enEnvoi(note.id),
            demander: () => suppression.demander(note),
            avis: suppression.avis(note.id),
          }}
        />
      ))}
    </View>
  );
};

export const VueListeNotes = ({
  etat,
  titreOuvrage,
  suppression,
  messageListe,
}: ProprietesVueListeNotes) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.titre}>
        {t('notes.section')}
      </Text>
      {messageListe === null ? null : (
        <Text role="status" style={styles.messageListe}>
          {messageListe}
        </Text>
      )}
      <ContenuNotes etat={etat} suppression={suppression} titreOuvrage={titreOuvrage} />
    </View>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
    messageListe: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
      lineHeight: theme.typography.bodyLineHeight,
      fontWeight: '600',
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
