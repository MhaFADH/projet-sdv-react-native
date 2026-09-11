import type { Ouvrage, PageOuvrages } from '@/domain/ouvrage';
import type { CouvertureResolue } from '@/services/couvertures';
import type { AvisReessai } from './avis-echec-bascule';

export type OuvrageIllustre = {
  ouvrage: Ouvrage;
  couverture: CouvertureResolue;
};

type PageFonds = Omit<PageOuvrages, 'items'> & { items: OuvrageIllustre[] };

export type CoupsDeCoeurFonds = {
  basculer: (ouvrage: Ouvrage) => void;
  enCours: (id: string) => boolean;
  erreur: (id: string) => AvisReessai | undefined;
};

type SelectionFonds = {
  identifiants: ReadonlySet<string>;
  basculer: (id: string) => void;
  demanderSuppression: () => void;
  suppressionDesactivee: boolean;
};

export type EtatFonds =
  | { type: 'chargement' }
  | { type: 'erreur'; message: string; reessayer: () => void }
  | {
      type: 'succes';
      page: PageFonds;
      pagePrecedente: () => void;
      pageSuivante: () => void;
      ouvrirOuvrage: (id: string) => void;
      selection: SelectionFonds;
      coupsDeCoeur: CoupsDeCoeurFonds;
      masquageTemporaire?: boolean;
      pageEnChargement?: number;
      erreurActualisation?: { message: string; reessayer: () => void };
    };
