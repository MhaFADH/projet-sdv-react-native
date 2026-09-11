import { StyleSheet, Text, View } from 'react-native';
import { BarreSelectionSuppression } from '@/components/books/barre-selection-suppression';
import { EtatAbsence, EtatErreur, SqueletteDonnees } from '@/components/etats-donnees';
import type { ConsultationFonds } from '@/domain/criteres-ouvrages';
import { useStylesTheme } from '@/hooks/use-theme';
import { useTraduction } from '@/hooks/use-traduction';
import type { Theme } from '@/theme/tokens';
import type { EtatFonds } from './etat-fonds';
import { OuvragesList } from './ouvrages-list';
import { Pagination } from './pagination';

export type ContenuFondsProps = {
  etat: EtatFonds;
  recherche?: { valeurAppliquee: string };
  criteres?: { consultation: ConsultationFonds };
};

const NOMBRE_LIGNES_SQUELETTE = 5;

const ChargementFonds = () => {
  const t = useTraduction();
  return (
    <SqueletteDonnees libelle={t('fonds.chargement')} nombreLignes={NOMBRE_LIGNES_SQUELETTE} />
  );
};

const ErreurFonds = ({ message, reessayer }: Extract<EtatFonds, { type: 'erreur' }>) => {
  const t = useTraduction();
  return <EtatErreur message={message} reessayer={reessayer} titre={t('fonds.erreurTitre')} />;
};

const FondsVide = ({ criteresActifs }: { criteresActifs: boolean }) => {
  const t = useTraduction();
  return criteresActifs ? (
    <EtatAbsence message={t('fonds.aucunResultatMessage')} titre={t('fonds.aucunResultatTitre')} />
  ) : (
    <EtatAbsence message={t('fonds.videMessage')} titre={t('fonds.videTitre')} />
  );
};

const FondsMasqueTemporairement = ({
  page,
  pagePrecedente,
  pageSuivante,
  selection,
}: Extract<EtatFonds, { type: 'succes' }>) => {
  const t = useTraduction();

  return (
    <>
      <BarreSelectionSuppression
        demanderSuppression={selection.demanderSuppression}
        nombreSelectionnes={0}
        suppressionDesactivee={selection.suppressionDesactivee}
      />
      <EtatAbsence message={t('fonds.masqueMessage')} titre={t('fonds.masqueTitre')} />
      <Pagination
        page={page.page}
        pagePrecedente={pagePrecedente}
        pageSuivante={pageSuivante}
        total={page.total}
        totalPages={page.totalPages}
      />
    </>
  );
};

const PageIndisponible = ({
  page,
  pagePrecedente,
  pageSuivante,
}: Extract<EtatFonds, { type: 'succes' }>) => {
  const t = useTraduction();

  return (
    <>
      <EtatAbsence
        message={t('fonds.pageIndisponibleMessage')}
        titre={t('fonds.pageIndisponibleTitre')}
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
};

const FondsRempli = ({
  page,
  pagePrecedente,
  pageSuivante,
  ouvrirOuvrage,
  selection,
  coupsDeCoeur,
  pageEnChargement,
  erreurActualisation,
}: Extract<EtatFonds, { type: 'succes' }>) => {
  const t = useTraduction();
  const styles = useStylesTheme(creerStyles);
  const interactionsDesactivees = pageEnChargement !== undefined;
  const nombreSelectionnes = page.items.filter(({ ouvrage }) =>
    selection.identifiants.has(ouvrage.id),
  ).length;

  return (
    <>
      {pageEnChargement ? (
        <View
          accessibilityLabel={t('fonds.chargementPage', { page: pageEnChargement })}
          accessibilityRole="progressbar"
        >
          <Text style={styles.chargementPage}>
            {t('fonds.chargementPageEnCours', { page: pageEnChargement })}
          </Text>
        </View>
      ) : null}
      {erreurActualisation ? (
        <EtatErreur
          message={erreurActualisation.message}
          reessayer={erreurActualisation.reessayer}
          titre={t('fonds.erreurActualisation')}
        />
      ) : null}
      <BarreSelectionSuppression
        demanderSuppression={selection.demanderSuppression}
        nombreSelectionnes={nombreSelectionnes}
        suppressionDesactivee={selection.suppressionDesactivee || interactionsDesactivees}
      />
      <OuvragesList
        basculerSelection={selection.basculer}
        coupsDeCoeur={coupsDeCoeur}
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

export const ContenuFonds = ({ etat, recherche, criteres }: ContenuFondsProps) => {
  if (etat.type === 'chargement') return <ChargementFonds />;
  if (etat.type === 'erreur') return <ErreurFonds {...etat} />;
  if (etat.page.total === 0) {
    const consultation = criteres?.consultation;
    const criteresActifs =
      (recherche?.valeurAppliquee ?? '') !== '' ||
      (consultation !== undefined &&
        (consultation.lecture !== 'tous' || consultation.recommandation !== 'toutes'));
    return <FondsVide criteresActifs={criteresActifs} />;
  }
  if (etat.page.items.length === 0 && etat.masquageTemporaire)
    return <FondsMasqueTemporairement {...etat} />;
  if (etat.page.items.length === 0) return <PageIndisponible {...etat} />;
  return <FondsRempli {...etat} />;
};

const creerStyles = (theme: Theme) =>
  StyleSheet.create({
    chargementPage: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
    },
  });
