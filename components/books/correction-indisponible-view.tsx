import { ScrollView, StyleSheet, Text } from 'react-native';
import { Bouton } from '@/components/bouton';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { theme } from '@/theme/tokens';

type EtatCorrectionIndisponible =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | { type: 'introuvable'; message: string };

type CorrectionIndisponibleViewProps = {
  titre: string;
  libelleQuitter: string;
  etat: EtatCorrectionIndisponible;
  retour: () => void;
};

const NOMBRE_LIGNES_SQUELETTE = 4;

const Contenu = ({ etat }: Pick<CorrectionIndisponibleViewProps, 'etat'>) => {
  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees
        libelle="Chargement de l’ouvrage à corriger"
        nombreLignes={NOMBRE_LIGNES_SQUELETTE}
      />
    );
  }

  if (etat.type === 'erreur') {
    return (
      <EtatErreur
        message={etat.message}
        reessayer={etat.reessayer}
        titre="Impossible de charger cet ouvrage"
      />
    );
  }

  return <EtatAbsence alerte message={etat.message} titre="Cet ouvrage ne peut pas être corrigé" />;
};

export const CorrectionIndisponibleView = ({
  titre,
  libelleQuitter,
  etat,
  retour,
}: CorrectionIndisponibleViewProps) => (
  <ScrollView contentContainerStyle={styles.conteneur}>
    <Bouton action={retour} libelle={libelleQuitter} variante="secondaire" />
    <Text accessibilityRole="header" style={styles.titre}>
      {titre}
    </Text>
    <Contenu etat={etat} />
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
  titre: {
    color: theme.colors.text,
    fontSize: theme.typography.pageTitle,
    fontWeight: '700',
  },
});
