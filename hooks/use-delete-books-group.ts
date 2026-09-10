import { useMutation } from '@tanstack/react-query';
import type { OuvrageASupprimer } from '@/domain/groupe-suppressions';
import { deleteBook } from '@/services/api/books-api';

type ResultatSuppression = {
  id: string;
  succes: boolean;
};

const supprimerOuvrages = (ouvrages: OuvrageASupprimer[]): Promise<ResultatSuppression[]> =>
  Promise.all(
    ouvrages.map(async ({ id }) => {
      try {
        await deleteBook(id);
        return { id, succes: true };
      } catch {
        return { id, succes: false };
      }
    }),
  );

export const useDeleteBooksGroup = () =>
  useMutation<ResultatSuppression[], never, OuvrageASupprimer[]>({ mutationFn: supprimerOuvrages });
