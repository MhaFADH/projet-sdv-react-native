import type { UseQueryResult } from '@tanstack/react-query';
import type { EtatNotes } from '@/components/notes/vue-liste-notes';
import type { NoteLecture } from '@/domain/note-lecture';
import type { ErreurApplication } from '@/services/api/erreurs';

export const construireEtatNotes = (
  requete: UseQueryResult<NoteLecture[], ErreurApplication>,
): EtatNotes => {
  if (requete.isPending) return { type: 'chargement' };
  if (requete.isError) {
    return {
      type: 'erreur',
      message: requete.error.message,
      reessayer: () => void requete.refetch(),
      reessaiEnCours: requete.isFetching,
    };
  }
  return requete.data.length === 0 ? { type: 'vide' } : { type: 'succes', notes: requete.data };
};
