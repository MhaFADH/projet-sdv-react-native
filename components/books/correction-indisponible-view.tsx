import { ScrollView, StyleSheet, Text } from 'react-native';
import { Bouton } from '@/components/bouton';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';

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
  const t = useTraduction();

  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees
        libelle={t('correction.chargement')}
        nombreLignes={NOMBRE_LIGNES_SQUELETTE}
      />
    );
  }

  if (etat.type === 'erreur') {
    return (
      <EtatErreur
        message={etat.message}
        reessayer={etat.reessayer}
        titre={t('correction.erreurTitre')}
      />
    );
  }

  return <EtatAbsence alerte message={etat.message} titre={t('correction.indisponibleTitre')} />;
};

export const CorrectionIndisponibleView = ({
  titre,
  libelleQuitter,
  etat,
  retour,
}: CorrectionIndisponibleViewProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <ScrollView contentContainerStyle={styles.conteneur}>
      <Bouton action={retour} libelle={libelleQuitter} variante="secondaire" />
      <Text accessibilityRole="header" style={styles.titre}>
        {titre}
      </Text>
      <Contenu etat={etat} />
    </ScrollView>
  );
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
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
