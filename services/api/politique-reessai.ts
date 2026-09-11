import type { ErreurApplication } from './erreurs';

export const DELAI_REESSAI_MS = 1_000;

const NOMBRE_REESSAIS_AUTOMATIQUES = 1;

export const autoriserReessai = (nombreEchecs: number, erreur: ErreurApplication): boolean =>
  nombreEchecs < NOMBRE_REESSAIS_AUTOMATIQUES && erreur.type === 'reseau' && erreur.reessayable;

export const MODE_RESEAU_BASCULE = 'always' as const;
