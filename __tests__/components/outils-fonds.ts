import type { CoupsDeCoeurFonds, OuvrageIllustre } from '../../components/books/etat-fonds';
import type { Ouvrage } from '../../domain/ouvrage';

export const illustrerOuvrage = (ouvrage: Ouvrage): OuvrageIllustre => ({
  ouvrage,
  couverture: { type: 'locale' },
});

export const creerCoupsDeCoeurInertes = (
  remplacements: Partial<CoupsDeCoeurFonds> = {},
): CoupsDeCoeurFonds => ({
  basculer: () => {},
  enCours: () => false,
  erreur: () => undefined,
  ...remplacements,
});
