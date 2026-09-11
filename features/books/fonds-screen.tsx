import { useEffect, useState } from 'react';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import { FondsView } from '@/components/books/fonds-view';
import { type ConsultationFonds, consultationsEgales } from '@/domain/criteres-ouvrages';
import { OUVRAGES_PAR_PAGE, type Ouvrage, PAS_DE_PAGE, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useBascules } from '@/hooks/use-bascules';
import { useBooksPage } from '@/hooks/use-books-page';
import { useSuppressions } from '@/hooks/use-suppressions';

type FondsScreenProps = {
  pageDemandee: number;
  consultationDemandee: ConsultationFonds;
  changerPage: (page: number) => void;
  changerConsultation: (consultation: ConsultationFonds) => void;
  ouvrirOuvrage: (id: string) => void;
  ajouterOuvrage: () => void;
  ouvrirPreferences: () => void;
};

type EtatSelection = {
  page: number;
  consultation: ConsultationFonds;
  identifiants: Set<string>;
};

const AUCUN_IDENTIFIANT = new Set<string>();

export const FondsScreen = ({
  pageDemandee,
  consultationDemandee,
  changerPage,
  changerConsultation,
  ouvrirOuvrage,
  ajouterOuvrage,
  ouvrirPreferences,
}: FondsScreenProps) => {
  const requete = useBooksPage(pageDemandee, consultationDemandee);
  const { confirmerSuppressions, estMasque, suppressionDesactivee } = useSuppressions();
  const bascules = useBascules();
  const [selection, setSelection] = useState<EtatSelection>(() => ({
    page: pageDemandee,
    consultation: consultationDemandee,
    identifiants: new Set(),
  }));
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const dernierePageDisponible = requete.data?.totalPages;
  const memesCriteres =
    selection.page === pageDemandee &&
    consultationsEgales(selection.consultation, consultationDemandee);
  const identifiantsSelectionnes = memesCriteres ? selection.identifiants : AUCUN_IDENTIFIANT;

  useEffect(() => {
    setSelection({
      page: pageDemandee,
      consultation: consultationDemandee,
      identifiants: new Set(),
    });
    setConfirmationVisible(false);
  }, [pageDemandee, consultationDemandee]);

  useEffect(() => {
    if (dernierePageDisponible === undefined || pageDemandee <= dernierePageDisponible) return;
    changerPage(dernierePageDisponible);
  }, [changerPage, dernierePageDisponible, pageDemandee]);

  const recherche = {
    valeurAppliquee: consultationDemandee.recherche,
    appliquer: (recherche: string) => changerConsultation({ ...consultationDemandee, recherche }),
  };
  const criteres = { consultation: consultationDemandee, appliquer: changerConsultation };

  if (requete.isPending || pageDemandee > (dernierePageDisponible ?? pageDemandee)) {
    return (
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        criteres={criteres}
        etat={{ type: 'chargement' }}
        ouvrirPreferences={ouvrirPreferences}
        recherche={recherche}
      />
    );
  }

  if (requete.isError && !requete.data) {
    return (
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        criteres={criteres}
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
        ouvrirPreferences={ouvrirPreferences}
        recherche={recherche}
      />
    );
  }

  const pagePrecedente = () => {
    if (!requete.isPlaceholderData)
      changerPage(Math.max(PREMIERE_PAGE, pageDemandee - PAS_DE_PAGE));
  };
  const pageSuivante = () => {
    if (!requete.isPlaceholderData)
      changerPage(Math.min(requete.data.totalPages, pageDemandee + PAS_DE_PAGE));
  };
  const ouvrirFiche = (id: string) => {
    if (!requete.isPlaceholderData) ouvrirOuvrage(id);
  };
  const pageVisible = {
    ...requete.data,
    items: requete.data.items
      .filter(({ id }) => !estMasque(id))
      .map(bascules.appliquerBasculeEnCours),
  };
  const coupsDeCoeur = {
    basculer: (ouvrage: Ouvrage) =>
      bascules.basculer({ id: ouvrage.id, champ: 'favori', valeur: !ouvrage.favori }),
    enCours: bascules.basculeEnCours,
    erreur: bascules.erreurBascule,
  };
  const ouvragesSelectionnes = pageVisible.items
    .filter(({ id }) => identifiantsSelectionnes.has(id))
    .map(({ id, titre }) => ({ id, titre }));

  const basculerSelection = (id: string) => {
    if (requete.isPlaceholderData) return;
    setSelection((courante) => {
      const memesCriteresCourants =
        courante.page === pageDemandee &&
        consultationsEgales(courante.consultation, consultationDemandee);
      const identifiants = memesCriteresCourants
        ? new Set(courante.identifiants)
        : new Set<string>();
      const nouvelEtat = { page: pageDemandee, consultation: consultationDemandee, identifiants };
      if (identifiants.delete(id)) return nouvelEtat;
      if (identifiants.size >= OUVRAGES_PAR_PAGE) return courante;
      identifiants.add(id);
      return nouvelEtat;
    });
  };
  const demanderSuppression = () => {
    if (requete.isPlaceholderData || ouvragesSelectionnes.length === 0 || suppressionDesactivee)
      return;
    setConfirmationVisible(true);
  };
  const confirmerSelection = () => {
    if (requete.isPlaceholderData || ouvragesSelectionnes.length === 0 || suppressionDesactivee)
      return;
    confirmerSuppressions(ouvragesSelectionnes);
    setSelection({
      page: pageDemandee,
      consultation: consultationDemandee,
      identifiants: new Set(),
    });
    setConfirmationVisible(false);
  };

  return (
    <>
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        criteres={criteres}
        etat={{
          type: 'succes',
          page: pageVisible,
          pagePrecedente,
          pageSuivante,
          ouvrirOuvrage: ouvrirFiche,
          coupsDeCoeur,
          selection: {
            identifiants: identifiantsSelectionnes,
            basculer: basculerSelection,
            demanderSuppression,
            suppressionDesactivee,
          },
          masquageTemporaire: pageVisible.items.length < requete.data.items.length,
          pageEnChargement: requete.isPlaceholderData ? pageDemandee : undefined,
          erreurActualisation: requete.isError
            ? { message: requete.error.message, reessayer: () => void requete.refetch() }
            : undefined,
        }}
        ouvrirPreferences={ouvrirPreferences}
        recherche={recherche}
      />
      {confirmationVisible && ouvragesSelectionnes.length > 0 ? (
        <ConfirmationSuppression
          annuler={() => setConfirmationVisible(false)}
          confirmer={confirmerSelection}
          desactivee={suppressionDesactivee}
          ouvrages={ouvragesSelectionnes}
          visible
        />
      ) : null}
    </>
  );
};
