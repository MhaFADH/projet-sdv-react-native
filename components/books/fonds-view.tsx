import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FiltresTriFonds } from '@/components/books/filtres-tri-fonds';
import { Bouton } from '@/components/bouton';
import type { ConsultationFonds } from '@/domain/criteres-ouvrages';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import { ContenuFonds } from './contenu-fonds';
import type { EtatFonds } from './etat-fonds';
import { RechercheFonds } from './recherche-fonds';

type FondsViewProps = {
  etat: EtatFonds;
  ajouterOuvrage: () => void;
  ouvrirPreferences: () => void;
  recherche?: {
    valeurAppliquee: string;
    appliquer: (recherche: string) => void;
  };
  criteres?: {
    consultation: ConsultationFonds;
    appliquer: (consultation: ConsultationFonds) => void;
  };
};

const EnteteFonds = ({
  ajouterOuvrage,
  ouvrirPreferences,
}: Pick<FondsViewProps, 'ajouterOuvrage' | 'ouvrirPreferences'>) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);

  return (
    <View style={styles.entete}>
      <Text style={styles.surtitre}>{t('fonds.surtitre')}</Text>
      <Text accessibilityRole="header" style={styles.titre}>
        {t('fonds.titre')}
      </Text>
      <View style={styles.actions}>
        <Bouton action={ajouterOuvrage} libelle={t('fonds.ajouter')} />
        <Bouton action={ouvrirPreferences} libelle={t('preferences.acces')} variante="secondaire" />
      </View>
    </View>
  );
};

type CadreFondsProps = PropsWithChildren<
  Pick<FondsViewProps, 'ajouterOuvrage' | 'ouvrirPreferences' | 'recherche' | 'criteres'>
>;

const CadreFonds = ({
  ajouterOuvrage,
  ouvrirPreferences,
  recherche,
  criteres,
  children,
}: CadreFondsProps) => {
  const styles = useStylesTheme(creerStyles);

  return (
    <ScrollView contentContainerStyle={styles.conteneur} keyboardShouldPersistTaps="handled">
      <EnteteFonds ajouterOuvrage={ajouterOuvrage} ouvrirPreferences={ouvrirPreferences} />
      {recherche ? <RechercheFonds {...recherche} /> : null}
      {criteres ? <FiltresTriFonds {...criteres} /> : null}
      {children}
    </ScrollView>
  );
};

export const FondsView = ({
  etat,
  ajouterOuvrage,
  ouvrirPreferences,
  recherche,
  criteres,
}: FondsViewProps) => (
  <CadreFonds
    ajouterOuvrage={ajouterOuvrage}
    criteres={criteres}
    ouvrirPreferences={ouvrirPreferences}
    recherche={recherche}
  >
    <ContenuFonds criteres={criteres} etat={etat} recherche={recherche} />
  </CadreFonds>
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
    entete: {
      gap: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
    surtitre: {
      color: theme.colors.primary,
      fontSize: theme.typography.caption,
      fontWeight: '700',
      letterSpacing: theme.typography.overlineLetterSpacing,
      textTransform: 'uppercase',
    },
    titre: {
      color: theme.colors.text,
      fontSize: theme.typography.pageTitle,
      fontWeight: '700',
    },
  });
