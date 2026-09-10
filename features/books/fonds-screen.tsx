import { useEffect, useState } from 'react';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import { FondsView } from '@/components/books/fonds-view';
import { OUVRAGES_PAR_PAGE, PAS_DE_PAGE, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useBooksPage } from '@/hooks/use-books-page';
import { useSuppressions } from '@/hooks/use-suppressions';

type FondsScreenProps = {
  pageDemandee: number;
  changerPage: (page: number) => void;
  ouvrirOuvrage: (id: string) => void;
  ajouterOuvrage: () => void;
};

type EtatSelection = {
  page: number;
  identifiants: Set<string>;
};

const AUCUN_IDENTIFIANT = new Set<string>();

export const FondsScreen = ({
  pageDemandee,
  changerPage,
  ouvrirOuvrage,
  ajouterOuvrage,
}: FondsScreenProps) => {
  const requete = useBooksPage(pageDemandee);
  const { confirmerSuppressions, estMasque, suppressionDesactivee } = useSuppressions();
  const [selection, setSelection] = useState<EtatSelection>(() => ({
    page: pageDemandee,
    identifiants: new Set(),
  }));
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const dernierePageDisponible = requete.data?.totalPages;
  const identifiantsSelectionnes =
    selection.page === pageDemandee ? selection.identifiants : AUCUN_IDENTIFIANT;

  useEffect(() => {
    setSelection({ page: pageDemandee, identifiants: new Set() });
    setConfirmationVisible(false);
  }, [pageDemandee]);

  useEffect(() => {
    if (dernierePageDisponible === undefined || pageDemandee <= dernierePageDisponible) return;
    changerPage(dernierePageDisponible);
  }, [changerPage, dernierePageDisponible, pageDemandee]);

  if (requete.isPending || pageDemandee > (dernierePageDisponible ?? pageDemandee))
    return <FondsView ajouterOuvrage={ajouterOuvrage} etat={{ type: 'chargement' }} />;

  if (requete.isError) {
    return (
      <FondsView
        ajouterOuvrage={ajouterOuvrage}
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
      />
    );
  }

  const pagePrecedente = () => changerPage(Math.max(PREMIERE_PAGE, pageDemandee - PAS_DE_PAGE));
  const pageSuivante = () =>
    changerPage(Math.min(requete.data.totalPages, pageDemandee + PAS_DE_PAGE));
  const pageVisible = {
    ...requete.data,
    items: requete.data.items.filter(({ id }) => !estMasque(id)),
  };
  const ouvragesSelectionnes = pageVisible.items
    .filter(({ id }) => identifiantsSelectionnes.has(id))
    .map(({ id, titre }) => ({ id, titre }));

  const basculerSelection = (id: string) => {
    setSelection((courante) => {
      const identifiants =
        courante.page === pageDemandee ? new Set(courante.identifiants) : new Set<string>();
      if (identifiants.delete(id)) return { page: pageDemandee, identifiants };
      if (identifiants.size >= OUVRAGES_PAR_PAGE) return courante;
      identifiants.add(id);
      return { page: pageDemandee, identifiants };
    });
  };
  const demanderSuppression = () => {
    if (ouvragesSelectionnes.length === 0 || suppressionDesactivee) return;
    setConfirmationVisible(true);
  };
  const confirmerSelection = () => {
    if (ouvragesSelectionnes.length === 0 || suppressionDesactivee) return;
    confirmerSuppressions(ouvragesSelectionnes);
    setSelection({ page: pageDemandee, identifiants: new Set() });
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
          ouvrirOuvrage,
          selection: {
            identifiants: identifiantsSelectionnes,
            basculer: basculerSelection,
            demanderSuppression,
            suppressionDesactivee,
          },
          masquageTemporaire: pageVisible.items.length < requete.data.items.length,
        }}
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
