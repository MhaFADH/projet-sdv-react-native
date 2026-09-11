import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import { type DetailFiche, FicheDetail } from './fiche-detail';

export type EtatFiche =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | { type: 'introuvable'; message: string }
  | { type: 'masquee' }
  | ({ type: 'succes' } & DetailFiche);

type FicheViewProps = {
  etat: EtatFiche;
  retour: () => void;
  sectionNotes?: ReactNode;
};

const NOMBRE_LIGNES_SQUELETTE = 3;

const CadreFiche = ({ retour, children }: PropsWithChildren<Pick<FicheViewProps, 'retour'>>) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <ScrollView contentContainerStyle={styles.conteneur}>
      <Pressable
        accessibilityLabel={t('fiche.retour')}
        accessibilityRole="button"
        onPress={retour}
        style={styles.boutonRetour}
      >
        <Text selectable={false} style={styles.texteBoutonRetour}>
          {`← ${t('fiche.retour')}`}
        </Text>
      </Pressable>
      {children}
    </ScrollView>
  );
};

const ContenuFiche = ({ etat }: Pick<FicheViewProps, 'etat'>) => {
  const t = useTraduction();

  if (etat.type === 'chargement') {
    return (
      <SqueletteDonnees libelle={t('fiche.chargement')} nombreLignes={NOMBRE_LIGNES_SQUELETTE} />
    );
  }

  if (etat.type === 'erreur') {
    return (
      <EtatErreur
        message={etat.message}
        reessayer={etat.reessayer}
        titre={t('fiche.erreurTitre')}
      />
    );
  }

  if (etat.type === 'introuvable') {
    return <EtatAbsence alerte message={etat.message} titre={t('fiche.introuvableTitre')} />;
  }

  if (etat.type === 'masquee') {
    return <EtatAbsence message={t('fiche.masqueeMessage')} titre={t('fiche.masqueeTitre')} />;
  }

  return <FicheDetail {...etat} />;
};

export const FicheView = ({ etat, retour, sectionNotes = null }: FicheViewProps) => (
  <CadreFiche retour={retour}>
    <ContenuFiche etat={etat} />
    {sectionNotes}
  </CadreFiche>
);

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    conteneur: {
      width: '100%',
      maxWidth: theme.layout.contentMaxWidth,
      alignSelf: 'center',
      padding: theme.spacing.md,
      gap: theme.spacing.lg,
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
