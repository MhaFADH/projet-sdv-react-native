import type { CoupsDeCoeurFonds } from '../../components/books/ouvrages-list';

export const creerCoupsDeCoeurInertes = (
  remplacements: Partial<CoupsDeCoeurFonds> = {},
): CoupsDeCoeurFonds => ({
  basculer: () => {},
  enCours: () => false,
  erreur: () => undefined,
  ...remplacements,
});
