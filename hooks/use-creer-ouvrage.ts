import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ouvrage } from '@/domain/ouvrage';
import type { OuvrageSaisi } from '@/domain/saisie-ouvrage';
import { createBook } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { clesOuvrages } from './cles-ouvrages';

/**
 * Une création n'est jamais réessayée automatiquement : le POST n'est pas
 * idempotent et un second envoi produirait un second ouvrage.
 */
export const useCreerOuvrage = () => {
  const client = useQueryClient();

  return useMutation<Ouvrage, ErreurApplication, OuvrageSaisi>({
    mutationFn: (saisie) => createBook(saisie),
    retry: false,
    onSuccess: async (ouvrage) => {
      client.setQueryData(clesOuvrages.fiche(ouvrage.id), ouvrage);
      await client.invalidateQueries({ queryKey: clesOuvrages.listes() });
    },
  });
};
