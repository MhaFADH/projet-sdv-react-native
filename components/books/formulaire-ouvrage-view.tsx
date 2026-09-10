import { type Control, useController } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import { ConfirmationAbandon } from '@/components/confirmation-abandon';
import { type AvisEcriture, AvisEcritureView } from '@/components/messages-ecriture';
import { type ActionToast, ToastSucces } from '@/components/toast-succes';
import type { OuvrageSaisi, SaisieOuvrage } from '@/domain/saisie-ouvrage';
import { theme } from '@/theme/tokens';
import { BasculeStatut, ChampTexte } from './champs-saisie';

type ControleSaisie = Control<SaisieOuvrage, unknown, OuvrageSaisi>;

type ChampTexteControleProps = {
  controle: ControleSaisie;
  nom: 'titre' | 'auteur' | 'editeur' | 'annee';
  libelle: string;
  enEnvoi: boolean;
  facultatif?: boolean;
  numerique?: boolean;
};

export type ToastEcriture = {
  cle: number;
  message: string;
  action: ActionToast;
  suspendre: () => void;
  reprendre: () => void;
};

export type FormulaireOuvrageViewProps = {
  titre: string;
  libelleQuitter: string;
  libelleEnregistrer: string;
  controle: ControleSaisie;
  enEnvoi: boolean;
  enregistrer: () => void;
  quitter: () => void;
  confirmationAbandon: { confirmer: () => void; poursuivre: () => void } | null;
  avis: AvisEcriture | null;
  toast: ToastEcriture | null;
};

const ChampTexteControle = ({
  controle,
  nom,
  libelle,
  enEnvoi,
  facultatif,
  numerique,
}: ChampTexteControleProps) => {
  const { field, fieldState } = useController({ control: controle, name: nom });

  return (
    <ChampTexte
      desactive={enEnvoi}
      erreur={fieldState.error?.message}
      facultatif={facultatif}
      libelle={libelle}
      modifier={field.onChange}
      numerique={numerique}
      quitter={field.onBlur}
      valeur={field.value}
    />
  );
};

const BasculeStatutControle = ({
  controle,
  enEnvoi,
}: {
  controle: ControleSaisie;
  enEnvoi: boolean;
}) => {
  const { field } = useController({ control: controle, name: 'lu' });

  return <BasculeStatut desactive={enEnvoi} lu={field.value} modifier={field.onChange} />;
};

export const FormulaireOuvrageView = ({
  titre,
  libelleQuitter,
  libelleEnregistrer,
  controle,
  enEnvoi,
  enregistrer,
  quitter,
  confirmationAbandon,
  avis,
  toast,
}: FormulaireOuvrageViewProps) => (
  <ScrollView contentContainerStyle={styles.conteneur}>
    <View style={styles.entete}>
      <Bouton action={quitter} libelle={libelleQuitter} variante="secondaire" />
      <Text accessibilityRole="header" style={styles.titre}>
        {titre}
      </Text>
    </View>

    {confirmationAbandon === null ? null : <ConfirmationAbandon {...confirmationAbandon} />}
    {toast === null ? null : <ToastSucces key={toast.cle} {...toast} />}
    {avis === null ? null : <AvisEcritureView avis={avis} />}

    <View style={styles.carte}>
      <ChampTexteControle controle={controle} enEnvoi={enEnvoi} libelle="Titre" nom="titre" />
      <ChampTexteControle controle={controle} enEnvoi={enEnvoi} libelle="Auteur" nom="auteur" />
      <ChampTexteControle
        controle={controle}
        enEnvoi={enEnvoi}
        facultatif
        libelle="Éditeur"
        nom="editeur"
      />
      <ChampTexteControle
        controle={controle}
        enEnvoi={enEnvoi}
        libelle="Année de publication"
        nom="annee"
        numerique
      />
      <BasculeStatutControle controle={controle} enEnvoi={enEnvoi} />
      <Bouton action={enregistrer} desactive={enEnvoi} libelle={libelleEnregistrer} />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  conteneur: {
    width: '100%',
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  entete: {
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.pageTitle,
    fontWeight: '700',
  },
  carte: {
    gap: theme.spacing.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
});
