import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ControleStatutLecture,
  type ErreurStatutLecture,
} from '@/components/books/controle-statut-lecture';
import { Bouton } from '@/components/bouton';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { type EtatNotes, VueListeNotes } from '@/components/notes/vue-liste-notes';
import { libelleEditeur, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type EtatFiche =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | { type: 'introuvable'; message: string }
  | { type: 'masquee' }
  | {
      type: 'succes';
      ouvrage: Ouvrage;
      corriger: () => void;
      basculerStatut: () => void;
      statutEnCours: boolean;
      erreurStatut?: ErreurStatutLecture;
      demanderSuppression: () => void;
      suppressionDesactivee: boolean;
      etatNotes: EtatNotes;
    };

type FicheViewProps = {
  etat: EtatFiche;
  retour: () => void;
};

type EtatSucces = Extract<EtatFiche, { type: 'succes' }>;

const NOMBRE_LIGNES_SQUELETTE = 3;

const CadreFiche = ({ retour, children }: PropsWithChildren<Pick<FicheViewProps, 'retour'>>) => (
  <ScrollView contentContainerStyle={styles.conteneur}>
    <Pressable
      accessibilityLabel="Retour au fonds"
      accessibilityRole="button"
      onPress={retour}
      style={styles.boutonRetour}
    >
      <Text selectable={false} style={styles.texteBoutonRetour}>
        ← Retour au fonds
      </Text>
    </Pressable>
    {children}
  </ScrollView>
);

const Renseignement = ({ libelle, valeur }: { libelle: string; valeur: string }) => (
  <View style={styles.renseignement}>
    <Text style={styles.libelle}>{libelle}</Text>
    <Text style={styles.valeur}>{valeur}</Text>
  </View>
);

const FicheDetail = (etat: EtatSucces) => (
  <View style={styles.carte}>
    <Text accessibilityRole="header" style={styles.titre}>
      {etat.ouvrage.titre}
    </Text>
    <Renseignement libelle="Auteur" valeur={etat.ouvrage.auteur} />
    <Renseignement libelle="Éditeur" valeur={libelleEditeur(etat.ouvrage.editeur)} />
    <Renseignement libelle="Année de publication" valeur={String(etat.ouvrage.annee)} />
    <ControleStatutLecture
      basculerStatut={etat.basculerStatut}
      erreurStatut={etat.erreurStatut}
      ouvrage={etat.ouvrage}
      statutEnCours={etat.statutEnCours}
    />
    <Pressable
      accessibilityLabel={`Supprimer ${etat.ouvrage.titre}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: etat.suppressionDesactivee }}
      disabled={etat.suppressionDesactivee}
      onPress={etat.demanderSuppression}
      style={[styles.boutonSuppression, etat.suppressionDesactivee && styles.boutonDesactive]}
    >
      <Text selectable={false} style={styles.texteBoutonSuppression}>
        {etat.suppressionDesactivee
          ? 'Suppression indisponible pendant l’envoi'
          : 'Supprimer cet ouvrage'}
      </Text>
    </Pressable>
    <Bouton action={etat.corriger} libelle="Corriger cet ouvrage" />
  </View>
);

const ContenuFiche = ({ etat }: Pick<FicheViewProps, 'etat'>) => {
  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees libelle="Chargement de la fiche" nombreLignes={NOMBRE_LIGNES_SQUELETTE} />
    );
  }

  if (etat.type === 'erreur') {
    return (
      <EtatErreur
        message={etat.message}
        reessayer={etat.reessayer}
        titre="Impossible d'afficher cette fiche"
      />
    );
  }

  if (etat.type === 'introuvable') {
    return <EtatAbsence alerte message={etat.message} titre="Cette fiche n'est plus disponible" />;
  }

  if (etat.type === 'masquee') {
    return (
      <EtatAbsence
        message="Cet ouvrage est masqué jusqu’au résultat de la suppression. Utilisez le bandeau pour tout annuler avant l’envoi."
        titre="Suppression en attente"
      />
    );
  }

  return (
    <>
      <FicheDetail {...etat} />
      <VueListeNotes etat={etat.etatNotes} titreOuvrage={etat.ouvrage.titre} />
    </>
  );
};

export const FicheView = ({ etat, retour }: FicheViewProps) => (
  <CadreFiche retour={retour}>
    <ContenuFiche etat={etat} />
  </CadreFiche>
);

const styles = StyleSheet.create({
  conteneur: {
    width: '100%',
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  carte: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.pageTitle,
    fontWeight: '700',
  },
  renseignement: { gap: theme.spacing.xs },
  libelle: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
    letterSpacing: theme.typography.overlineLetterSpacing,
    textTransform: 'uppercase',
  },
  valeur: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  boutonRetour: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  texteBoutonRetour: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  boutonSuppression: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerText,
  },
  boutonDesactive: { opacity: 0.5 },
  texteBoutonSuppression: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
