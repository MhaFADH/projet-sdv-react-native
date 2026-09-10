import { useEffect, useState } from 'react';
import { FondsView } from '@/components/books/fonds-view';
import { PAS_DE_PAGE, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useBooksPage } from '@/hooks/use-books-page';

export const FondsScreen = () => {
  const [pageDemandee, setPageDemandee] = useState(PREMIERE_PAGE);
  const requete = useBooksPage(pageDemandee);
  const dernierePageDisponible = requete.data?.totalPages;

  useEffect(() => {
    if (dernierePageDisponible === undefined || pageDemandee <= dernierePageDisponible) return;
    setPageDemandee(dernierePageDisponible);
  }, [dernierePageDisponible, pageDemandee]);

  if (requete.isPending || pageDemandee > (dernierePageDisponible ?? pageDemandee))
    return <FondsView etat={{ type: 'chargement' }} />;

  if (requete.isError) {
    return (
      <FondsView
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
      />
    );
  }

  const pagePrecedente = () =>
    setPageDemandee((page) => Math.max(PREMIERE_PAGE, page - PAS_DE_PAGE));
  const pageSuivante = () =>
    setPageDemandee((page) => Math.min(requete.data.totalPages, page + PAS_DE_PAGE));

  return (
    <FondsView
      etat={{
        type: 'succes',
        page: requete.data,
        pagePrecedente,
        pageSuivante,
      }}
    />
  );
};
