import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
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
      ouvrirOuvrage: (id: string) => void;
    };

type FondsViewProps = {
  etat: EtatFonds;
};

const NOMBRE_LIGNES_SQUELETTE = 5;

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
    <SqueletteDonnees libelle="Chargement des ouvrages" nombreLignes={NOMBRE_LIGNES_SQUELETTE} />
  </CadreFonds>
);

const ErreurFonds = ({ message, reessayer }: Extract<EtatFonds, { type: 'erreur' }>) => (
  <CadreFonds>
    <EtatErreur message={message} reessayer={reessayer} titre="Impossible de charger le fonds" />
  </CadreFonds>
);

const FondsVide = () => (
  <CadreFonds>
    <EtatAbsence message="Aucun ouvrage n'est encore recensé." titre="Le fonds est vide" />
  </CadreFonds>
);

const PageIndisponible = ({
  page,
  pagePrecedente,
  pageSuivante,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <CadreFonds>
    <EtatAbsence
      message="Retour à la dernière page disponible…"
      titre="Cette page n'est plus disponible"
    />
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
  ouvrirOuvrage,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <CadreFonds>
    <OuvragesList ouvrages={page.items} ouvrirOuvrage={ouvrirOuvrage} />
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
});
