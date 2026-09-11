import { useQuery } from '@tanstack/react-query';
import { conserverOuvragePlusRecent, identifiantUtilisable, type Ouvrage } from '@/domain/ouvrage';
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
    structuralSharing: (courant, recu) => {
      const ouvrageRecu = recu as Ouvrage;
      const ouvrageCourant = courant as Ouvrage | undefined;
      return ouvrageCourant ? conserverOuvragePlusRecent(ouvrageCourant, ouvrageRecu) : ouvrageRecu;
    },
  });
