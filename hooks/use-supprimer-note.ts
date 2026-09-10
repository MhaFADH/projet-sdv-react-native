import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NoteLecture } from '@/domain/note-lecture';
import type { ErreurApplication } from '@/services/api/erreurs';
import { type IssueSuppressionNote, supprimerNote } from '@/services/api/notes-api';
import { clesNotes } from './cles-notes';

export const useSupprimerNote = (livreId: string) => {
  const client = useQueryClient();

  return useMutation<IssueSuppressionNote, ErreurApplication, string>({
    mutationFn: (noteId) => supprimerNote(livreId, noteId),
    retry: false,
    onSuccess: (issue, noteId) => {
      if (issue === 'supprimee') {
        client.setQueryData<NoteLecture[]>(clesNotes.ouvrage(livreId), (notes) =>
          notes?.filter(({ id }) => id !== noteId),
        );
        return;
      }
      void client.invalidateQueries({ queryKey: clesNotes.ouvrage(livreId) });
    },
  });
};
