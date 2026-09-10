import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { libelleEditeur, libelleStatutLecture, type Ouvrage } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';

type ErreurStatut = {
  message: string;
  reessayer: () => void;
};

type EtatFiche =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | { type: 'introuvable'; message: string }
  | {
      type: 'succes';
      ouvrage: Ouvrage;
      basculerStatut: () => void;
      statutEnCours: boolean;
      erreurStatut?: ErreurStatut;
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

const ControleStatutLecture = ({
  ouvrage,
  basculerStatut,
  statutEnCours,
  erreurStatut,
}: Omit<EtatSucces, 'type'>) => {
  const action = ouvrage.lu ? 'Marquer comme non lu' : 'Marquer comme lu';
  return (
    <View style={styles.renseignement}>
      <Text style={styles.libelle}>Statut de lecture collectif</Text>
      <Text style={styles.valeur}>{libelleStatutLecture(ouvrage.lu)}</Text>
      <Pressable
        accessibilityLabel={action}
        accessibilityRole="switch"
        accessibilityState={{ checked: ouvrage.lu, disabled: statutEnCours }}
        aria-checked={ouvrage.lu}
        aria-disabled={statutEnCours}
        disabled={statutEnCours}
        onPress={basculerStatut}
        style={[styles.boutonStatut, statutEnCours && styles.boutonDesactive]}
      >
        <Text style={styles.texteBoutonStatut}>{action}</Text>
      </Pressable>
      {statutEnCours ? (
        <Text accessibilityLiveRegion="polite" style={styles.messageStatut}>
          Enregistrement du statut en cours…
        </Text>
      ) : null}
      {erreurStatut ? (
        <View accessibilityRole="alert" style={styles.erreurStatut}>
          <Text style={styles.texteErreur}>{erreurStatut.message}</Text>
          <Pressable
            accessibilityLabel="Réessayer la modification du statut"
            accessibilityRole="button"
            onPress={erreurStatut.reessayer}
            style={styles.boutonReessai}
          >
            <Text style={styles.texteBoutonReessai}>Réessayer</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const FicheDetail = (etat: EtatSucces) => (
  <View style={styles.carte}>
    <Text accessibilityRole="header" style={styles.titre}>
      {etat.ouvrage.titre}
    </Text>
    <Renseignement libelle="Auteur" valeur={etat.ouvrage.auteur} />
    <Renseignement libelle="Éditeur" valeur={libelleEditeur(etat.ouvrage.editeur)} />
    <Renseignement libelle="Année de publication" valeur={String(etat.ouvrage.annee)} />
    <ControleStatutLecture {...etat} />
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

  return <FicheDetail {...etat} />;
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
  boutonStatut: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  boutonDesactive: {
    opacity: 0.65,
  },
  texteBoutonStatut: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  messageStatut: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  erreurStatut: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerBackground,
  },
  texteErreur: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  boutonReessai: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.dangerText,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  texteBoutonReessai: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
