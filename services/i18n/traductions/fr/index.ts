import { communsFr } from './communs';
import { ecritureFr } from './ecriture';
import { ficheFr } from './fiche';
import { fondsFr } from './fonds';
import { notesFr } from './notes';
import { preferencesFr } from './preferences';

export const fr = {
  ...preferencesFr,
  ...fondsFr,
  ...ficheFr,
  ...ecritureFr,
  ...notesFr,
  ...communsFr,
} as const;
