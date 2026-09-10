import { useEffect } from 'react';
import { FondsView } from '@/components/books/fonds-view';
import { PAS_DE_PAGE, PREMIERE_PAGE } from '@/domain/ouvrage';
import { useBooksPage } from '@/hooks/use-books-page';
import { useSuppressions } from '@/hooks/use-suppressions';

type FondsScreenProps = {
  pageDemandee: number;
  changerPage: (page: number) => void;
  ouvrirOuvrage: (id: string) => void;
  ajouterOuvrage: () => void;
};

export const FondsScreen = ({
  pageDemandee,
  changerPage,
  ouvrirOuvrage,
  ajouterOuvrage,
}: FondsScreenProps) => {
  const requete = useBooksPage(pageDemandee);
  const { estMasque } = useSuppressions();
  const dernierePageDisponible = requete.data?.totalPages;

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

  return (
    <FondsView
      ajouterOuvrage={ajouterOuvrage}
      etat={{
        type: 'succes',
        page: pageVisible,
        pagePrecedente,
        pageSuivante,
        ouvrirOuvrage,
        masquageTemporaire: pageVisible.items.length < requete.data.items.length,
      }}
    />
  );
};
