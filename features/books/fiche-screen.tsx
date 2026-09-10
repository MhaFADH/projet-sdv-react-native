import { useState } from 'react';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import { FicheView } from '@/components/books/fiche-view';
import type { EtatNotes } from '@/components/notes/vue-liste-notes';
import { identifiantUtilisable } from '@/domain/ouvrage';
import { useBook } from '@/hooks/use-book';
import { useNotes } from '@/hooks/use-notes';
import { useSuppressions } from '@/hooks/use-suppressions';
import { useToggleBookReadStatus } from '@/hooks/use-toggle-book-read-status';

const ABSENCE_PAR_DEFAUT = "Cet ouvrage n'existe pas ou plus.";

type FicheScreenProps = {
  id: string;
  retour: () => void;
  corriger: () => void;
};

export const FicheScreen = ({ id, retour, corriger }: FicheScreenProps) => {
  const requete = useBook(id);
  const basculeStatut = useToggleBookReadStatus(id);
  const { confirmerSuppressions, estMasque, suppressionDesactivee } = useSuppressions();
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const ouvrageMasque = estMasque(id);
  const requeteNotes = useNotes(id, requete.isSuccess && !ouvrageMasque);

  if (!identifiantUtilisable(id)) {
    return (
      <FicheView etat={{ type: 'introuvable', message: ABSENCE_PAR_DEFAUT }} retour={retour} />
    );
  }

  if (ouvrageMasque) return <FicheView etat={{ type: 'masquee' }} retour={retour} />;

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

  let etatNotes: EtatNotes;
  if (requeteNotes.isPending) {
    etatNotes = { type: 'chargement' };
  } else if (requeteNotes.isError) {
    etatNotes = {
      type: 'erreur',
      message: requeteNotes.error.message,
      reessayer: () => void requeteNotes.refetch(),
      reessaiEnCours: requeteNotes.isFetching,
    };
  } else if (requeteNotes.data.length === 0) {
    etatNotes = { type: 'vide' };
  } else {
    etatNotes = { type: 'succes', notes: requeteNotes.data };
  }

  const ouvrageASupprimer = { id: requete.data.id, titre: requete.data.titre };
  const confirmer = () => {
    confirmerSuppressions([ouvrageASupprimer]);
    setConfirmationVisible(false);
  };

  return (
    <>
      <FicheView
        etat={{
          type: 'succes',
          ouvrage: requete.data,
          basculerStatut: () => basculeStatut.basculer(!requete.data.lu),
          statutEnCours: basculeStatut.enCours,
          erreurStatut: basculeStatut.erreur,
          demanderSuppression: () => setConfirmationVisible(true),
          suppressionDesactivee,
          corriger,
          etatNotes,
        }}
        retour={retour}
      />
      <ConfirmationSuppression
        annuler={() => setConfirmationVisible(false)}
        confirmer={confirmer}
        desactivee={suppressionDesactivee}
        ouvrages={[ouvrageASupprimer]}
        visible={confirmationVisible}
      />
    </>
  );
};
