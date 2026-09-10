import { useEffect, useState } from 'react';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import { FondsView } from '@/components/books/fonds-view';
import { OUVRAGES_PAR_PAGE, PAS_DE_PAGE, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useBooksPage } from '@/hooks/use-books-page';
import { useSuppressions } from '@/hooks/use-suppressions';

type FondsScreenProps = {
  pageDemandee: number;
  rechercheDemandee: string;
  changerPage: (page: number) => void;
  changerRecherche: (recherche: string) => void;
  ouvrirOuvrage: (id: string) => void;
  ajouterOuvrage: () => void;
};

type EtatSelection = {
  page: number;
  recherche: string;
  identifiants: Set<string>;
};

const AUCUN_IDENTIFIANT = new Set<string>();

export const FondsScreen = ({
  pageDemandee,
  rechercheDemandee,
  changerPage,
  changerRecherche,
  ouvrirOuvrage,
  ajouterOuvrage,
}: FondsScreenProps) => {
  const requete = useBooksPage(pageDemandee, rechercheDemandee);
  const { confirmerSuppressions, estMasque, suppressionDesactivee } = useSuppressions();
  const [selection, setSelection] = useState<EtatSelection>(() => ({
    page: pageDemandee,
    recherche: rechercheDemandee,
    identifiants: new Set(),
  }));
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const dernierePageDisponible = requete.data?.totalPages;
  const selectionDesCriteres =
    selection.page === pageDemandee && selection.recherche === rechercheDemandee;
  const identifiantsSelectionnes = selectionDesCriteres
    ? selection.identifiants
    : AUCUN_IDENTIFIANT;

  useEffect(() => {
    setSelection({ page: pageDemandee, recherche: rechercheDemandee, identifiants: new Set() });
    setConfirmationVisible(false);
  }, [pageDemandee, rechercheDemandee]);

  useEffect(() => {
    if (dernierePageDisponible === undefined || pageDemandee <= dernierePageDisponible) return;
    changerPage(dernierePageDisponible);
  }, [changerPage, dernierePageDisponible, pageDemandee]);

  const recherche = {
    valeurAppliquee: rechercheDemandee,
    appliquer: changerRecherche,
  };

  if (requete.isPending || pageDemandee > (dernierePageDisponible ?? pageDemandee))
    return (
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        etat={{ type: 'chargement' }}
        recherche={recherche}
      />
    );

  if (requete.isError) {
    return (
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
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
    items: requete.data.items.filter(({ id }) => !estMasque(id)),
  };
  const ouvragesSelectionnes = pageVisible.items
    .filter(({ id }) => identifiantsSelectionnes.has(id))
    .map(({ id, titre }) => ({ id, titre }));

  const basculerSelection = (id: string) => {
    if (requete.isPlaceholderData) return;
    setSelection((courante) => {
      const memesCriteres =
        courante.page === pageDemandee && courante.recherche === rechercheDemandee;
      const identifiants = memesCriteres ? new Set(courante.identifiants) : new Set<string>();
      if (identifiants.delete(id))
        return { page: pageDemandee, recherche: rechercheDemandee, identifiants };
      if (identifiants.size >= OUVRAGES_PAR_PAGE) return courante;
      identifiants.add(id);
      return { page: pageDemandee, recherche: rechercheDemandee, identifiants };
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
    setSelection({ page: pageDemandee, recherche: rechercheDemandee, identifiants: new Set() });
    setConfirmationVisible(false);
  };

  return (
    <>
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        etat={{
          type: 'succes',
          page: pageVisible,
          pagePrecedente,
          pageSuivante,
          ouvrirOuvrage: ouvrirFiche,
          selection: {
            identifiants: identifiantsSelectionnes,
            basculer: basculerSelection,
            demanderSuppression,
            suppressionDesactivee,
          },
          masquageTemporaire: pageVisible.items.length < requete.data.items.length,
          pageEnChargement: requete.isPlaceholderData ? pageDemandee : undefined,
        }}
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
