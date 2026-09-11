import { createContext } from 'react';
import type { AvisReessai } from '@/components/books/avis-echec-bascule';
import type { IntentionBascule } from '@/domain/bascule-ouvrage';
import type { Ouvrage } from '@/domain/ouvrage';

export type ContexteBascules = {
  basculer: (intention: IntentionBascule) => void;
  basculeEnCours: (id: string) => boolean;
  appliquerBasculeEnCours: (ouvrage: Ouvrage) => Ouvrage;
  erreurBascule: (id: string) => AvisReessai | undefined;
  erreurActualisation: (id: string) => AvisReessai | undefined;
};

export const BasculesContext = createContext<ContexteBascules | null>(null);
