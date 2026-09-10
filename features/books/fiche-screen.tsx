import { useState } from 'react';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import { type EtatFiche, FicheView } from '@/components/books/fiche-view';
import { VueSectionNotes } from '@/components/notes/vue-section-notes';
import { identifiantUtilisable } from '@/domain/ouvrage';
import { construireEtatNotes } from '@/features/notes/etat-notes';
import { type CauseBlocageNote, useSaisieNote } from '@/features/notes/use-saisie-note';
import { useSuppressionNote } from '@/features/notes/use-suppression-note';
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
  const identifiantValide = identifiantUtilisable(id);
  const ouvrageMasque = estMasque(id);
  const notesActives = requete.isSuccess && !ouvrageMasque;
  const requeteNotes = useNotes(id, notesActives);
  const causeBlocage: CauseBlocageNote | null = ouvrageMasque
    ? 'ouvrage-masque'
    : requete.error?.type === 'introuvable'
      ? 'ouvrage-introuvable'
      : null;
  const rafraichirNotes = () => void requeteNotes.refetch();
  const saisieNote = useSaisieNote({ livreId: id, causeBlocage, rafraichirNotes });
  const suppressionNote = useSuppressionNote({ livreId: id, rafraichirNotes });

  const quitter = () => saisieNote.partir(retour);
  const sectionNotes = (etat: EtatFiche) => {
    if (!identifiantValide || etat.type === 'chargement') return null;
    return (
      <VueSectionNotes
        formulaire={saisieNote.vue}
        liste={
          notesActives
            ? {
                etat: construireEtatNotes(requeteNotes),
                titreOuvrage: requete.data.titre,
                suppression: suppressionNote.suppression,
                messageListe: suppressionNote.messageListe,
                confirmation: suppressionNote.confirmation,
              }
            : null
        }
      />
    );
  };
  const rendre = (etat: EtatFiche) => (
    <FicheView etat={etat} retour={quitter} sectionNotes={sectionNotes(etat)} />
  );

  if (!identifiantValide) {
    return rendre({ type: 'introuvable', message: ABSENCE_PAR_DEFAUT });
  }

  if (ouvrageMasque) return rendre({ type: 'masquee' });

  if (requete.isPending) return rendre({ type: 'chargement' });

  if (requete.isError) {
    if (requete.error.type === 'introuvable') {
      return rendre({ type: 'introuvable', message: requete.error.message });
    }
    return rendre({
      type: 'erreur',
      message: requete.error.message,
      reessayer: () => void requete.refetch(),
    });
  }

  const ouvrageASupprimer = { id: requete.data.id, titre: requete.data.titre };
  const confirmer = () => {
    confirmerSuppressions([ouvrageASupprimer]);
    setConfirmationVisible(false);
  };

  return (
    <>
      {rendre({
        type: 'succes',
        ouvrage: requete.data,
        basculerStatut: () => basculeStatut.basculer(!requete.data.lu),
        statutEnCours: basculeStatut.enCours,
        erreurStatut: basculeStatut.erreur,
        demanderSuppression: () => setConfirmationVisible(true),
        suppressionDesactivee,
        corriger,
      })}
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
