import { FicheView } from '@/components/books/fiche-view';
import { identifiantUtilisable } from '@/domain/ouvrage';
import { useBook } from '@/hooks/use-book';

const ABSENCE_PAR_DEFAUT = "Cet ouvrage n'existe pas ou plus.";

type FicheScreenProps = {
  id: string;
  retour: () => void;
};

export const FicheScreen = ({ id, retour }: FicheScreenProps) => {
  const requete = useBook(id);

  if (!identifiantUtilisable(id)) {
    return (
      <FicheView etat={{ type: 'introuvable', message: ABSENCE_PAR_DEFAUT }} retour={retour} />
    );
  }

  if (requete.isPending) return <FicheView etat={{ type: 'chargement' }} retour={retour} />;

  if (requete.isError) {
    if (requete.error.type === 'introuvable') {
      return (
        <FicheView etat={{ type: 'introuvable', message: requete.error.message }} retour={retour} />
      );
    }
    return (
      <FicheView
        etat={{
          type: 'erreur',
          message: requete.error.message,
          reessayer: () => void requete.refetch(),
        }}
        retour={retour}
      />
    );
  }

  return <FicheView etat={{ type: 'succes', ouvrage: requete.data }} retour={retour} />;
};
