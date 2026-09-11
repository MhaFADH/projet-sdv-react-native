import { configuration } from '@/services/configuration';
import type { ErreurApplication } from './erreurs';

export const DELAI_REESSAI_MS = configuration.delaiReessaiMs;

const NOMBRE_REESSAIS_AUTOMATIQUES = configuration.nombreReessaisAutomatiques;

export const autoriserReessai = (nombreEchecs: number, erreur: ErreurApplication): boolean =>
  nombreEchecs < NOMBRE_REESSAIS_AUTOMATIQUES && erreur.type === 'reseau' && erreur.reessayable;

export const MODE_RESEAU_BASCULE = 'always' as const;
