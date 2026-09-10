import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ouvrage } from '@/domain/ouvrage';
import type { CorrectionOuvrage } from '@/domain/saisie-ouvrage';
import { patchBook } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { clesOuvrages } from './cles-ouvrages';

type DemandeCorrection = {
  id: string;
  correction: CorrectionOuvrage;
};

export const useModifierOuvrage = () => {
  const client = useQueryClient();

  return useMutation<Ouvrage, ErreurApplication, DemandeCorrection>({
    mutationFn: ({ id, correction }) => patchBook(id, correction),
    retry: false,
    onSuccess: async (ouvrage) => {
      client.setQueryData(clesOuvrages.fiche(ouvrage.id), ouvrage);
      await client.invalidateQueries({ queryKey: clesOuvrages.listes() });
    },
  });
};
