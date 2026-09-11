import type { UseQueryResult } from '@tanstack/react-query';
import type { EtatNotes } from '@/components/notes/vue-liste-notes';
import type { NoteLecture } from '@/domain/note-lecture';
import type { Traduire } from '@/hooks/use-traduction';
import type { ErreurApplication } from '@/services/api/erreurs';
import { messageErreurApplication } from './message-erreur-application';

export const construireEtatNotes = (
  requete: UseQueryResult<NoteLecture[], ErreurApplication>,
  t: Traduire,
): EtatNotes => {
  if (requete.isPending) return { type: 'chargement' };
  if (requete.isError) {
    return {
      type: 'erreur',
      message: messageErreurApplication(requete.error, t, t('erreursHttp.reponseNotes')),
      reessayer: () => void requete.refetch(),
      reessaiEnCours: requete.isFetching,
    };
  }
  return requete.data.length === 0 ? { type: 'vide' } : { type: 'succes', notes: requete.data };
};
