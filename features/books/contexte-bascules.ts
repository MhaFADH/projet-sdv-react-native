import { createContext } from 'react';
import type { AvisReessai } from '@/components/books/avis-echec-bascule';
import type { IntentionBascule } from '@/domain/bascule-ouvrage';
import type { IntentionNotation } from '@/domain/notation-ouvrage';
import type { Ouvrage } from '@/domain/ouvrage';

export type ContexteBascules = {
  basculer: (intention: IntentionBascule) => void;
  noter: (intention: IntentionNotation) => void;
  modificationEnCours: (id: string) => boolean;
  appliquerModificationEnCours: (ouvrage: Ouvrage) => Ouvrage;
  erreurModification: (id: string) => AvisReessai | undefined;
  erreurBascule: (id: string) => AvisReessai | undefined;
  erreurActualisation: (id: string) => AvisReessai | undefined;
};

export const BasculesContext = createContext<ContexteBascules | null>(null);
