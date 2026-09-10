import { useQuery } from '@tanstack/react-query';
import type { NoteLecture } from '@/domain/note-lecture';
import { identifiantUtilisable } from '@/domain/ouvrage';
import type { ErreurApplication } from '@/services/api/erreurs';
import { recupererNotes } from '@/services/api/notes-api';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesNotes } from './cles-notes';

export const useNotes = (livreId: string, active: boolean) =>
  useQuery<NoteLecture[], ErreurApplication>({
    queryKey: clesNotes.ouvrage(livreId),
    queryFn: ({ signal }) => recupererNotes(livreId, signal),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
    enabled: active && identifiantUtilisable(livreId),
  });
