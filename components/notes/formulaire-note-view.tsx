import { type Control, useController } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { ConfirmationAbandon } from '@/components/confirmation-abandon';
import { type AvisEcriture, AvisEcritureView } from '@/components/messages-ecriture';
import { ToastSucces } from '@/components/toast-succes';
import type { NoteSaisie, SaisieNote } from '@/domain/saisie-note';
import { theme } from '@/theme/tokens';
import { ChampNote } from './champ-note';

type ControleSaisieNote = Control<SaisieNote, unknown, NoteSaisie>;

export type ToastNote = {
  cle: number;
  message: string;
  suspendre: () => void;
  reprendre: () => void;
};

export type FormulaireNoteViewProps = {
  libelleChamp: string;
  libelleEnvoyer: string;
  libelleEffacer: string;
  controle: ControleSaisieNote;
  caracteresUtilises: number;
  caracteresMaximum: number;
  enEnvoi: boolean;
  envoyer: () => void;
  effacer: (() => void) | null;
  blocage: string | null;
  avis: AvisEcriture | null;
  toast: ToastNote | null;
  confirmationAbandon: { confirmer: () => void; poursuivre: () => void } | null;
};

export const FormulaireNoteView = ({
  libelleChamp,
  libelleEnvoyer,
  libelleEffacer,
  controle,
  caracteresUtilises,
  caracteresMaximum,
  enEnvoi,
  envoyer,
  effacer,
  blocage,
  avis,
  toast,
  confirmationAbandon,
}: FormulaireNoteViewProps) => {
  const { field, fieldState } = useController({ control: controle, name: 'contenu' });

  return (
    <View style={styles.formulaire}>
      <Text accessibilityRole="header" style={styles.titre}>
        Ajouter une note de lecture
      </Text>

      {confirmationAbandon === null ? null : <ConfirmationAbandon {...confirmationAbandon} />}
      {toast === null ? null : <ToastSucces key={toast.cle} {...toast} />}
      {avis === null ? null : <AvisEcritureView avis={avis} />}
      {blocage === null ? null : (
        <Text role="status" style={styles.blocage}>
          {blocage}
        </Text>
      )}

      <ChampNote
        caracteresMaximum={caracteresMaximum}
        caracteresUtilises={caracteresUtilises}
        desactive={enEnvoi}
        erreur={fieldState.error?.message}
        libelle={libelleChamp}
        modifier={field.onChange}
        quitter={field.onBlur}
        valeur={field.value}
      />

      <View style={styles.actions}>
        <Bouton action={envoyer} desactive={enEnvoi || blocage !== null} libelle={libelleEnvoyer} />
        {effacer === null ? null : (
          <Bouton
            action={effacer}
            desactive={enEnvoi}
            libelle={libelleEffacer}
            variante="secondaire"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formulaire: {
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
  blocage: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
