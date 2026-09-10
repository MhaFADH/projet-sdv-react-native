import { useQuery } from '@tanstack/react-query';
import { creerCriteresOuvrages } from '@/domain/criteres-ouvrages';
import type { PageOuvrages } from '@/domain/ouvrage';
import { fetchBooksPage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesOuvrages } from './cles-ouvrages';

const rechercheDansCle = (cle: readonly unknown[]): string | undefined => {
  const criteres = cle[2];
  if (typeof criteres !== 'object' || criteres === null || !('q' in criteres)) return undefined;
  return typeof criteres.q === 'string' ? criteres.q : undefined;
};

export const useBooksPage = (page: number, recherche = '') => {
  const criteres = creerCriteresOuvrages(page, recherche);
  return useQuery<PageOuvrages, ErreurApplication>({
    queryKey: clesOuvrages.liste(page, recherche),
    queryFn: ({ signal }) => fetchBooksPage(criteres, signal),
    placeholderData: (precedente, requetePrecedente) =>
      rechercheDansCle(requetePrecedente?.queryKey ?? []) === recherche ? precedente : undefined,
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });
};
