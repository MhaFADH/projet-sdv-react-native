import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PageOuvrages } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';
import { OuvragesList } from './ouvrages-list';
import { Pagination } from './pagination';

type EtatFonds =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | {
      type: 'succes';
      page: PageOuvrages;
      pagePrecedente: () => void;
      pageSuivante: () => void;
    };

type FondsViewProps = {
  etat: EtatFonds;
};

const IDENTIFIANTS_SQUELETTE = [
  'squelette-1',
  'squelette-2',
  'squelette-3',
  'squelette-4',
  'squelette-5',
] as const;

const EnteteFonds = () => (
  <View style={styles.entete}>
    <Text style={styles.surtitre}>Comptoirs du Livre</Text>
    <Text accessibilityRole="header" style={styles.titre}>
      Fonds des ouvrages
    </Text>
  </View>
);

const CadreFonds = ({ children }: PropsWithChildren) => (
  <ScrollView contentContainerStyle={styles.conteneur}>
    <EnteteFonds />
    {children}
  </ScrollView>
);

const ChargementFonds = () => (
  <CadreFonds>
    <View
      accessibilityLabel="Chargement des ouvrages"
      accessibilityRole="progressbar"
      style={styles.liste}
    >
      {IDENTIFIANTS_SQUELETTE.map((identifiant) => (
        <View key={identifiant} testID="ligne-squelette" style={styles.squelette} />
      ))}
    </View>
  </CadreFonds>
);

const ErreurFonds = ({ message, reessayer }: Extract<EtatFonds, { type: 'erreur' }>) => (
  <CadreFonds>
    <View accessibilityRole="alert" style={styles.erreur}>
      <Text accessibilityRole="header" style={[styles.titreEtat, styles.titreErreur]}>
        Impossible de charger le fonds
      </Text>
      <Text style={styles.messageEtat}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={reessayer} style={styles.bouton}>
        <Text style={styles.texteBouton}>Réessayer</Text>
      </Pressable>
    </View>
  </CadreFonds>
);

const FondsVide = () => (
  <CadreFonds>
    <View style={styles.vide}>
      <Text accessibilityRole="header" style={styles.titreEtat}>
        Le fonds est vide
      </Text>
      <Text style={styles.messageEtat}>Aucun ouvrage n&apos;est encore recensé.</Text>
    </View>
  </CadreFonds>
);

const PageIndisponible = ({
  page,
  pagePrecedente,
  pageSuivante,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <CadreFonds>
    <View style={styles.vide}>
      <Text accessibilityRole="header" style={styles.titreEtat}>
        Cette page n&apos;est plus disponible
      </Text>
      <Text style={styles.messageEtat}>Retour à la dernière page disponible…</Text>
    </View>
    <Pagination
      page={page.page}
      pagePrecedente={pagePrecedente}
      pageSuivante={pageSuivante}
      total={page.total}
      totalPages={page.totalPages}
    />
  </CadreFonds>
);

const FondsRempli = ({
  page,
  pagePrecedente,
  pageSuivante,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <CadreFonds>
    <OuvragesList ouvrages={page.items} />
    <Pagination
      page={page.page}
      pagePrecedente={pagePrecedente}
      pageSuivante={pageSuivante}
      total={page.total}
      totalPages={page.totalPages}
    />
  </CadreFonds>
);

export const FondsView = ({ etat }: FondsViewProps) => {
  if (etat.type === 'chargement') return <ChargementFonds />;
  if (etat.type === 'erreur') return <ErreurFonds {...etat} />;
  if (etat.page.total === 0) return <FondsVide />;
  if (etat.page.items.length === 0) return <PageIndisponible {...etat} />;
  return <FondsRempli {...etat} />;
};

const styles = StyleSheet.create({
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
  liste: {
    gap: theme.spacing.md,
  },
  erreur: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dangerBackground,
  },
  vide: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutralBackground,
  },
  titreEtat: {
    color: theme.colors.text,
    fontSize: theme.typography.itemTitle,
    fontWeight: '700',
  },
  titreErreur: {
    color: theme.colors.dangerText,
  },
  messageEtat: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: theme.typography.bodyLineHeight,
  },
  bouton: {
    minHeight: theme.minTargetSize,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  texteBouton: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  squelette: {
    minHeight: theme.layout.cardMinHeight,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
});
