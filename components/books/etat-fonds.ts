import type { PageOuvrages } from '@/domain/ouvrage';
import type { CoupsDeCoeurFonds } from './ouvrages-list';

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
      page: PageOuvrages;
      pagePrecedente: () => void;
      pageSuivante: () => void;
      ouvrirOuvrage: (id: string) => void;
      selection: SelectionFonds;
      coupsDeCoeur: CoupsDeCoeurFonds;
      masquageTemporaire?: boolean;
      pageEnChargement?: number;
      erreurActualisation?: { message: string; reessayer: () => void };
    };
