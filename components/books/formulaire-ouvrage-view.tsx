import { type Control, useController } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bouton } from '@/components/bouton';
import type { OuvrageSaisi, SaisieOuvrage } from '@/domain/saisie-ouvrage';
import { theme } from '@/theme/tokens';
import { BasculeStatut, ChampTexte } from './champs-saisie';
import { ConfirmationAbandon } from './confirmation-abandon';
import { AvisIncertain, AvisIndisponible, AvisRefus } from './messages-creation';
import { ToastSucces } from './toast-succes';

type ControleSaisie = Control<SaisieOuvrage, unknown, OuvrageSaisi>;

type ChampTexteControleProps = {
  controle: ControleSaisie;
  nom: 'titre' | 'auteur' | 'editeur' | 'annee';
  libelle: string;
  enEnvoi: boolean;
  facultatif?: boolean;
  numerique?: boolean;
};

export type AvisCreation =
  | { type: 'refus'; message: string }
  | { type: 'indisponible'; message: string; secondesRestantes: number; reessayer: () => void }
  | { type: 'incertain'; message: string; verifierLeFonds: () => void; reessayer: () => void };

export type ToastCreation = {
  cle: number;
  titre: string;
  ouvrirFiche: () => void;
  suspendre: () => void;
  reprendre: () => void;
};

type FormulaireOuvrageViewProps = {
  controle: ControleSaisie;
  enEnvoi: boolean;
  enregistrer: () => void;
  quitter: () => void;
  confirmationAbandon: { confirmer: () => void; poursuivre: () => void } | null;
  avis: AvisCreation | null;
  toast: ToastCreation | null;
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

const AvisCreationView = ({ avis }: { avis: AvisCreation }) => {
  if (avis.type === 'refus') return <AvisRefus message={avis.message} />;
  if (avis.type === 'indisponible') return <AvisIndisponible {...avis} />;
  return <AvisIncertain {...avis} />;
};

export const FormulaireOuvrageView = ({
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
      <Bouton action={quitter} libelle="← Retour au fonds" variante="secondaire" />
      <Text accessibilityRole="header" style={styles.titre}>
        Ajouter un ouvrage
      </Text>
    </View>

    {confirmationAbandon === null ? null : <ConfirmationAbandon {...confirmationAbandon} />}
    {toast === null ? null : <ToastSucces key={toast.cle} {...toast} />}
    {avis === null ? null : <AvisCreationView avis={avis} />}

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
      <Bouton
        action={enregistrer}
        desactive={enEnvoi}
        libelle={enEnvoi ? 'Enregistrement en cours…' : 'Enregistrer l’ouvrage'}
      />
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
