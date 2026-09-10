import { useQuery } from '@tanstack/react-query';
import { OUVRAGES_PAR_PAGE, type PageOuvrages, TRI_FONDS } from '@/domain/ouvrage';
import { fetchBooksPage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';

const DELAI_REESSAI_MS = 1_000;

const clesOuvrages = {
  liste: (page: number) =>
    [
      'ouvrages',
      'liste',
      { page, limit: OUVRAGES_PAR_PAGE, sort: TRI_FONDS.champ, order: TRI_FONDS.ordre },
    ] as const,
};

const autoriserReessai = (nombreEchecs: number, erreur: ErreurApplication): boolean =>
  nombreEchecs < 1 && erreur.type === 'reseau' && erreur.reessayable;

export const useBooksPage = (page: number) =>
  useQuery<PageOuvrages, ErreurApplication>({
    queryKey: clesOuvrages.liste(page),
    queryFn: ({ signal }) => fetchBooksPage(page, signal),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });
