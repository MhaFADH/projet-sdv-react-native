import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NoteLecture } from '@/domain/note-lecture';
import type { NoteSaisie } from '@/domain/saisie-note';
import type { ErreurApplication } from '@/services/api/erreurs';
import { ajouterNote } from '@/services/api/notes-api';
import { clesNotes } from './cles-notes';

/**
 * `POST /books/:id/notes` n'est pas idempotent : aucun réessai automatique,
 * et seules les notes de l'ouvrage concerné sont mises à jour dans le cache.
 */
export const useAjouterNote = (livreId: string) => {
  const client = useQueryClient();

  return useMutation<NoteLecture, ErreurApplication, NoteSaisie>({
    mutationFn: (saisie) => ajouterNote(livreId, saisie),
    retry: false,
    onSuccess: (note) => {
      client.setQueryData<NoteLecture[]>(clesNotes.ouvrage(livreId), (notes) =>
        notes === undefined ? [note] : [note, ...notes.filter(({ id }) => id !== note.id)],
      );
    },
  });
};
