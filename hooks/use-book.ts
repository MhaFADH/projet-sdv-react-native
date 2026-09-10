import { useQuery } from '@tanstack/react-query';
import { identifiantUtilisable, type Ouvrage } from '@/domain/ouvrage';
import { fetchBook } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesOuvrages } from './cles-ouvrages';

export const useBook = (id: string) =>
  useQuery<Ouvrage, ErreurApplication>({
    queryKey: clesOuvrages.fiche(id),
    queryFn: ({ signal }) => fetchBook(id, signal),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
    enabled: identifiantUtilisable(id),
  });
