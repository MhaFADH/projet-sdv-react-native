import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarreSelectionSuppression } from '@/components/books/barre-selection-suppression';
import { Bouton } from '@/components/bouton';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import type { PageOuvrages } from '@/domain/ouvrage';
import { theme } from '@/theme/tokens';
import { OuvragesList } from './ouvrages-list';
import { Pagination } from './pagination';
import { RechercheFonds } from './recherche-fonds';

type SelectionFonds = {
  identifiants: ReadonlySet<string>;
  basculer: (id: string) => void;
  demanderSuppression: () => void;
  suppressionDesactivee: boolean;
};

type EtatFonds =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | {
      type: 'succes';
      page: PageOuvrages;
      pagePrecedente: () => void;
      pageSuivante: () => void;
      ouvrirOuvrage: (id: string) => void;
      selection: SelectionFonds;
      masquageTemporaire?: boolean;
      pageEnChargement?: number;
    };

type FondsViewProps = {
  etat: EtatFonds;
  ajouterOuvrage: () => void;
  recherche?: {
    valeurAppliquee: string;
    appliquer: (recherche: string) => void;
  };
};

const NOMBRE_LIGNES_SQUELETTE = 5;

const EnteteFonds = ({ ajouterOuvrage }: Pick<FondsViewProps, 'ajouterOuvrage'>) => (
  <View style={styles.entete}>
    <Text style={styles.surtitre}>Comptoirs du Livre</Text>
    <Text accessibilityRole="header" style={styles.titre}>
      Fonds des ouvrages
    </Text>
    <View style={styles.actions}>
      <Bouton action={ajouterOuvrage} libelle="Ajouter un ouvrage" />
    </View>
  </View>
);

type CadreFondsProps = PropsWithChildren<Pick<FondsViewProps, 'ajouterOuvrage' | 'recherche'>>;

const CadreFonds = ({ ajouterOuvrage, recherche, children }: CadreFondsProps) => (
  <ScrollView contentContainerStyle={styles.conteneur} keyboardShouldPersistTaps="handled">
    <EnteteFonds ajouterOuvrage={ajouterOuvrage} />
    {recherche ? <RechercheFonds {...recherche} /> : null}
    {children}
  </ScrollView>
);

const ChargementFonds = () => (
  <SqueletteDonnees libelle="Chargement des ouvrages" nombreLignes={NOMBRE_LIGNES_SQUELETTE} />
);

const ErreurFonds = ({ message, reessayer }: Extract<EtatFonds, { type: 'erreur' }>) => (
  <EtatErreur message={message} reessayer={reessayer} titre="Impossible de charger le fonds" />
);

const FondsVide = ({ rechercheActive }: { rechercheActive: boolean }) =>
  rechercheActive ? (
    <EtatAbsence message="Aucun ouvrage ne correspond à cette recherche." titre="Aucun résultat" />
  ) : (
    <EtatAbsence message="Aucun ouvrage n'est encore recensé." titre="Le fonds est vide" />
  );

const FondsMasqueTemporairement = ({
  page,
  pagePrecedente,
  pageSuivante,
  selection,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <>
    <BarreSelectionSuppression
      demanderSuppression={selection.demanderSuppression}
      nombreSelectionnes={0}
      suppressionDesactivee={selection.suppressionDesactivee}
    />
    <EtatAbsence
      message="Les ouvrages de cette page restent récupérables avec « Annuler tout » avant l’envoi."
      titre="Ouvrages masqués temporairement"
    />
    <Pagination
      page={page.page}
      pagePrecedente={pagePrecedente}
      pageSuivante={pageSuivante}
      total={page.total}
      totalPages={page.totalPages}
    />
  </>
);

const PageIndisponible = ({
  page,
  pagePrecedente,
  pageSuivante,
}: Extract<EtatFonds, { type: 'succes' }>) => (
  <>
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
  </>
);

const FondsRempli = ({
  page,
  pagePrecedente,
  pageSuivante,
  ouvrirOuvrage,
  selection,
  pageEnChargement,
}: Extract<EtatFonds, { type: 'succes' }>) => {
  const interactionsDesactivees = pageEnChargement !== undefined;
  const nombreSelectionnes = page.items.filter(({ id }) => selection.identifiants.has(id)).length;

  return (
    <>
      {pageEnChargement ? (
        <View
          accessibilityLabel={`Chargement de la page ${pageEnChargement}`}
          accessibilityRole="progressbar"
        >
          <Text style={styles.chargementPage}>Chargement de la page {pageEnChargement}…</Text>
        </View>
      ) : null}
      <BarreSelectionSuppression
        demanderSuppression={selection.demanderSuppression}
        nombreSelectionnes={nombreSelectionnes}
        suppressionDesactivee={selection.suppressionDesactivee || interactionsDesactivees}
      />
      <OuvragesList
        basculerSelection={selection.basculer}
        identifiantsSelectionnes={selection.identifiants}
        ouvrages={page.items}
        ouvertureDesactivee={interactionsDesactivees}
        ouvrirOuvrage={ouvrirOuvrage}
        selectionDesactivee={interactionsDesactivees}
      />
      <Pagination
        navigationDesactivee={interactionsDesactivees}
        page={page.page}
        pagePrecedente={pagePrecedente}
        pageSuivante={pageSuivante}
        total={page.total}
        totalPages={page.totalPages}
      />
    </>
  );
};

const ContenuFonds = ({ etat, recherche }: Pick<FondsViewProps, 'etat' | 'recherche'>) => {
  if (etat.type === 'chargement') return <ChargementFonds />;
  if (etat.type === 'erreur') return <ErreurFonds {...etat} />;
  if (etat.page.total === 0)
    return <FondsVide rechercheActive={(recherche?.valeurAppliquee ?? '') !== ''} />;
  if (etat.page.items.length === 0 && etat.masquageTemporaire)
    return <FondsMasqueTemporairement {...etat} />;
  if (etat.page.items.length === 0) return <PageIndisponible {...etat} />;
  return <FondsRempli {...etat} />;
};

export const FondsView = ({ etat, ajouterOuvrage, recherche }: FondsViewProps) => (
  <CadreFonds ajouterOuvrage={ajouterOuvrage} recherche={recherche}>
    <ContenuFonds etat={etat} recherche={recherche} />
  </CadreFonds>
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
    gap: theme.spacing.xs,
  },
  actions: {
    alignItems: 'flex-start',
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
  chargementPage: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
});
