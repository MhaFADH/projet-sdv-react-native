import { useQuery } from '@tanstack/react-query';
import type { PageOuvrages } from '@/domain/ouvrage';
import { fetchBooksPage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesOuvrages } from './cles-ouvrages';

export const useBooksPage = (page: number) =>
  useQuery<PageOuvrages, ErreurApplication>({
    queryKey: clesOuvrages.liste(page),
    queryFn: ({ signal }) => fetchBooksPage(page, signal),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });
