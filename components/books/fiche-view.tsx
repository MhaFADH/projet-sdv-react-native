import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { libelleEditeur, libelleStatutLecture, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type EtatFiche =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | { type: 'introuvable'; message: string }
  | { type: 'succes'; ouvrage: Ouvrage };

type FicheViewProps = {
  etat: EtatFiche;
  retour: () => void;
};

const NOMBRE_LIGNES_SQUELETTE = 3;

const CadreFiche = ({ retour, children }: PropsWithChildren<Pick<FicheViewProps, 'retour'>>) => (
  <ScrollView contentContainerStyle={styles.conteneur}>
    <Pressable
      accessibilityLabel="Retour au fonds"
      accessibilityRole="button"
      onPress={retour}
      style={styles.boutonRetour}
    >
      <Text style={styles.texteBoutonRetour}>← Retour au fonds</Text>
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

const FicheDetail = ({ ouvrage }: { ouvrage: Ouvrage }) => (
  <View style={styles.carte}>
    <Text accessibilityRole="header" style={styles.titre}>
      {ouvrage.titre}
    </Text>
    <Renseignement libelle="Auteur" valeur={ouvrage.auteur} />
    <Renseignement libelle="Éditeur" valeur={libelleEditeur(ouvrage.editeur)} />
    <Renseignement libelle="Année de publication" valeur={String(ouvrage.annee)} />
    <Renseignement libelle="Statut de lecture" valeur={libelleStatutLecture(ouvrage.lu)} />
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

  return <FicheDetail ouvrage={etat.ouvrage} />;
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
  renseignement: {
    gap: theme.spacing.xs,
  },
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
});
