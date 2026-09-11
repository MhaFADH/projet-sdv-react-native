import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ouvrage } from '@/domain/ouvrage';
import type { CreationOuvrage } from '@/domain/saisie-ouvrage';
import { createBook } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { clesOuvrages } from './cles-ouvrages';

export const useCreerOuvrage = () => {
  const client = useQueryClient();

  return useMutation<Ouvrage, ErreurApplication, CreationOuvrage>({
    mutationFn: createBook,
    retry: false,
    onSuccess: async (ouvrage) => {
      client.setQueryData(clesOuvrages.fiche(ouvrage.id), ouvrage);
      await client.invalidateQueries({ queryKey: clesOuvrages.listes() });
    },
  });
};
