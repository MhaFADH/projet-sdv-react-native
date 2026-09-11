import { useQuery } from '@tanstack/react-query';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  type ConsultationFonds,
  creerCriteresOuvrages,
} from '@/domain/criteres-ouvrages';
import { conserverVersionsPage, type PageOuvrages } from '@/domain/ouvrage';
import { fetchBooksPage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesOuvrages } from './cles-ouvrages';

const memesCriteresHorsPage = (
  clePrecedente: readonly unknown[],
  cleCourante: readonly unknown[],
): boolean => {
  const criteresPrecedents = clePrecedente[2];
  const criteresCourants = cleCourante[2];
  if (
    typeof criteresPrecedents !== 'object' ||
    criteresPrecedents === null ||
    typeof criteresCourants !== 'object' ||
    criteresCourants === null
  )
    return false;
  const precedents = Object.entries(criteresPrecedents).filter(([nom]) => nom !== 'page');
  const courants = Object.entries(criteresCourants).filter(([nom]) => nom !== 'page');
  return (
    precedents.length === courants.length &&
    precedents.every(
      ([nom, valeur], index) => courants[index]?.[0] === nom && courants[index]?.[1] === valeur,
    )
  );
};

export const useBooksPage = (
  page: number,
  consultation: ConsultationFonds = CONSULTATION_FONDS_PAR_DEFAUT,
) => {
  const criteres = creerCriteresOuvrages(page, consultation);
  const cle = clesOuvrages.liste(page, consultation);
  return useQuery<PageOuvrages, ErreurApplication>({
    queryKey: cle,
    queryFn: ({ signal }) => fetchBooksPage(criteres, signal),
    placeholderData: (precedente, requetePrecedente) =>
      memesCriteresHorsPage(requetePrecedente?.queryKey ?? [], cle) ? precedente : undefined,
    structuralSharing: (courante, recue) =>
      conserverVersionsPage(courante as PageOuvrages | undefined, recue as PageOuvrages),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });
};
